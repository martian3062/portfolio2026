'use client'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

// Full-sphere skybox — wraps around the entire scene.
// Combines a real star-map texture (NASA Tycho-2) with a procedural
// nebula overlay so colours match the portfolio palette.

const nebVert = `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const nebFrag = `
uniform float uTime;
uniform sampler2D uStarTex;
varying vec3 vDir;

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i=floor(p),f=fract(p);
  f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p) {
  float v=0.0,a=0.5;
  for(int i=0;i<6;i++){v+=a*vnoise(p);p=p*2.1+vec2(1.7,9.2);a*=0.5;}
  return v;
}

// Spherical UV from direction
vec2 sphereUV(vec3 d) {
  float lon = atan(d.z, d.x) / (2.0 * 3.14159265) + 0.5;
  float lat = asin(clamp(d.y, -1.0, 1.0)) / 3.14159265 + 0.5;
  return vec2(lon, lat);
}

void main() {
  vec3  dir = normalize(vDir);
  vec2  uv  = sphereUV(dir);

  // ── Real star-map texture ────────────────────────────────
  vec3  stars = texture2D(uStarTex, uv).rgb;
  // Boost faint stars, crush near-black sky to pure black
  stars  = pow(stars, vec3(0.45));
  stars *= smoothstep(0.08, 0.35, length(stars));

  // ── Procedural nebula gas ────────────────────────────────
  vec2  q = vec2(fbm(uv * 1.8 + uTime * 0.006),
                 fbm(uv * 1.8 + vec2(1.7, 9.2)));
  float n = fbm(uv * 1.4 + q * 0.55 + uTime * 0.004);
  float n2= fbm(uv * 3.2 - vec2(q.y,q.x) - uTime*0.003);

  // Very dark gas clouds — space is NOT bright
  vec3 deep   = vec3(0.004, 0.003, 0.010);
  vec3 nebA   = vec3(0.010, 0.003, 0.028); // faint purple gas
  vec3 nebB   = vec3(0.0,   0.006, 0.018); // faint teal gas

  vec3 nebula = mix(deep, nebA, smoothstep(0.42, 0.72, n)  * 0.6);
       nebula = mix(nebula, nebB, smoothstep(0.55, 0.85, n2) * 0.4);

  // ── Milky Way band ───────────────────────────────────────
  float band     = exp(-pow(dir.y * 2.8, 2.0)) * 0.06;
  float bandNoise= fbm(uv * 4.0 + vec2(uTime * 0.002));
  vec3  mwCol    = vec3(0.018, 0.012, 0.028) * (band * (0.6 + 0.4 * bandNoise));

  // ── Combine ──────────────────────────────────────────────
  vec3 col = nebula + mwCol + stars * 0.85;

  gl_FragColor = vec4(col, 1.0);
}
`

export default function NebulaBackground() {
  const meshRef  = useRef()
  const uniforms = useMemo(() => ({
    uTime:    { value: 0 },
    uStarTex: { value: null },
  }), [])

  // NASA Tycho-2 star catalogue map (public domain, hosted on GitHub raw)
  // Fallback to a procedural starfield if texture fails to load
  const starTexUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/2294472375_24a3b8ef46_o.jpg'

  const tex = useTexture(starTexUrl)
  useMemo(() => {
    if (tex) {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping
      tex.colorSpace = THREE.LinearSRGBColorSpace
      uniforms.uStarTex.value = tex
    }
  }, [tex])

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <mesh ref={meshRef} scale={[-1, 1, 1]}>
      <sphereGeometry args={[92, 64, 64]} />
      <shaderMaterial
        vertexShader={nebVert}
        fragmentShader={nebFrag}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}
