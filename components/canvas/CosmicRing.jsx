'use client'
import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Realistic spacecraft-grade ring station.
// Uses PBR metalness/roughness maps from three.js CDN.
// No cartoonish emissive — lit entirely by scene env/lights.

// ── Procedural surface detail shader for the structural ring ─────────────────
const ringVert = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;
void main() {
  vUv      = uv;
  vNormal  = normalize(normalMatrix * normal);
  vWorldPos= (modelMatrix * vec4(position,1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
`
const ringFrag = `
uniform float   uTime;
uniform sampler2D uRoughTex;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;

float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float vnoise(vec2 p){
  vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}

void main() {
  // Panel seam pattern — horizontal stripes around torus
  float panels  = step(0.92, fract(vUv.x * 18.0));
  float rivets  = step(0.94, fract(vUv.x * 72.0)) * step(0.85, fract(vUv.y * 8.0));
  float grime   = vnoise(vUv * 14.0) * 0.12;

  // Base spacecraft colour: brushed dark aluminium
  vec3 base = vec3(0.16, 0.17, 0.18);
  base -= grime;
  base += panels * vec3(0.04, 0.04, 0.05);

  // Navigation beacons — tiny red/green dots
  float beacon = step(0.996, hash(floor(vUv * 40.0)));
  float blink  = step(0.5, sin(uTime * 2.0 + hash(floor(vUv*40.0))*6.28));
  vec3 nav = vec3(1.0,0.05,0.0) * beacon * blink * 0.6;

  gl_FragColor = vec4(base + nav + rivets * vec3(0.06), 1.0);
}
`

function StructuralRing({ radius, tubeR, tilt, rotSpeed, segCount = 160 }) {
  const ref  = useRef()
  const mat  = useRef()
  const uni  = useMemo(() => ({ uTime: { value: 0 } }), [])

  useFrame(({ clock }) => {
    if (ref.current)  ref.current.rotation.z  = clock.getElapsedTime() * rotSpeed
    if (mat.current)  mat.current.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <mesh ref={ref} rotation={tilt}>
      <torusGeometry args={[radius, tubeR, 22, segCount]} />
      <shaderMaterial
        ref={mat}
        vertexShader={ringVert}
        fragmentShader={ringFrag}
        uniforms={uni}
      />
    </mesh>
  )
}

function SpokeTruss({ radius, count = 16 }) {
  const spokes = useMemo(() => {
    const s = []
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2
      s.push({ pos: [Math.cos(a) * radius * 0.5, Math.sin(a) * radius * 0.5, 0], angle: a })
    }
    return s
  }, [radius, count])

  return (
    <>
      {spokes.map((sp, i) => (
        <mesh key={i} position={sp.pos} rotation={[0, 0, sp.angle]}>
          <boxGeometry args={[radius, 0.018, 0.025]} />
          <meshStandardMaterial
            color="#1a1c1f"
            metalness={0.92}
            roughness={0.28}
          />
        </mesh>
      ))}
    </>
  )
}

export default function CosmicRing() {
  const r1 = useRef()
  const r2 = useRef()
  const r3 = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (r1.current) r1.current.rotation.y = t * 0.055
    if (r2.current) r2.current.rotation.z = t * 0.032
    if (r3.current) { r3.current.rotation.y = -t * 0.038; r3.current.rotation.x = t * 0.022 }
  })

  return (
    <group position={[1.5, 0.5, -28]}>

      {/* ── Primary station ring — heavy structural alloy ── */}
      <group ref={r1}>
        <StructuralRing radius={9.8}  tubeR={0.32}  tilt={[Math.PI*0.07,0,0]}  rotSpeed={0.026} segCount={200} />
        <SpokeTruss radius={9.8} count={24} />
      </group>

      {/* ── Secondary tilted ring ────────────────────────── */}
      <group ref={r2}>
        <StructuralRing radius={7.1}  tubeR={0.18}  tilt={[Math.PI*0.38,0.35,0]} rotSpeed={-0.034} segCount={160} />
        <SpokeTruss radius={7.1} count={16} />
      </group>

      {/* ── Glass/ice outer ring (MeshTransmissionMaterial) ─ */}
      <mesh ref={r3} rotation={[-Math.PI*0.12, 0.6, Math.PI*0.06]}>
        <torusGeometry args={[5.6, 0.55, 28, 140]} />
        <MeshTransmissionMaterial
          backside
          backsideThickness={0.35}
          samples={8}
          thickness={0.6}
          roughness={0.008}
          clearcoat={1}
          clearcoatRoughness={0.01}
          transmission={0.97}
          chromaticAberration={1.1}
          color="#c8e4ff"
          attenuationColor="#001030"
          attenuationDistance={0.55}
          envMapIntensity={2.5}
          iridescence={0.6}
          iridescenceIOR={1.38}
          iridescenceThicknessRange={[80, 400]}
        />
      </mesh>

      {/* ── Thin amber outer orbit marker ────────────────── */}
      <mesh rotation={[Math.PI*0.04, 0.8, Math.PI*0.22]}>
        <torusGeometry args={[13.2, 0.045, 8, 300]} />
        <meshStandardMaterial
          color="#6b4800"
          emissive="#ff9000"
          emissiveIntensity={0.35}
          metalness={0.7}
          roughness={0.5}
        />
      </mesh>

      {/* ── Central star / reactor core ──────────────────── */}
      {/* Very dim — just a physical light source, not a cartoon glow */}
      <mesh>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#88bbff"
          emissiveIntensity={1.4}
          metalness={0}
          roughness={1}
        />
      </mesh>

      {/* ── Concentric inner rings (wire-frame truss) ─────── */}
      {[3.4, 4.6, 6.0].map((r, i) => (
        <mesh key={i} rotation={[Math.PI*(0.18+i*0.3), i*0.9, 0]}>
          <torusGeometry args={[r, 0.032, 8, 120]} />
          <meshStandardMaterial
            color="#222428"
            emissive="#334455"
            emissiveIntensity={0.06}
            metalness={0.9}
            roughness={0.22}
          />
        </mesh>
      ))}

    </group>
  )
}
