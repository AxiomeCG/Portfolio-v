/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, {useRef} from 'react';
import {Environment, MeshTransmissionMaterial, useGLTF, useTexture, Text} from '@react-three/drei';
import {useFrame, useThree} from '@react-three/fiber';
import {useControls} from 'leva';
import {Color, PMREMGenerator} from 'three';

export function Pyramid(props) {
    const {nodes, materials} = useGLTF('/pyramid-rounded2.glb');

    const texture = useTexture('/project2.png')
    const meshRef = useRef();


    useFrame((state, delta) => {

        meshRef.current.rotation.y += delta *0.5;
        meshRef.current.rotation.x += delta *0.1;
    })


    const config = useControls({
        meshPhysicalMaterial: false,
        transmissionSampler: false,
        backside: true,
        samples: {value: 10, min: 1, max: 32, step: 1},
        resolution: {value: 2048, min: 256, max: 2048, step: 256},
        transmission: {value: 1, min: 0, max: 1},
        roughness: {value: 0.0, min: 0, max: 1, step: 0.01},
        thickness: {value: 3.5, min: 0, max: 10, step: 0.01},
        ior: {value: 1.5, min: 1, max: 5, step: 0.01},
        chromaticAberration: {value: 0.06, min: 0, max: 1},
        anisotropy: {value: 0.1, min: 0, max: 1, step: 0.01},
        distortion: {value: 0.0, min: 0, max: 1, step: 0.01},
        distortionScale: {value: 0.3, min: 0.01, max: 1, step: 0.01},
        temporalDistortion: {value: 0.5, min: 0, max: 1, step: 0.01},
        clearcoat: {value: 1, min: 0, max: 1},
        attenuationDistance: {value: 0.5, min: 0, max: 10, step: 0.01},
        attenuationColor: '#ffffff',
        color: '#3b3b3b',
    })

    const gl = useThree(state => state.gl)

    const pmremGenerator = new PMREMGenerator(gl)

    const newTexture = pmremGenerator.fromEquirectangular(texture).texture

    const fontProps = { font: '/ClashDisplay-Regular.woff', fontSize: 2.5, letterSpacing: -0.05, lineHeight: 1, 'material-toneMapped': false }

    return (
        <group {...props} dispose={null}>
            <mesh ref={meshRef}
                  castShadow
                  receiveShadow
                  geometry={nodes.Cone.geometry}
                  position={[1,0,0]}
            >
                {/*<MeshRefractionMaterial envMap={texture} ior={1.02} bounces={5} fresnel={5} aberrationStrength={0.01}/>*/}
                <MeshTransmissionMaterial envMapIntensity={3} {...config} />
            </mesh>

            <Text font={ '/ClashDisplay-Regular.woff'} scale={0.1} position={[-0.25,0,1]}>
                Avatopia
            </Text>

            <Text font={ '/ClashDisplay-Regular.woff'} scale={0.02} position={[-0.25,-0.1,1]}>
                Discover
            </Text>

            <Environment map={newTexture}/>
        </group>
    );
}

useGLTF.preload('/pyramid-rounded2.glb');