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
import { AdditiveBlending, Color, Group, PMREMGenerator, Scene, Texture, Vector2 } from "three";
import { useControls } from "leva";
import { Pyramid } from "./Pyramid";
import { landingPageConfig, state } from "./state";
import { useSnapshot } from "valtio";
import { Tunnel } from "./Tunnel";
import gsap from "gsap";


const HeadlineTitle = ({timeline, content}: { timeline: gsap.core.Timeline, content: { title: string } }) => {
  const textRef = useRef(null!);

  useEffect(() => {
    const tl = gsap.timeline();
    timeline.add(
      tl.fromTo(textRef.current, {fillOpacity: 0, outlineOpacity: 0}, {
        fillOpacity: 1, outlineOpacity: 1, onUpdate: () => {
          state.currentColor.lerp(new Color("#ffffff"), tl.progress());
        }
      })
        .to(textRef.current, {fillOpacity: 0, outlineOpacity: 0, delay: 0.5})
    )

  }, []);


  return <>
    <Text ref={textRef} font={"/ClashDisplay-Regular.woff"} fontSize={0.2} position={[0, 0, 1.5]} outlineColor={"black"}
          outlineBlur={0.00} outlineWidth={0.002} fillOpacity={0}>
      {content.title}
    </Text>
  </>
}

const ProjectCard = ({timeline, content}: {
  timeline: gsap.core.Timeline,
  content: { thumbnail: Texture, title: string, dominantColor: string }
}) => {
  const materialRef = useRef(null!);
  const textRef = useRef(null!);
  const scopeRef = useRef(null!);
  useEffect(() => {


    const context = gsap.context(
      () => {

        console.log(materialRef.current)
        const tl = gsap.timeline();
        timeline.add(tl.fromTo(materialRef.current, {opacity: 0}, {
          opacity: 1, onUpdate: () => {
            state.currentColor.lerpHSL(new Color(content.dominantColor), tl.progress());
          }
        })
          .fromTo(textRef.current, {fillOpacity: 0, outlineOpacity: 0}, {fillOpacity: 1, outlineOpacity: 1}, "<"))

        timeline.add(gsap.timeline({delay: 0.5}).to(materialRef.current, {opacity: 0})
          .to(textRef.current, {fillOpacity: 0, outlineOpacity: 0}, "<"))


      }, [scopeRef]
    )

    return () => context.revert();

  }, []);
  return <group ref={scopeRef}>
    <Plane position={[0, 0, 1]} args={[2, 1]}>
      <meshBasicMaterial ref={materialRef} opacity={0} transparent={true} map={content.thumbnail}/>
    </Plane>

    <Text ref={textRef} font={"/ClashDisplay-Regular.woff"} fontSize={0.2} position={[0, 0, 1.5]} outlineColor={"black"}
          outlineBlur={0.00} outlineWidth={0.002} outlineOpacity={0} fillOpacity={0}>
      {content.title}
    </Text>
  </group>
}
const ContentPortal = ({timeline}: {
  timeline: gsap.core.Timeline,
}) => {
  const snapshot = useSnapshot(state);
  const textureList = useTexture(snapshot.projectList.map(project => project.thumbnail))

  const scroll = useScroll();

  const contentList = [
    {
      title: "Create immersive projects"
    },
    {
      title: "Animate anything",
      thumbnail: textureList[0],
      dominantColor: "#C000BE"
    },
    {
      title: "Avatopia",
      thumbnail: textureList[1],
      dominantColor: "#008E9F"

    }
  ]


  const groupRef = useRef<Group>(null!);
  useFrame((state) => {
    groupRef.current.position.set(0, 0,  -6 + scroll.offset * 4 * contentList.length);
    groupRef.current.children.forEach((child, index) => {
      child.scale.set(0.1 + scroll.offset, 0.1 + scroll.offset, 0.1 + scroll.offset)
      child.rotation.x = -state.mouse.y * 0.25;
      child.rotation.y = state.mouse.x * 0.25;
    })


  });
  return <group ref={groupRef}>
    {
      contentList.map((content, index) => {
        return <group key={`content-${index}`} position={[0, 0, (-2.5) * index]}>

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

  const pyramidRotationSpeed = useRef({value: 0});
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
    uColor: {value: new Color("#ffffff")},
    uColorFactor: {value: 0.0}
  }), []);

  const pointsRef = useRef(null!);
  const scroll = useScroll();
  const timelineRef = useRef(gsap.timeline({paused: true}));
  const subtimelineRef = useRef(gsap.timeline());
  const mainTextRef = useRef(null!);
  const pyramidRef = useRef(null!);

  useEffect(() => {
    timelineRef.current
      .fromTo(mainTextRef.current, {fillOpacity: 1, outlineOpacity: 1}, {fillOpacity: 0, outlineOpacity: 0})
      .fromTo(pyramidRotationSpeed.current, {value: 1}, {value: 15, duration: 5.0, ease: "expo.out"}, "-=1")
      .fromTo(pyramidRef.current.scale, {x: 1,y: 1, z:1}, {x: 1.5,y: 1.5, z:1.5, duration: 5.0, ease: "power1.in"}, "<")
      .to(showcaseMaterialRef.current.uniforms.uProgress, {
        value: 1,
        duration: 2,
      })
      .to(pointsRef.current.material.uniforms.uProgress, {
        value: 1,
        duration: 2,
      }, "<")


    subtimelineRef.current.progress(0);
    timelineRef.current.add(subtimelineRef.current);


  }, []);

  useFrame((state, delta) => {
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


    if (snapshot.currentColor.r >= 0.75 && snapshot.currentColor.g >= 0.75 && snapshot.currentColor.b >= 0.75) {
      gsap.to(pointsRef.current.material.uniforms.uColorFactor, {value: 0.0});
    } else {
      gsap.to(pointsRef.current.material.uniforms.uColorFactor, {value: 1.0});
    }
    pointsRef.current.material.uniforms.uColor.value = snapshot.currentColor;

    gl.setRenderTarget(null);


      pyramidRef.current.rotation.y += delta * 0.5 * pyramidRotationSpeed.current.value;
      pyramidRef.current.rotation.x += delta * 0.1 * pyramidRotationSpeed.current.value;


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
        <Pyramid ref={pyramidRef}>
          <MeshTransmissionMaterial ref={meshTransmissionMaterialRef} envMapIntensity={3} {...config} />
        </Pyramid>
      </PresentationControls>
      <MainWorld/>


    </group>

    <Text ref={mainTextRef} font={"/ClashDisplay-Regular.woff"} position={[0, 0, -25]}
          scale={5}>{"Creative \n Technologist"}</Text>

    <Environment
      files={"/skybox.hdr"}/>

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
    <ScrollControls pages={8}>
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
