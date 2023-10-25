uniform vec2 uResolution;
uniform float uTime;

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

vec3 curve(vec3 p) {
    // Parameters to control the looping curve
    float frequency = 0.5+ ((cos(uTime *0.1) + 1.0) *0.5) * 0.2;
    float amplitude = 0.2+ ((sin(uTime *0.1) + 1.0) *0.5) * 0.3;

    // Calculate looping sine-based curve
    vec2 curveOffset = amplitude * vec2(sin(frequency * p.z + uTime), cos(frequency * p.z + uTime));

    // Combine the curve with a twist (rolling effect)
    float twistAmount = 0.5;
    float angle = twistAmount * curveOffset.x; // Use one of the curve dimensions for rolling
    mat2 twist = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

    p.xy = twist * (p.xy + curveOffset);

    return p;
}



vec3 curveTangent(float z) {
    // Parameters to match the curve function
    float frequency = 0.5+ ((cos(uTime *0.1) + 1.0) *0.5) * 0.2;
    float amplitude = 0.2+ ((sin(uTime *0.1) + 1.0) *0.5) * 0.3;

    // Derivative of the curve functions with respect to z
    vec2 tangentOffset = amplitude * frequency * vec2(cos(frequency * z + uTime), -sin(frequency * z + uTime));

    // Given that the twist (roll) effect is dependent on the x component of the curveOffset, the derivative of the twist in the x direction needs to be considered. However, for simplicity and to avoid overly complicating the curve, the twist effect is not factored into the tangent computation here. This might be a simplification, but it helps in understanding and maintaining the code. If the exact tangent including the twist is needed, this function would require further modification.

    // Constructing a 3D tangent vector, where the tangent influences only the xy plane and the z direction remains constant.
    return normalize(vec3(tangentOffset.x, tangentOffset.y, 1.0));
}

// Infinite cylinder along z-axis SDF
float cylinder(vec3 p, float r) {
    return length(p.xy) - r;
}


float fbm(vec3 position) {
    float total = 0.0;
    float persistence = 0.5;
    float amplitude = 1.0;

    for(int i = 0; i < 8; i++) {
        total += noise(position * amplitude) * persistence;
        amplitude *= 2.0;
        persistence *= 0.5;
    }

    return total;
}

vec3 getNormal(vec3 p) {
    float eps = 0.001;
    vec2 e = vec2(eps, 0.0);
    return normalize(vec3(
    cylinder(p + e.xyy, 0.5) - cylinder(p - e.xyy, 0.5),
    cylinder(p + e.yxy, 0.5) - cylinder(p - e.yxy, 0.5),
    cylinder(p + e.yyx, 0.5) - cylinder(p - e.yyx, 0.5)
    ));
}
// Pseudo-random number generator (PRNG)
float rand(float seed) {
    return fract(sin(seed) * 43758.5453);
}

float raymarch(vec3 ro, vec3 rd) {
    float t = 0.0;
    float intensity = 0.0;
    for (int i = 0; i < 256*2; i++) {
        vec3 p = ro + rd * t;

        float n = fbm(p * 2.0);
        vec3 curvedP = curve(p - n *0.4);
        float d = -cylinder(curvedP, 0.5);

        if (d < 0.0001) {

            vec3 lightPos = vec3(curvedP.xy, curvedP.z - 0.);
            vec3 normal = -getNormal( lightPos);

            // Light direction: from current point towards the ray origin
            vec3 lightDir = normalize(ro - lightPos);
            float diff = max(dot(normal, lightDir), 0.0);

            // Light falloff
            float distToLight = length(ro - lightPos);
            float falloff = 1.0 / (distToLight * distToLight + 1.0);  // Adding 1 to avoid division by zero


            vec3 lightPos2 = vec3(curvedP.xy, curvedP.z - 1.5);

            vec3 normal2 = -getNormal( lightPos2);

            // Light direction: from current point towards the ray origin
            vec3 lightDir2 = normalize(ro - lightPos2);
            float diff2 = max(dot(normal2, lightDir2), 0.0);

            // Light falloff
            float distToLight2 = length(ro - lightPos2);
            float falloff2 = 1.0 / (distToLight2 * distToLight2 + 1.0);  // Adding 1 to avoid division by zero



            intensity = diff * falloff * 1. + diff2 * falloff2 * 1.5 ;  // Multiply by a constant to increase overall brightness

            intensity +=0.1;

            return intensity;
        }

        t += d;
        if (t > 1000.0) break;
    }
    return 0.0; // No hit
}

vec3 colorizeFBM(float fbmValue) {
    // Define the color stops and their corresponding colors
    float stops[4];

    stops[0] = 0.0;
    stops[1] = 0.33;
    stops[2] = 0.66;
    stops[3] = 1.0;
    vec3 colors[4];

   // vec3 red3 = vec3(47.0 / 255.0, 22.0 / 255.0, 22.0 / 255.0);  // #2F1616
   // vec3 red2 = vec3(161.0 / 255.0, 62.0 / 255.0, 34.0 / 255.0); // #A13E22
   // vec3 red1 = vec3(227.0 / 255.0, 224.0 / 255.0, 195.0 / 255.0) -0.4;// #E3E0C3
   // vec3 red0 = vec3(221.0 / 255.0, 150.0 / 255.0, 86.0 / 255.0) -0.5; // #DD9656

    vec3 blue3 = vec3(0.094,0.106,0.125);  // #2F1616
    vec3 blue2 = vec3(0.18,0.243,0.302); // #A13E22
    vec3 blue1 = vec3(0.341,0.459,0.592);// #E3E0C3
    vec3 blue0 = vec3(0.639,0.635,0.737); // #DD9656

    //Cloudy whitish colors
    vec3 red3 = vec3(0.7,0.7,0.7);  // #2F1616
    vec3 red2 = vec3(0.5,0.5,0.5); // #A13E22
    vec3 red1 = vec3(0.45,0.45,0.45);// #E3E0C3
    vec3 red0 = vec3(0.3,0.3,0.3); // #DD9656

    //colors[3] = mix(red3, blue3,(sin(uTime * 0.5) + 1.0) *0.5 );
    //colors[2] = mix(red2, blue2,(sin(uTime * 0.5) + 1.0) *0.5 );
    //colors[1] = mix(red1, blue1,(sin(uTime * 0.5) + 1.0) *0.5 );
    //colors[0] = mix(red0, blue0,(sin(uTime * 0.5) + 1.0) *0.5 );


    colors[3] = red3;
    colors[2] = red2;
    colors[1] = red1;
    colors[0] = red0;
    // Interpolate between colors based on the fbmValue
    vec3 finalColor = vec3(0.0);
    for (int i = 0; i < 3; i++) {
        float t = smoothstep(stops[i], stops[i + 1], fbmValue);
        finalColor += mix(colors[i], colors[i + 1], t);
    }

    return finalColor;
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / min(uResolution.y, uResolution.x);

    vec3 ro = vec3(0.0, 0.0, uTime);
    vec3 curveOffset = curve(vec3(0.0, 0.0, uTime));
    ro.xy -= curveOffset.xy; // Keep the camera at the center by counteracting the bending

    vec3 tangent = curveTangent(ro.z);
    vec3 side = cross(tangent, vec3(0.0, 1.0, 0.0));  // Compute a "side" vector using the tangent and up vector
    vec3 up = cross(side, tangent);  // Compute the adjusted up vector

    // Build the ray direction based on these vectors
    vec3 adjustedForward = tangent;
    vec3 adjustedRight = side;
    vec3 adjustedUp = up;

    // Combine the original uv with the adjusted basis vectors to get the final ray direction
    vec3 rd = normalize(adjustedRight * uv.x + adjustedUp * uv.y + adjustedForward);

    float h = raymarch(ro, rd);

    float lightIntensity = raymarch(ro, rd);

    vec3 col;
    if (lightIntensity > 0.0) {
        vec3 p = ro + rd * h;
        float n = fbm(p * 4.0);  // Use FBM instead of simple noise

        // Colorize the FBm noise using the color ramp
        vec3 fbmColor = colorizeFBM(n);
        col = fbmColor * lightIntensity ;
    } else {
        col = vec3(0.0); // Background color
    }

    gl_FragColor = vec4(col, 1.0);
}
