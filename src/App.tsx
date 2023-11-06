import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import "./App.scss";
import {
  Environment,
  MeshTransmissionMaterial,
  OrthographicCamera,
  Plane,
  Points,
  PresentationControls,
  ScrollControls,
  Text,
  useFBO,
  useScroll,
  useTexture
} from "@react-three/drei";

import React, { useEffect, useMemo, useRef } from "react";
import showcaseFragmentShader from "./shaders/transition/fragment.glsl";
import showcaseVertexShader from "./shaders/transition/vertex.glsl";

import vortexFragmentShader from "./shaders/vortex/fragment.glsl";
import vortexVertexShader from "./shaders/vortex/vertex.glsl";
import { AdditiveBlending, Group, PMREMGenerator, Scene, Texture, Vector2 } from "three";
import { useControls } from "leva";
import { Pyramid } from "./Pyramid";
import { landingPageConfig, state } from "./state";
import { useSnapshot } from "valtio";
import { Tunnel } from "./Tunnel";
import gsap from "gsap";


const HeadlineTitle = ({timeline, content}: { timeline: gsap.core.Timeline, content: { title: string } }) => {
  const textRef = useRef(null!);

  useEffect(() => {
    timeline.fromTo(textRef.current, {fillOpacity: 0, outlineOpacity: 0}, {fillOpacity: 1, outlineOpacity: 1})
      .fromTo(textRef.current,{fillOpacity: 1, outlineOpacity: 1}, {fillOpacity: 0, outlineOpacity: 0})

  }, []);


  return <>
    <Text ref={textRef} font={"/ClashDisplay-Regular.woff"} fontSize={0.2} position={[0, 0, 1.5]} outlineColor={"black"}
          outlineBlur={0.01}>
      {content.title}
    </Text>
  </>
}

const ProjectCard = ({timeline, content}: {
  timeline: gsap.core.Timeline,
  content: { thumbnail: Texture, title: string }
}) => {
  const planeRef = useRef(null!);
  const textRef = useRef(null!);
  const scopeRef = useRef(null!);
  useEffect(() => {

    planeRef.current.material.opacity= 0;

    const context = gsap.context(
      () => {

        timeline
          .fromTo(planeRef.current.material, {opacity: 0}, {opacity: 1})
          .fromTo(textRef.current, {fillOpacity: 0, outlineOpacity: 0}, {fillOpacity: 1, outlineOpacity: 1}, "<")
          .fromTo(planeRef.current.material, {opacity: 1}, {opacity: 0})
          .fromTo(textRef.current, {fillOpacity: 1, outlineOpacity: 1}, {fillOpacity: 0, outlineOpacity: 0}, "<")
      }, [scopeRef]
    )

    return () => context.revert();

  }, []);
  return <group ref={scopeRef}>
   <Plane ref={planeRef} position={[0, 0, 1]} args={[2, 1]}>
      <meshBasicMaterial transparent={true} opacity={0} map={content.thumbnail}/>
    </Plane>

    <Text ref={textRef} font={"/ClashDisplay-Regular.woff"} fontSize={0.2} position={[0, 0, 1.5]} outlineColor={"black"}
          outlineBlur={0.01} outlineOpacity={0} fillOpacity={0}>
      {content.title}
    </Text>
  </group>
}
const ContentPortal = ({timeline}: { timeline: gsap.core.Timeline }) => {
  const snapshot = useSnapshot(state);
  const textureList = useTexture(snapshot.projectList.map(project => project.thumbnail))

  const scroll = useScroll();

  const contentList = [
    {
      title: "Create immersive projects"
    },
    {
      title: "Animate anything",
      thumbnail: textureList[0]
    },
    {
      title: "Avatopia",
      thumbnail: textureList[1]
    }
  ]


  const planeRef = useRef<Group>(null!);
  useFrame((state) => {
    planeRef.current.position.set(0, 0, scroll.offset * 4 * contentList.length);
    planeRef.current.children.forEach((child, index) => {
      child.scale.set(0.1 + scroll.offset, 0.1 + scroll.offset, 0.1 + scroll.offset)
      child.rotation.x = -state.mouse.y * 0.25;
      child.rotation.y = state.mouse.x * 0.25;
    })


  });
  return <group ref={planeRef}>
    {
      contentList.map((content, index) => {
        return <group key={`content-${index}`} position={[0, 0, (-4) * index]}>

          {content.thumbnail && <ProjectCard timeline={timeline} content={content}/>}
          {!content.thumbnail && <HeadlineTitle timeline={timeline} content={content}/>}
        </group>
      })
    }
  </group>
}
const MainWorld = () => {

  const snapshot = useSnapshot(state)


  const gl = useThree(state => state.gl)

  const pmremGenerator = new PMREMGenerator(gl)
  const textureList = useTexture(snapshot.projectList.map(project => project.thumbnail))

  const envList = useMemo(() => textureList.map(texture => pmremGenerator.fromEquirectangular(texture).texture), [])

  const {works} = useControls({
    works: false,
  })

  useEffect(() => {
    state.mode = works ? "works" : "landing"
  }, [works]);


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


const ScrollableExperience = () => {
  const tunnelScene = new Scene();
  const tunnelCameraRef = useRef(null!);

  const tunnelRenderTarget = useFBO(2048, 2048);
  const meshTransmissionMaterialRef = useRef();
  const showcaseMaterialRef = useRef(null!);
  const snapshot = useSnapshot(state);


  const positionsBuffer = useMemo(() => {
    const positions: number[] = [];

    for (let i = 0; i < 2000000 * 3; i += 3) {
      positions[i + 0] = (Math.random() * 2 - 1);
      positions[i + 1] = (Math.random() * 2 - 1);
      positions[i + 2] = (Math.random() * 2 - 1) * 0.15;
    }

    return new Float32Array(positions);

  }, []);

  const config = landingPageConfig;

  //const {progress} = useControls({progress: {value: 0.0, min: 0, max: 1}})
  const progressRef = useRef(0)

  useEffect(() => {
    if (snapshot.mode === "works") {
      gsap.to(progressRef, {current: 1, duration: 3})
    } else {
      gsap.to(progressRef, {current: 0, duration: 3})
    }
  }, [snapshot.mode]);

  const {viewport} = useThree();


  const showcaseUniforms = useMemo(() => ({
    uTime: {value: 0},
    uTexture: {value: tunnelRenderTarget.texture},
    uProgress: {value: 0},
    uResolution: {value: [viewport.width, viewport.height]},
  }), []);

  const vortexUniforms = useMemo(() => ({
    uTime: {value: 0},
    uProgress: {value: 0},
    uResolution: {value: [viewport.width, viewport.height]},
  }), []);

  const pointsRef = useRef(null!);
  const textureList = useTexture(snapshot.projectList.map(project => project.thumbnail))
  const scroll = useScroll();
  const timelineRef = useRef(gsap.timeline({paused: true}));
  const subtimelineRef = useRef(gsap.timeline());

  useEffect(() => {
    timelineRef.current.to(showcaseMaterialRef.current.uniforms.uProgress, {
      value: 1,
      duration: 1,
    })
      .to(pointsRef.current.material.uniforms.uProgress, {
        value: 1,
        duration: 1,
      }, "<")

    subtimelineRef.current.progress(0);
    timelineRef.current.add(subtimelineRef.current);
  }, []);

  useFrame((state) => {
    timelineRef.current.progress(scroll.offset);

    const {gl, clock} = state;

    gl.setRenderTarget(tunnelRenderTarget);
    gl.clear();
    gl.render(tunnelScene, tunnelCameraRef.current);

    showcaseMaterialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    //showcaseMaterialRef.current.uniforms.uProgress.value = progressRef.current;
    showcaseMaterialRef.current.uniforms.uTexture.value = tunnelRenderTarget.texture;
    showcaseMaterialRef.current.uniforms.uResolution.value = new Vector2(viewport.width, viewport.height);


    pointsRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
    //pointsRef.current.material.uniforms.uProgress.value = progressRef.current;
    pointsRef.current.material.uniforms.uResolution.value = new Vector2(viewport.width, viewport.height);

    gl.setRenderTarget(null);


  });
  return <>

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

    <group position={[0, 0, -20]} scale={5}>

      <PresentationControls zoom={3}>
        <Pyramid progress={progressRef.current}>
          <MeshTransmissionMaterial ref={meshTransmissionMaterialRef} envMapIntensity={3} {...config} />
        </Pyramid>
      </PresentationControls>
      <MainWorld/>


    </group>

    <Points ref={pointsRef} positions={positionsBuffer}>
      <shaderMaterial blending={AdditiveBlending} depthTest={false} transparent={true} uniforms={vortexUniforms}
                      vertexShader={vortexVertexShader} fragmentShader={vortexFragmentShader}/>
    </Points>
    <Plane position={[0, 0, 0]} args={[viewport.width, viewport.height]}>
      <shaderMaterial ref={showcaseMaterialRef} transparent={true} uniforms={showcaseUniforms}
                      vertexShader={showcaseVertexShader}
                      fragmentShader={showcaseFragmentShader}/>
    </Plane>
    <ContentPortal timeline={subtimelineRef.current}/>
  </>
}
const Experience = () => {

  return (<>
    <ScrollControls pages={5} damping={1}>
      <ScrollableExperience/>
    </ScrollControls>
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
