uniform float uTime;
varying vec3 vPosition;
varying float vProgress;
void main() {

   vec3 color1 = vec3(1.,0.6,0.4);
   vec3 color2 = vec3(0.95,0.45,0.247);

    //Blueish colors
   //vec3 color1 = vec3(0.4,0.6,1.);
   //vec3 color2 = vec3(0.247,0.45,0.95);

    gl_FragColor = vec4(mix(color1, color2, max(0.95, sin(vPosition.y + uTime) * 0.5 + 0.5)), clamp(0.8 * vProgress, 0.1, 1.0)); // Red color for demonstration
}
