import {OrthographicCamera, Plane} from '@react-three/drei';
import {useMemo, useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import vertexShader from './shaders/tunnel/vertex.glsl';
import fragmentShader from './shaders/tunnel/fragment.glsl';
import {Vector2} from 'three';

export const Tunnel = () => {


  const uniforms = useMemo(() => ({
    uTime: { value: 0.0 },
    uResolution: { value: new Vector2() }
  }), [])


  const planeRef = useRef();
  useFrame((state, delta) => {
    if (planeRef.current) {
      planeRef.current.material.uniforms.uTime.value = state.clock.elapsedTime
      planeRef.current.material.uniforms.uResolution.value = new Vector2(2048, 2048 )
    }
  })
  return (
    <>
      <Plane ref={planeRef} args={[2, 2, 64,64]} position={[0, 0, 0]} >
        <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader}/>
      </Plane>
    </>
  )
}
