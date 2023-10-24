import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import "./App.scss";
import {
  Environment,
  MeshTransmissionMaterial,
  OrthographicCamera,
  Plane,
  PresentationControls,
  Text,
  useFBO,
  useTexture
} from "@react-three/drei";

import React, { useEffect, useMemo, useRef } from "react";
import showcaseFragmentShader from "./shaders/transition/fragment.glsl";
import showcaseVertexShader from "./shaders/transition/vertex.glsl";
import { PMREMGenerator, Scene } from "three";
import { useControls } from "leva";
import { Pyramid } from "./Pyramid";
import { landingPageConfig, state, testConfig } from "./state";
import { useSnapshot } from "valtio";
import { Tunnel } from "./Tunnel";

const MainWorld = () => {

  const snapshot = useSnapshot(state)

  const textureList = useTexture(snapshot.projectList.map(project => project.thumbnail))

  const gl = useThree(state => state.gl)

  const pmremGenerator = new PMREMGenerator(gl)

  const envList = useMemo(() => textureList.map(texture => pmremGenerator.fromEquirectangular(texture).texture), [])

  const {landing} = useControls({
    landing: true
  })

  useEffect(() => {
    state.mode = landing ? "landing" : "showcase"
  }, [landing]);


  return <>
    {(snapshot.mode === "showcase") && <>
      <Text font={"/ClashDisplay-Regular.woff"} scale={0.2} position={[-0.75, 0, 2]}>
        {snapshot.projectList[snapshot.currentProjectIndex].name}
      </Text>

      <Text font={"/ClashDisplay-Regular.woff"} scale={0.08} position={[-0.75, -0.15, 2]}>
        Discover
      </Text>

    </>
    }
    {(snapshot.mode === "landing") && <>
      <Text font={"/ClashDisplay-Regular.woff"} position={[0, 0, -1]}>{"Creative \n Technologist"}</Text>
    </>
    }

    <Environment map={snapshot.mode === "showcase" ? envList[snapshot.currentProjectIndex] : undefined} blur={0.5}
                 files={snapshot.mode === "showcase" ? undefined : "/skybox.hdr"}/>

  </>
}
const Experience = () => {
  const tunnelScene = new Scene();
  const tunnelCameraRef = useRef(null!);

  const tunnelRenderTarget = useFBO(2048, 2048);
  const meshTransmissionMaterialRef = useRef();
  const showcaseMaterialRef = useRef(null!);
  const snapshot = useSnapshot(state);

  const config = landingPageConfig;

  const {progress} = useControls({progress: {value: 0, min: 0, max: 1}})

  const {viewport} = useThree();

  const showcaseUniforms = useMemo(() => ({
    uTime: {value: 0},
    uTexture: {value: tunnelRenderTarget.texture},
    uProgress: {value: 0},
    uResolution: {value: [viewport.width, viewport.height]},
  }), []);

  useFrame((state) => {
    const {gl, clock} = state;

    gl.setRenderTarget(tunnelRenderTarget);
    gl.clear();
    gl.render(tunnelScene, tunnelCameraRef.current);

    showcaseMaterialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    showcaseMaterialRef.current.uniforms.uProgress.value = progress;
    showcaseMaterialRef.current.uniforms.uTexture.value = tunnelRenderTarget.texture;


    gl.setRenderTarget(null);
  });

  return (<>
    {createPortal(<>
      <OrthographicCamera
        ref={tunnelCameraRef}
        makeDefault={true}
        args={[-1, 1, 1, -1, 0, 1]}
        position={[0, 0, 0.01]}
        zoom={1000}
      />
      <Tunnel/>
    </>, tunnelScene)}

<group position={[0,0,-20]} scale={5}>

    <PresentationControls zoom={3}>
      <Pyramid progress={progress} >
        <MeshTransmissionMaterial ref={meshTransmissionMaterialRef} envMapIntensity={3} {...config} />
      </Pyramid>
    </PresentationControls>
    <MainWorld/>

</group>

    <Plane position={[0,0,0]} args={[viewport.width, viewport.height]}>
      <shaderMaterial ref={showcaseMaterialRef}  transparent={true} uniforms={showcaseUniforms} vertexShader={showcaseVertexShader}
                      fragmentShader={showcaseFragmentShader}/>
    </Plane>
  </>)
}

function App() {

  const snapshot = useSnapshot(state)
  const onPrevious = () => {
    if (snapshot.currentProjectIndex === 0) {
      state.currentProjectIndex = snapshot.projectList.length - 1;
      return;
    }
    state.currentProjectIndex = snapshot.currentProjectIndex - 1;
  }

  const onNext = () => {
    state.currentProjectIndex = (snapshot.currentProjectIndex + 1) % snapshot.projectList.length;
  }
  return (
    <>
      <Canvas camera={{position: [0, 0, 5], fov: 35}}>
        <color attach="background" args={["#13131c"]}/>
        <pointLight position={[0, 5, 0]} intensity={1} color="white"/>
        <Experience/>
      </Canvas>
    </>);
}

export default App;
