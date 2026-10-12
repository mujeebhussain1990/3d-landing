// Ashima / Stefan Gustavson 3D simplex noise (MIT)
const simplex = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+10.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 105.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

export const vertexShader = /* glsl */ `
uniform float uFrom;
uniform float uTo;
uniform float uMix;
uniform float uGlobe;
uniform float uDim;
uniform float uIntro;
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uMotion;
uniform vec2 uMouse;
uniform float uMouseActive;
uniform float uTanHalfFov;
uniform float uAspect;
uniform vec3 uPrimary;
uniform vec3 uSecondary;
uniform vec3 uArc;

attribute vec3 aP1;
attribute vec3 aP2;
attribute vec3 aP3;
attribute vec3 aP4;
attribute vec3 aP5;
attribute float aSeed;
attribute float aKind;

varying vec3 vColor;
varying float vAlpha;

${simplex}

vec3 shapeAt(float i){
  if(i < 0.5) return position;
  if(i < 1.5) return aP1;
  if(i < 2.5) return aP2;
  if(i < 3.5) return aP3;
  if(i < 4.5) return aP4;
  return aP5;
}

void main(){
  // each particle departs on its own beat, so a form dissolves and re-forms as a wave
  float t = clamp((uMix - aSeed * 0.35) / 0.65, 0.0, 1.0);
  float e = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  vec3 pos = mix(shapeAt(uFrom), shapeAt(uTo), e);

  float slow = uTime * 0.12;
  vec3 q = pos * 0.55;
  vec3 n = vec3(
    snoise(q + vec3(slow, 0.0, 0.0)),
    snoise(q + vec3(0.0, slow, 17.1)),
    snoise(q + vec3(31.7, 0.0, slow))
  );
  float storm = sin(3.14159265 * t);
  pos += n * (storm * 0.85 + 0.022) * uMotion;

  // intro: everything starts as a single hot point, then bursts outward
  float it = clamp((uIntro - aSeed * 0.45) / 0.55, 0.0, 1.0);
  float ie = 1.0 - pow(1.0 - it, 4.0);
  pos = mix(n * 0.035, pos, ie);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);

  // pointer repels particles in view space, at each particle's own depth
  vec2 m = uMouse * vec2(uAspect, 1.0) * uTanHalfFov * -mv.z;
  vec2 d = mv.xy - m;
  float push = smoothstep(0.55, 0.0, length(d)) * uMouseActive * uMotion;
  mv.xy += normalize(d + 1e-4) * push * 0.3;
  mv.z += push * 0.35;

  gl_Position = projectionMatrix * mv;

  float g = smoothstep(0.35, 1.0, uGlobe);
  float beacon = (1.0 - step(1.5, aKind)) * step(0.5, aKind) * g;
  float arc = step(1.5, aKind) * g;
  float pulse = 0.5 + 0.5 * sin(uTime * 2.6 + aSeed * 40.0);

  float size = uSize * (0.55 + aSeed * 0.9);
  size *= 1.0 + beacon * (1.2 + pulse);
  gl_PointSize = size * uPixelRatio / -mv.z;

  vec3 col = uPrimary;
  if (fract(aSeed * 137.31) < 0.22) col = uSecondary;
  col = mix(col, uArc, arc);
  col = mix(col, vec3(1.0), beacon * (0.35 + 0.5 * pulse));
  col += push * 0.5;
  vColor = col;

  vAlpha = (0.45 + 0.55 * fract(aSeed * 71.3)) * (1.0 - storm * 0.25);
  vAlpha *= smoothstep(-15.0, -3.0, mv.z) * uDim;
}
`;

export const fragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;

void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = pow(smoothstep(0.5, 0.0, d), 1.7) * vAlpha;
  if (a < 0.004) discard;
  gl_FragColor = vec4(vColor * a, a);
}
`;
