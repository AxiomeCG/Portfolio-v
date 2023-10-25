uniform sampler2D uTexture;
uniform float uTime;
//uniform float uProgress;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vPosition;
//	<https://www.shadertoy.com/view/Xd23Dh>
//	by inigo quilez <http://iquilezles.org/www/articles/voronoise/voronoise.htm>
//



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
vec3 hash3( vec2 p ){
    vec3 q = vec3( dot(p,vec2(127.1,311.7)),
    dot(p,vec2(269.5,183.3)),
    dot(p,vec2(419.2,371.9)) );
    return fract(sin(q)*43758.5453);
}

float iqnoise( in vec2 x, float u, float v ){
    vec2 p = floor(x);
    vec2 f = fract(x);

    float k = 1.0+63.0*pow(1.0-v,4.0);

    float va = 0.0;
    float wt = 0.0;
    for( int j=-2; j<=2; j++ )
    for( int i=-2; i<=2; i++ )
    {
        vec2 g = vec2( float(i),float(j) );
        vec3 o = hash3( p + g )*vec3(u,u,1.0);
        vec2 r = g - f + o.xy;
        float d = dot(r,r);
        float ww = pow( 1.0-smoothstep(0.0,1.414,sqrt(d)), k );
        va += o.z*ww;
        wt += ww;
    }

    return va/wt;
}

vec2 rotate(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, s, -s, c);
    return m * v;
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
    offsetSt *= 1.25;

    offsetSt.y -= 0.25;
    offsetSt.x -= 0.10;



    float uProgress = sin(uTime) * 0.5 + 0.5;
    float radius = (1.0 - uProgress) * 4.0;

    if (radius > 2000.) {
        discard;
    }


    float distanceFromCenter =  distance(st, vec2(0.5));

    float screenRadius = 0.4 * uProgress;

    float maskValue = 1.0 - smoothstep(screenRadius - 0.0, screenRadius + 0.05 * uProgress, distanceFromCenter);
    float timing =  clamp(sin(uTime * 0.25) * 0.5 + 0.5, 0.0, 1.0);


    vec2 centeredSt = st - vec2(0.5);

    float rotation =  distance(st, vec2(0.5)) * 3.0;
    vec2 rotatedSt = rotate(centeredSt, pow(rotation + uTime, uProgress * 0.75));


    float v =  clamp(fbm( rotatedSt * 2.0  ) * 0.5 + 0.5, 0.25, 1.0);

    gl_FragColor = vec4(texture2D(uTexture, offsetSt).rgb, maskValue);
   // gl_FragColor = vec4(vec3(v ), 1.0);
}
