#define PI 3.1415926535897932384626433832795
//uniform float uProgress;
uniform float uTime;
uniform vec2 uResolution;

varying vec3 vPosition;
varying float vProgress;


vec2 getCircle(vec2 position, float radius)  {
    float theta = position.x * 2.0 * PI; // assuming position.x is pre-set to an angle value
    // Compute the x and y positions
    float x = radius * cos(theta);
    float y = radius * sin(theta);
    return vec2(x, y);
}

vec2 getTangent(vec2 position, float radius) {
    float theta = position.x * 2.0 * PI;

    float x = -radius * sin(theta);
    float y = radius * cos(theta);
    return normalize(vec2(x, y));
}

vec2 getNormal(vec2 position, float radius) {
    float theta = position.x * 2.0 * PI;

    //Second derivative of the equation of the circle

    float x = -radius * cos(theta);
    float y = -radius * sin(theta);
    return normalize(vec2(x, y));
}

//Gets a random value between 0 and 1
float rand(float seed) {
    return fract(sin(dot(vec2(seed * 0.1, seed * 0.2), vec2(12.9898, 78.233))) * 43758.5453);
}


// Simplex 2D noise
//
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}


float fbm( in vec2 p ){
    float s = 0.0;
    float m = 0.0;
    float a = 0.5;

    for( int i=0; i< 8; i++ ){
        s += a * snoise(p);
        m += a;
        a *= 0.5;
        p *= 2.0;
    }
    return s/m;
}


//	Simplex 3D Noise
//	by Ian McEwan, Ashima Arts
//
vec4 permute2(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise3D(vec3 v){
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    //  x0 = x0 - 0. + 0.0 * C
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1. + 3.0 * C.xxx;

    // Permutations
    i = mod(i, 289.0 );
    vec4 p = permute2( permute2( permute2(
    i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    // Gradients
    // ( N*N points uniformly over a square, mapped onto an octahedron.)
    float n_ = 1.0/7.0; // N=7
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    //Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
    dot(p2,x2), dot(p3,x3) ) );
}

void main() {

    //float uProgress = sin(uTime) * 0.5 + 0.5;
    float uProgress = 1.0;

    float radius = (uResolution.x * 0.4  + (pow(snoise(position.xy * 0.5 - uTime *0.5), 0.5) * 0.1)) * uProgress ;
    vec2 tangent = getTangent(position.xy, radius);
    vec2 normal = -getNormal(position.xy, radius);
    vec3 bitangent = normalize(cross(vec3(tangent, 0.0), vec3(normal, 0.0)));


    float theta = (position.x - uTime *0.2) * 2.0 * PI;  // Convert position.x to angle

    // This function peaks at every pi/8
    float beamInfluence = pow(cos(theta * 32.0 + fbm(position.xy + uTime * 0.1) * 150.0), 128.0) + fbm(position.xy + uTime * 0.1) * 0.5;  // Raise to power for sharpness

    vec2 displacement = tangent * (abs(fbm(position.xy)) + beamInfluence + fract(position.y + uTime)) * 0.45  + normal * abs(fbm(position.xy)) *0.02 ;
    vec2 perturbation = vec2(
        snoise(vec2(rand(position.x + uTime *0.1), rand(position.y + uTime *0.3))),
        snoise(vec2(rand(position.x + uTime *0.3), rand(position.y + uTime *0.1)))
    );  // This will give a value between [-0.1, 0.1]

    vec2 totalDisplacement = displacement * pow(4.0, uProgress) + perturbation * pow(2.0, uProgress) * 0.03 ;

    vec3 circularPosition = vec3((getCircle(position.xy , radius) + totalDisplacement * pow(uProgress, 0.75)), position.z);

    circularPosition -= snoise3D(circularPosition * 0.1 + uTime * 0.1) * 0.1 * uProgress;

    vPosition = circularPosition;
    vProgress = uProgress;
    vec4 mvPosition = modelViewMatrix * vec4(circularPosition, 1.0);
    //size attenuation
    gl_PointSize = 10.0 * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(circularPosition, 1.0);
}