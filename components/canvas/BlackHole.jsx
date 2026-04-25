'use client'
import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../../lib/scrollState'

// ─── Gargantua-accurate accretion disk ───────────────────────────────────────
// Physics: standard thin-disk temperature profile T ∝ r^-0.75,
// relativistic Doppler beaming, photon ring, blackbody colour.

const diskVert = `
varying vec2 vUv;
varying vec3 vWorldPos;
void main() {
  vUv = uv;
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const diskFrag = `
uniform float uTime;
varying vec2  vUv;

// ── value noise ─────────────────────────────────────────────
float hash(vec2 p) {
  p  = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i),          hash(i+vec2(1,0)), f.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v=0.0,a=0.5;
  for(int i=0;i<5;i++){v+=a*vnoise(p);p=p*2.1+vec2(1.7,9.2);a*=0.5;}
  return v;
}

// ── blackbody colour (Planck → sRGB approximation) ──────────
vec3 blackbody(float kelvin) {
  kelvin = clamp(kelvin, 800.0, 40000.0);
  float t = kelvin / 100.0;
  float r, g, b;
  // Red
  r = t <= 66.0 ? 255.0 : 329.698727446*pow(t-60.0,-0.1332047592);
  r = clamp(r,0.0,255.0)/255.0;
  // Green
  if(t<=66.0) g=99.4708025861*log(t)-161.1195681661;
  else        g=288.1221695283*pow(t-60.0,-0.0755148492);
  g=clamp(g,0.0,255.0)/255.0;
  // Blue
  if(t>=66.0)       b=1.0;
  else if(t<=19.0)  b=0.0;
  else              b=138.5177312231*log(t-10.0)-305.0447927307;
  b=clamp(b,0.0,255.0)/255.0;
  return vec3(r,g,b);
}

void main() {
  vec2  delta = vUv - 0.5;
  float r     = length(delta) * 2.0;          // 0..1 across disk radius
  float angle = atan(delta.y, delta.x);

  // ── disk mask ─────────────────────────────────────────────
  float rInner = 0.30;   // ISCO (innermost stable orbit)
  float rOuter = 0.96;
  float diskMask = smoothstep(rInner-0.03, rInner+0.025, r)
                 * smoothstep(rOuter+0.02, rOuter-0.04,  r);

  if(diskMask < 0.001) {
    gl_FragColor = vec4(0.0);
    return;
  }

  // ── temperature profile T ∝ r^-0.75 * (1-sqrt(r_in/r))^0.25 ──
  float rNorm  = clamp((r - rInner) / (rOuter - rInner), 0.0, 1.0);
  float T_norm = pow(1.0 - rNorm, 0.78) * pow(rInner / r, 0.5);
  float T_K    = mix(1200.0, 28000.0, T_norm);   // 1200 K outer → 28 000 K inner

  vec3 tempCol = blackbody(T_K);

  // ── relativistic Doppler beaming ─────────────────────────
  // orbital velocity ≈ 0.55 c at inner disk
  float beta     = mix(0.18, 0.55, 1.0 - rNorm);
  float cosTheta = -sin(angle - uTime * 0.55);        // approaching side
  float gamma    = 1.0 / sqrt(1.0 - beta*beta);
  float doppler  = 1.0 / (gamma * (1.0 - beta * cosTheta));
  float beam     = pow(doppler, 3.5);                 // specific intensity ∝ δ^(3+α)

  // ── turbulent plasma texture ──────────────────────────────
  float swirl  = angle * 0.5 - uTime * 0.45 - r * 5.5;
  float noise1 = vnoise(vec2(swirl * 0.4, r * 7.0  - uTime * 0.9));
  float noise2 = vnoise(vec2(swirl * 1.1, r * 14.0 - uTime * 1.6)) * 0.45;
  float turb   = (noise1 + noise2) / 1.45;
  float plasma  = fbm(vec2(swirl * 0.25, r * 3.5 + uTime * 0.2));

  float detail = 0.55 + 0.45 * (turb + plasma * 0.35);

  // ── photon ring — ultra-bright thin ring just above ISCO ─
  float photon = exp(-pow((r - (rInner + 0.018)) / 0.012, 2.0));
  vec3  photonCol = vec3(1.0, 0.95, 0.88) * photon * 5.0;

  // ── assemble ─────────────────────────────────────────────
  float brightness = diskMask * beam * detail * T_norm;
  vec3  col  = tempCol * brightness * 2.2 + photonCol;

  // Inner edge glow (very hot, nearly white)
  float innerGlow = smoothstep(rInner + 0.06, rInner, r) * 4.0;
  col += vec3(1.0, 0.9, 0.8) * innerGlow * diskMask;

  float alpha = diskMask * clamp(brightness * 0.95 + photon * 0.8, 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
}
`

// ─── Gravitational lensing halo (background distortion ring) ─────────────────
const lensVert = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`
const lensFrag = `
uniform float uTime;
varying vec2  vUv;
void main() {
  float d    = length(vUv - 0.5) * 2.0;
  // Einstein ring – very thin bright halo at d≈0.52
  float ring = exp(-pow((d - 0.52) / 0.022, 2.0));
  // Outer gravitational glow
  float glow = pow(max(0.0, 1.0 - d), 3.2) * 0.35;
  float pulse = 0.9 + 0.1 * sin(uTime * 0.8);
  vec3 col   = vec3(0.75, 0.85, 1.0) * (ring * 2.8 + glow) * pulse;
  float a    = (ring * 0.9 + glow) * step(d, 0.99);
  gl_FragColor = vec4(col, a);
}
`

export default function BlackHole({ mouse }) {
  const disk1    = useRef()
  const disk2    = useRef()
  const groupRef = useRef()
  const smoothX  = useRef(0)
  const smoothY  = useRef(0)
  const smoothP  = useRef(0)

  const diskUniforms = useMemo(() => ({ uTime: { value: 0 } }), [])
  const lensUniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    diskUniforms.uTime.value = t
    lensUniforms.uTime.value = t

    smoothP.current += (scrollState.progress - smoothP.current) * Math.min(1, delta * 3)
    const mx = mouse?.current?.x ?? 0
    const my = mouse?.current?.y ?? 0
    smoothX.current += (mx - smoothX.current) * Math.min(1, delta * 4)
    smoothY.current += (my - smoothY.current) * Math.min(1, delta * 4)

    if (disk1.current) disk1.current.rotation.z =  t * 0.10
    if (disk2.current) disk2.current.rotation.z = -t * 0.065

    if (groupRef.current) {
      groupRef.current.rotation.x = smoothY.current * 0.10
      groupRef.current.rotation.y = smoothX.current * 0.10
      groupRef.current.position.x = -smoothP.current * 3.0
      groupRef.current.position.y = -smoothP.current * 0.5
    }
  })

  return (
    <group ref={groupRef}>

      {/* ── Gravitational lensing ring (behind everything) ── */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[7.2, 7.2]} />
        <shaderMaterial
          vertexShader={lensVert}
          fragmentShader={lensFrag}
          uniforms={lensUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ── Event horizon (perfectly black sphere) ────────── */}
      <mesh>
        <sphereGeometry args={[1.02, 80, 80]} />
        <meshStandardMaterial
          color="#000000"
          roughness={1}
          metalness={0}
          envMapIntensity={0}
        />
      </mesh>

      {/* ── Accretion disk — primary (titled 6° from edge-on) ── */}
      <mesh ref={disk1} rotation={[Math.PI * 0.04, 0, 0]}>
        <ringGeometry args={[1.22, 3.85, 220, 6]} />
        <shaderMaterial
          vertexShader={diskVert}
          fragmentShader={diskFrag}
          uniforms={diskUniforms}
          transparent
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ── Accretion disk — secondary halo (counter-rotating) ── */}
      <mesh ref={disk2} rotation={[Math.PI * -0.055, 0.2, 0]}>
        <ringGeometry args={[1.5, 3.1, 180, 4]} />
        <shaderMaterial
          vertexShader={diskVert}
          fragmentShader={diskFrag}
          uniforms={diskUniforms}
          transparent
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ── Coronal X-ray glow above/below event horizon ──── */}
      <mesh>
        <sphereGeometry args={[1.35, 32, 32]} />
        <meshStandardMaterial
          color="#000000"
          emissive="#ff5500"
          emissiveIntensity={0.06}
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

    </group>
  )
}
