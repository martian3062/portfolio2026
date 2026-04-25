'use client'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Full-sphere procedural skybox.
// No external texture dependency — purely GLSL.
// Generates realistic star distribution + nebula gas on the GPU.

const VERT = /* glsl */`
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const FRAG = /* glsl */`
uniform float uTime;
varying vec3  vDir;

// ── hashes ──────────────────────────────────────────────────
float hash11(float n) { return fract(sin(n)*43758.5453); }
float hash21(vec2  p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
vec2  hash22(vec2  p) {
  p = vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));
  return fract(sin(p)*43758.5453);
}

// ── smooth noise ─────────────────────────────────────────────
float vnoise(vec2 p) {
  vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x),
             mix(hash21(i+vec2(0,1)),hash21(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p, int oct) {
  float v=0.0,a=0.5;
  for(int i=0;i<8;i++){
    if(i>=oct) break;
    v+=a*vnoise(p); p=p*2.1+vec2(1.7,9.2); a*=0.5;
  }
  return v;
}

// ── spherical coords ─────────────────────────────────────────
vec2 sphereUV(vec3 d) {
  return vec2(
    atan(d.z, d.x) / (2.0*3.14159265) + 0.5,
    asin(clamp(d.y,-1.0,1.0)) / 3.14159265 + 0.5
  );
}

// ── star field: Voronoi-based discrete stars ─────────────────
float stars(vec2 uv, float density, float size) {
  vec2  cell   = floor(uv * density);
  vec2  offset = hash22(cell) - 0.5;
  vec2  frac   = fract(uv * density) - 0.5 - offset;
  float dist   = length(frac);
  float b      = hash21(cell);             // brightness bucket
  float lum    = pow(b, 6.0);             // only the brightest are visible
  float twinkle= 0.85 + 0.15*sin(uTime*1.8 + b*12.57);
  return smoothstep(size, 0.0, dist) * lum * twinkle;
}

void main() {
  vec3 dir = normalize(vDir);
  vec2 uv  = sphereUV(dir);

  // ── three star layers (different densities/sizes) ──────────
  float s1 = stars(uv,  90.0, 0.008) * 0.85;
  float s2 = stars(uv, 200.0, 0.005) * 0.55;
  float s3 = stars(uv, 500.0, 0.003) * 0.28;
  vec3  starColor = vec3(s1 + s2 + s3);

  // Colour temperature variation per star
  float ct = hash21(floor(uv * 90.0));
  starColor *= mix(vec3(0.95,0.85,0.7), vec3(0.75,0.88,1.0), ct);

  // ── nebula gas (very dark FBM clouds) ─────────────────────
  vec2 q = vec2(fbm(uv*1.6+uTime*0.004,5),
                fbm(uv*1.6+vec2(1.7,9.2),5));
  float n  = fbm(uv*1.3 + q*0.5 + uTime*0.003, 6);
  float n2 = fbm(uv*2.8 - vec2(q.y,q.x) - uTime*0.002, 5);

  vec3 deep    = vec3(0.003, 0.002, 0.008);   // near-black void
  vec3 nebPurp = vec3(0.008, 0.002, 0.020);   // faint purple gas
  vec3 nebTeal = vec3(0.000, 0.005, 0.015);   // faint teal gas
  vec3 nebAmb  = vec3(0.012, 0.006, 0.002);   // very faint amber (near BH side)

  vec3 neb = mix(deep,    nebPurp, smoothstep(0.40,0.72,n)  * 0.6);
       neb = mix(neb,     nebTeal, smoothstep(0.55,0.85,n2) * 0.35);
       neb = mix(neb,     nebAmb,  smoothstep(0.0, 1.0, 1.0-abs(dir.y)) * 0.04);

  // ── Milky Way band ─────────────────────────────────────────
  float band = exp(-pow(dir.y*2.4,2.0));
  float bNoise = fbm(uv*3.5+vec2(0.2),4)*0.5+0.5;
  neb += vec3(0.010,0.006,0.018) * band * bNoise * 0.7;

  // ── composite ─────────────────────────────────────────────
  vec3 col = neb + starColor * 0.90;
  gl_FragColor = vec4(col, 1.0);
}
`

export default function NebulaBackground() {
  const ref  = useRef()
  const uni  = useMemo(() => ({ uTime: { value: 0 } }), [])

  useFrame(({ clock }) => { uni.uTime.value = clock.getElapsedTime() })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[90, 64, 64]} />
      <shaderMaterial
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uni}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}
