const vertexShader = `
uniform float uTime;
uniform float uAspectRatio;
uniform float uProgress;
uniform float uProgress2;
uniform vec2 uMouse;
varying vec2 vUv;

#define NUM_OCTAVES 8
mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
\tmat4 m = rotationMatrix(axis, angle);
\treturn (m * vec4(v, 1.0)).xyz;
}

//\tSimplex 3D Noise 
//\tby Ian McEwan, Ashima Arts
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
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
  vec4 p = permute( permute( permute( 
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

vec3 random3(vec3 c) {
\tfloat j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
\tvec3 r;
\tr.z = fract(512.0*j);
\tj *= .125;
\tr.x = fract(512.0*j);
\tj *= .125;
\tr.y = fract(512.0*j);
\treturn r-0.5;
}

float fbm(vec3 x) {
\tfloat v = 0.0;
\tfloat a = 0.5;
\tvec3 shift = vec3(100);
\tfor (int i = 0; i < NUM_OCTAVES; ++i) {
\t\tv += a * snoise(x);
\t\tx = x * 2.0 + shift;
\t\ta *= 0.5;
\t}
\treturn v;
}

varying float vNoise; 

void main() {

  float d = max(1.0 - pow(1.0 * distance(position.xy, vec2(0.5)),2.0) ,0.0);

  float noise = snoise(position + uTime * 0.1) + distance(position, vec3(0.)) ;

  vec3 random = random3(position);
  float noise2 = snoise(position + uTime * 0.3 + random) * (1.0 - d);

  vec3 finalPosition = position;
  finalPosition.x *= uAspectRatio;
  
  finalPosition.z += noise * 0.1;
  finalPosition.x += noise2 * 0.01 ;
  finalPosition.y += noise2 * 0.01 ;
  

  vec2 correctedMouse = uMouse;
  correctedMouse.x *= uAspectRatio;
  
  float displacement = max(1.0 - pow(5.0 * distance(correctedMouse, (modelMatrix * vec4(finalPosition, 1.0)).xy + noise *0.3),10.0) + noise *2.0 ,0.0);
    
  finalPosition = rotate(finalPosition, vec3(0.0, 1.0, 0.0), (random.x + noise) * uProgress * 2.0*3.141592653589793238) * cos(noise * 2.0 * 3.141592653589793238 * uProgress);
  
  finalPosition += random * uProgress2 * snoise(rotate(position,random * uTime, uProgress2) * uTime * 0.1) * 5.0;
  
  vec4 modelPosition = modelMatrix * vec4(finalPosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;


  
  vUv = position.xy;
  vUv.x *= uAspectRatio;
  gl_Position = projectedPosition;
  
  vNoise = fbm(finalPosition * 3.0);

  //gl_PointSize = 2.0;
  // Size attenuation;
  gl_PointSize *= step(1.0 - (1.0/64.0), position.z) + 0.5;
}

`

export default vertexShader
