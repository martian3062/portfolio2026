'use client'
import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

// All repeated geometry uses InstancedMesh — one draw call per type.

const _dummy = new THREE.Object3D()

function InstancedSpokes({ radius, count = 16, material }) {
  const ref = useRef()

  useEffect(() => {
    if (!ref.current) return
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2
      _dummy.position.set(Math.cos(a) * radius * 0.5, Math.sin(a) * radius * 0.5, 0)
      _dummy.rotation.set(0, 0, a)
      _dummy.updateMatrix()
      ref.current.setMatrixAt(i, _dummy.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [radius, count])

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={[radius, 0.02, 0.022]} />
      {material}
    </instancedMesh>
  )
}

// Panel seam + grime + blinking nav-beacon shader — one draw call for the ring
const RING_VERT = /* glsl */`
varying vec2 vUv;
varying vec3 vNormal;
void main() {
  vUv = uv; vNormal = normalize(normalMatrix*normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}`
const RING_FRAG = /* glsl */`
uniform float uTime;
varying vec2 vUv;
varying vec3 vNormal;
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float vnoise(vec2 p){
  vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
void main(){
  float panel = step(0.92,fract(vUv.x*18.0));
  float rivet = step(0.955,fract(vUv.x*72.0))*step(0.88,fract(vUv.y*8.0));
  float grime = vnoise(vUv*14.0)*0.10;
  vec3 base = vec3(0.15,0.155,0.165) - grime + panel*vec3(0.04) + rivet*vec3(0.06);
  // blinking nav beacons
  float beacon= step(0.997,hash(floor(vUv*40.0)));
  float blink = step(0.5,sin(uTime*2.2+hash(floor(vUv*40.0))*6.28));
  base += vec3(1.0,0.08,0.04)*beacon*blink*0.7;
  gl_FragColor = vec4(base,1.0);
}`

function PanelledRing({ radius, tubeR, rotTilt, rotSpeed, segCount = 160 }) {
  const ref = useRef()
  const mat = useRef()
  const uni = useMemo(() => ({ uTime: { value: 0 } }), [])
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * rotSpeed
    if (mat.current) mat.current.uniforms.uTime.value = clock.getElapsedTime()
  })
  return (
    <mesh ref={ref} rotation={rotTilt}>
      <torusGeometry args={[radius, tubeR, 20, segCount]} />
      <shaderMaterial ref={mat} vertexShader={RING_VERT} fragmentShader={RING_FRAG} uniforms={uni} />
    </mesh>
  )
}

export default function CosmicRing() {
  const outerGroup = useRef()
  const innerGroup = useRef()
  const glassRing  = useRef()

  const spokeMat = useMemo(() => (
    <meshStandardMaterial color="#1a1c1f" metalness={0.9} roughness={0.3} />
  ), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (outerGroup.current) outerGroup.current.rotation.y =  t * 0.048
    if (innerGroup.current) innerGroup.current.rotation.y = -t * 0.036
    if (glassRing.current)  {
      glassRing.current.rotation.y = -t * 0.031
      glassRing.current.rotation.x =  t * 0.019
    }
  })

  return (
    <group position={[1.5, 0.5, -28]}>

      {/* ── Outer structural ring + spokes ── */}
      <group ref={outerGroup}>
        <PanelledRing radius={9.8} tubeR={0.30} rotTilt={[Math.PI*0.07,0,0]} rotSpeed={0.024} segCount={200} />
        <InstancedSpokes radius={9.8} count={24} material={spokeMat} />
      </group>

      {/* ── Mid tilted ring + spokes ── */}
      <group ref={innerGroup}>
        <PanelledRing radius={7.1} tubeR={0.17} rotTilt={[Math.PI*0.38,0.35,0]} rotSpeed={-0.031} segCount={160} />
        <InstancedSpokes radius={7.1} count={16} material={spokeMat} />
      </group>

      {/* ── Glass / ice transmission ring ── */}
      <mesh ref={glassRing} rotation={[-Math.PI*0.12,0.6,Math.PI*0.06]}>
        <torusGeometry args={[5.6, 0.52, 28, 130]} />
        <MeshTransmissionMaterial
          backside backsideThickness={0.32}
          samples={4}
          thickness={0.55}
          roughness={0.005}
          clearcoat={1}
          clearcoatRoughness={0.01}
          transmission={0.97}
          chromaticAberration={1.2}
          color="#c8e4ff"
          attenuationColor="#001030"
          attenuationDistance={0.5}
          envMapIntensity={2.2}
          iridescence={0.55}
          iridescenceIOR={1.38}
          iridescenceThicknessRange={[80,400]}
        />
      </mesh>

      {/* ── Thin amber orbit marker ── */}
      <mesh rotation={[Math.PI*0.04,0.8,Math.PI*0.22]}>
        <torusGeometry args={[13.2,0.042,6,280]} />
        <meshStandardMaterial color="#6b4800" emissive="#ff8800" emissiveIntensity={0.28} metalness={0.7} roughness={0.5} />
      </mesh>

      {/* ── Reactor core (physical light source stand-in) ── */}
      <mesh>
        <sphereGeometry args={[0.42,24,24]} />
        <meshStandardMaterial color="#ffffff" emissive="#88bbff" emissiveIntensity={1.2} />
      </mesh>

      {/* ── Inner concentric wire-frame trusses ── */}
      {[3.4,4.6,6.0].map((r,i) => (
        <mesh key={i} rotation={[Math.PI*(0.18+i*0.3),i*0.9,0]}>
          <torusGeometry args={[r,0.028,6,110]} />
          <meshStandardMaterial color="#1e2228" emissive="#2a3540" emissiveIntensity={0.05} metalness={0.9} roughness={0.25} />
        </mesh>
      ))}

    </group>
  )
}
