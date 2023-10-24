import {proxy} from 'valtio';
import {WebGLRenderTarget} from 'three';

export const state = proxy({
    mode: 'showcase',

    projectList: [
        {
            name: 'Animate Anything',
            client: 'Anything World',
            thumbnail: '/project1.png'
        }, {
            name: 'Avatopia',
            client: 'Anything World',
            thumbnail: '/project2.png'
        }
    ],
    currentProjectIndex: 0,
    fbo: null,
})


export const landingPageConfig =  {
    transmissionSampler: false,
    backside: true,
    samples: 16,
    resolution: 2048,
    transmission: 1,
    roughness: 0.25,
    thickness: 3.5,
    ior: 1.2,
    chromaticAberration: 0.25,
    anisotropy: 0.5,
    distortion: 0.0,
    distortionScale: 0.3,
    temporalDistortion:0.5,
    clearcoat: 1,
    attenuationDistance: 0.5,
    attenuationColor: '#ffffff',
    color: '#c3c3c3',
}

export const showcaseConfig =  {
    transmissionSampler: false,
    backside: true,
    samples: 16,
    resolution: 2048,
    transmission: 1,
    roughness: 0.0,
    thickness: 3.5,
    ior: 1.5,
    chromaticAberration: 0.06,
    anisotropy: 0.01,
    distortion: 0.0,
    distortionScale: 0.3,
    temporalDistortion:0.5,
    clearcoat: 1,
    attenuationDistance: 0.5,
    attenuationColor: '#ffffff',
    color: '#3b3b3b',
}


export const testConfig =  {
    transmissionSampler: false,
    backside: true,
    samples: 16,
    resolution: 2048,
    transmission: 1,
    roughness: 0.0,
    thickness: 3.5,
    ior: 1.2,
    chromaticAberration: 0.01,
    anisotropy: 0.01,
    distortion: 0.0,
    distortionScale: 0.3,
    temporalDistortion:0.5,
    clearcoat: 0,
    attenuationDistance: 0.5,
    attenuationColor: '#ffffff',
    color: '#ffffff',
}
