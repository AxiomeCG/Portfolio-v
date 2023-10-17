import { Canvas, useFrame } from "@react-three/fiber";
import "./App.scss";
import { OrbitControls, useTexture, Text, Sphere, Environment } from "@react-three/drei";

import React, { useEffect, useMemo, useRef } from "react";
import fragmentShader from "./shaders/particles/fragmentShader";
import vertexShader from "./shaders/particles/vertexShader";
import * as THREE from "three-stdlib";
import { Vector2 } from "three";
import { useControls } from "leva";
import { Pyramid } from "./Pyramid";
const Scene = () => {
  return <>
    <Pyramid/>
  </>
}


function App() {
  return (
    <>
      <Canvas camera={{position: [0, 0, 2]}}>
        <color attach="background" args={["#13131c"]}/>
        <Scene/>
        <pointLight position={[0, 5, 0]} intensity={1} color="white"/>
        <OrbitControls/>

      </Canvas>
    </>);
}

export default App;
