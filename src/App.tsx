import { Canvas, useFrame, useThree } from "@react-three/fiber";
import "./App.scss";
import { OrbitControls, useTexture, Text, Sphere, Environment } from "@react-three/drei";

import React, { useEffect, useMemo, useRef } from "react";
import fragmentShader from "./shaders/particles/fragmentShader";
import vertexShader from "./shaders/particles/vertexShader";
import * as THREE from "three-stdlib";
import { PMREMGenerator, Vector2 } from "three";
import { useControls } from "leva";
import { Pyramid } from "./Pyramid";
import { LogoShard } from "./LogoShard";
import {state} from "./state";
import {useSnapshot} from "valtio";
const Scene = () => {


  const texture = useTexture('/project2.png')

  const gl = useThree(state => state.gl)

  const pmremGenerator = new PMREMGenerator(gl)

  const newTexture = pmremGenerator.fromEquirectangular(texture).texture

  const {landing} = useControls({
      landing: true
  })

  useEffect(() => {
    state.mode = landing ? 'landing' : 'showcase'
  }, [landing]);

  const snapshot = useSnapshot(state)

  return <>

    {/*<LogoShard scale={0.5} rotation-x={-Math.PI / 2} position={[1, 0, 0]}/>*/}
    <Pyramid  position={snapshot.mode === 'landing' ? [0,0,0] : [1, 0, 2]}/>
    {(snapshot.mode === 'showcase') && <>
      <Text font={'/ClashDisplay-Regular.woff'} scale={0.2} position={[-0.5, 0, 2]}>
        Avatopia
      </Text>

      <Text font={'/ClashDisplay-Regular.woff'} scale={0.08} position={[-0.5, -0.15, 2]}>
        Discover
      </Text>

    </>
    }
    {(snapshot.mode === 'landing') && <>
      <Text font={'/ClashDisplay-Regular.woff'} position={[0,0,-1]}>{"Creative \n Technologist"}</Text>
    </>
    }

    <Environment map={snapshot.mode === 'showcase' ? newTexture: undefined} blur={0.5} files={snapshot.mode === 'showcase' ? undefined: '/skybox.hdr'}/>

  </>
}


function App() {
  return (
    <>
      <Canvas camera={{position: [0, 0, 5], fov: 35}}>
        <color attach="background" args={["#13131c"]}/>
        <Scene/>
        <pointLight position={[0, 5, 0]} intensity={1} color="white"/>
        <OrbitControls enabled={false}/>

      </Canvas>
    </>);
}

export default App;
