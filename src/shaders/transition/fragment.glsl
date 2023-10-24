uniform sampler2D uTexture;
uniform float uTime;
uniform float uProgress;
uniform vec2 uResolution;

varying vec2 vUv;

void main() {

    vec2 st = vUv;

    // Aspect ratio for the viewport and the texture
    float viewportAspectRatio = uResolution.x / uResolution.y;
    float textureAspectRatio = 1.0; // Assuming square texture. Adjust if you know the texture's aspect ratio.

    // Depending on the dominant dimension, scale the UV coordinates
    if (viewportAspectRatio > textureAspectRatio) {
        st.y = (1.0 - textureAspectRatio / viewportAspectRatio) * 0.5 + vUv.y * textureAspectRatio / viewportAspectRatio;
    } else {
        st.x = (1.0 - viewportAspectRatio / textureAspectRatio) * 0.5 + vUv.x * viewportAspectRatio / textureAspectRatio;
    }


    vec2 offsetSt = st;

    offsetSt.y -= 0.15;

    float strength = 1.0  - pow(distance(st, vec2(0.5)) * 4.0, 1.0);
    float timing =  clamp(sin(uTime * 0.1) * 0.5 + 0.5, 0.0, 1.0);


    gl_FragColor = vec4(texture2D(uTexture, st).rgb, clamp(strength, 0.0, 1.0));
}
