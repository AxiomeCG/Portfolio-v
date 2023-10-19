uniform vec2 uResolution;
uniform float uTime;

// Sphere SDF (Signed Distance Function)
float sphereSDF(vec3 p, float r) {
    return length(p) - r;
}

// Cylinder SDF
float cylinderSDF(vec3 p, float radius) {
    float distToCenter = length(p.xy);
    float wallDist = abs(distToCenter - radius);
    return wallDist;
}

// Simple raymarcher
float raymarch(vec3 ro, vec3 rd) {
    float t = 0.0;
    for (int i = 0; i < 256; i++) {
        vec3 p = ro + rd * t;
        p.z = mod(p.z, 3.0);
        float d = cylinderSDF(p, 1.0);
        if (d < 0.001) return t;
        t += d;
        if (t > 20.0) break;
    }
    return -1.0;
}

float hash(float n) {
    return fract(sin(n) * 43758.5453);
}

float noise(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float n = p.x + p.y * 57.0 + 113.0 * p.z;
    return mix(mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
    mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
    mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
    mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
}


void main() {
    vec2 uv = (gl_FragCoord.xy / uResolution - 0.5) * 2.0;
    uv.y *= uResolution.y / uResolution.x;
    vec3 col = vec3(0.0);
    vec3 ro = vec3(0.0, 0.0,  -6. + uTime);
    vec3 rd = normalize(vec3(uv, 1.0)); // Ray direction

    float t = raymarch(ro, rd);
    if (t > 0.0) {
        vec3 p = ro + rd * t;
        float n = noise(p * 2.0);  // Adjust frequency with the multiplier
        col = mix(vec3(0.8, 0.4, 0.0), vec3(0.9, 0.8, 0.0), n);
    }

    gl_FragColor = vec4(col, 1.0);
}
