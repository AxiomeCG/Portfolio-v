const fragmentShader = `
uniform sampler2D uImage;
uniform float uAspectRatio;
uniform vec2 uMouse;
uniform float uProgress;
uniform float uProgress2;
varying vec2 vUv;
varying float vNoise;

vec3 convertRGBtoHSV(vec3 rgbColor) {
    float r = rgbColor[0];
    float g = rgbColor[1];
    float b = rgbColor[2];
    float colorMax = max(max(r,g), b);
    float colorMin = min(min(r,g), b);
    float delta = colorMax - colorMin;
    float h = 0.0;
    float s = 0.0;
    float v = colorMax;
    vec3 hsv = vec3(0.0);
    if (colorMax != 0.0) {
      s = (colorMax - colorMin ) / colorMax;
    }
    if (delta != 0.0) {
        if (r == colorMax) {
            h = (g - b) / delta;
        } else if (g == colorMax) {        
            h = 2.0 + (b - r) / delta;
        } else {    
            h = 4.0 + (r - g) / delta;
        }
        h *= 60.0;
        if (h < 0.0) {
            h += 360.0;
        }
    }
    hsv[0] = h;
    hsv[1] = s;
    hsv[2] = v;
    return hsv;
}
vec3 convertHSVtoRGB(vec3 hsvColor) {
    float h = hsvColor.x;
    float s = hsvColor.y;
    float v = hsvColor.z;
    if (s == 0.0) {
        return vec3(v, v, v);
    }
    if (h == 360.0) {
        h = 0.0;
    }
    int hi = int(h);
    float f = h - float(hi);
    float p = v * (1.0 - s);
    float q = v * (1.0 - (s * f));
    float t = v * (1.0 - (s * (1.0 - f)));
    vec3 rgb;
    if (hi == 0) {
        rgb = vec3(v, t, p);
    } else if (hi == 1) {
        rgb = vec3(q, v, p);
    } else if (hi == 2) {
        rgb = vec3(p, v, t);
    } if(hi == 3) {
        rgb = vec3(p, q, v);
    } else if (hi == 4) {
        rgb = vec3(t, p, v);
    } else {
        rgb = vec3(v, p, q);
    }
    return rgb;
}


void main() {

  vec2 st = vUv;
  st.y += 0.5; 
  st.x += 0.5 * uAspectRatio; 
  st.x /= uAspectRatio ;
  vec4 color = texture2D(uImage, st);
  //vec3 color = vec3(0.867,0.847,0.812);
  // Gamma correction
    color.rgb = pow(color.rgb, vec3(0.4545));
  color =  mix(color, vec4(1.0), clamp(pow(distance(st, vec2(0.5)) ,2.0) + uProgress, 0.0, 1.0));
    
    
    vec3 hsvColor = convertRGBtoHSV(color.rgb);
    
    hsvColor.y = 0.01;
    vec3 rgbColor = convertHSVtoRGB(hsvColor);
    
  gl_FragColor = vec4(mix(color.rgb, rgbColor, clamp( (1.0-(vNoise * 10.0 * pow( distance(uMouse,  vUv),2.0))), 0.0, 1.0)), 1.0);
}
`

export default fragmentShader
