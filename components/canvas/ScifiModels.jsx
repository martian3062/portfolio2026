'use client'
import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'
import { scrollState } from '../../lib/scrollState'

// Smooth fade: 0→1 over [enter,peak], 1→0 over [peak,exit]
function sectionVis(p, enter, peak, exit) {
  if (p <= enter || p >= exit) return 0
  if (p <= peak) return (p - enter) / (peak - enter)
  return 1 - (p - peak) / (exit - peak)
}

function lerpC(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)) }

// ─── Interstellar Wormhole Gate ─────────────────────────────────────────────
function WormholeGate({ mouse }) {
  const ref  = useRef()
  const mat  = useRef()

  useFrame(({ clock }) => {
    const t   = clock.getElapsedTime()
    const vis = sectionVis(scrollState.progress, 0, 0.08, 0.3)

    if (ref.current) {
      ref.current.rotation.x = t * 0.14 + mouse.current.y * 0.12
      ref.current.rotation.y = t * 0.22 + mouse.current.x * 0.12
      ref.current.scale.setScalar(lerpC(0, 1, vis))
    }
    if (mat.current) mat.current.opacity = vis * 0.92
  })

  return (
    <Float speed={0.6} floatIntensity={0.3}>
      <mesh ref={ref} position={[5, 2, -3]}>
        <torusKnotGeometry args={[1.1, 0.3, 220, 20, 3, 5]} />
        <meshStandardMaterial
          ref={mat}
          color="#00d4ff"
          emissive="#0088ff"
          emissiveIntensity={2.2}
          wireframe
          transparent
          opacity={0.92}
          depthWrite={false}
        />
      </mesh>
    </Float>
  )
}

// ─── Crystal Transmission Orb (Project Hail Mary science object) ─────────────
function CrystalOrb({ mouse }) {
  const ref  = useRef()
  const wireRef = useRef()

  useFrame(({ clock }) => {
    const t   = clock.getElapsedTime()
    const vis = sectionVis(scrollState.progress, 0.15, 0.28, 0.52)

    if (ref.current) {
      ref.current.rotation.y = t * 0.25 + mouse.current.x * 0.18
      ref.current.rotation.z = t * 0.08
      ref.current.scale.setScalar(lerpC(0, 1.1, vis))
    }
    if (wireRef.current) {
      wireRef.current.rotation.y = -t * 0.4
      wireRef.current.scale.setScalar(lerpC(0, 1.25, vis))
    }
  })

  return (
    <Float speed={0.5} floatIntensity={0.4}>
      <group position={[-5, 1, -4]}>
        {/* Glass orb */}
        <mesh ref={ref}>
          <icosahedronGeometry args={[1, 3]} />
          <MeshTransmissionMaterial
            backside
            samples={8}
            thickness={0.6}
            roughness={0.02}
            clearcoat={1}
            clearcoatRoughness={0.05}
            transmission={0.95}
            chromaticAberration={0.35}
            color="#00d4ff"
            attenuationColor="#003388"
            attenuationDistance={1.2}
          />
        </mesh>
        {/* Outer wireframe shell */}
        <mesh ref={wireRef}>
          <icosahedronGeometry args={[1.3, 1]} />
          <meshStandardMaterial
            color="#00d4ff"
            emissive="#00aaff"
            emissiveIntensity={0.8}
            wireframe
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      </group>
    </Float>
  )
}

// ─── Atomic Orbital Rings (research / science motif) ─────────────────────────
function OrbitalRings({ mouse }) {
  const group = useRef()
  const r1    = useRef()
  const r2    = useRef()
  const r3    = useRef()

  useFrame(({ clock }) => {
    const t   = clock.getElapsedTime()
    const vis = sectionVis(scrollState.progress, 0.28, 0.4, 0.65)

    if (group.current) {
      group.current.scale.setScalar(lerpC(0, 1, vis))
      group.current.rotation.x = t * 0.04 + mouse.current.y * 0.12
      group.current.rotation.y = t * 0.06 + mouse.current.x * 0.12
    }
    if (r1.current) r1.current.rotation.z = t * 0.7
    if (r2.current) r2.current.rotation.z = -t * 0.55
    if (r3.current) r3.current.rotation.z = t * 0.45
  })

  return (
    <Float speed={0.3} floatIntensity={0.2}>
      <group ref={group} position={[5.5, -0.5, -5]}>
        {/* Core */}
        <mesh>
          <sphereGeometry args={[0.28, 24, 24]} />
          <meshStandardMaterial color="#ffb800" emissive="#ffb800" emissiveIntensity={4} />
        </mesh>
        {/* Electron rings */}
        <mesh ref={r1}>
          <torusGeometry args={[1.5, 0.018, 8, 128]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={2} />
        </mesh>
        <mesh ref={r2} rotation={[Math.PI * 0.58, 0.3, 0]}>
          <torusGeometry args={[1.5, 0.018, 8, 128]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={2} />
        </mesh>
        <mesh ref={r3} rotation={[Math.PI * 0.25, Math.PI * 0.3, Math.PI * 0.5]}>
          <torusGeometry args={[1.5, 0.018, 8, 128]} />
          <meshStandardMaterial color="#9b30ff" emissive="#9b30ff" emissiveIntensity={2} />
        </mesh>
      </group>
    </Float>
  )
}

// ─── Data Core (projects section — tech artifact) ────────────────────────────
function DataCore({ mouse }) {
  const outer = useRef()
  const inner = useRef()
  const mid   = useRef()

  useFrame(({ clock }) => {
    const t   = clock.getElapsedTime()
    const vis = sectionVis(scrollState.progress, 0.45, 0.56, 0.78)

    if (outer.current) {
      outer.current.rotation.y = t * 0.35 + mouse.current.x * 0.1
      outer.current.rotation.x = t * 0.18
      outer.current.scale.setScalar(lerpC(0, 1.3, vis))
      outer.current.material.opacity = vis * 0.85
    }
    if (mid.current) {
      mid.current.rotation.y = -t * 0.5
      mid.current.rotation.z = t * 0.22
      mid.current.scale.setScalar(lerpC(0, 0.95, vis))
      mid.current.material.opacity = vis * 0.6
    }
    if (inner.current) {
      inner.current.rotation.y = t * 0.9
      inner.current.scale.setScalar(lerpC(0, 0.5, vis))
    }
  })

  return (
    <Float speed={0.4} floatIntensity={0.25}>
      <group position={[-4.5, -2, -4]}>
        <mesh ref={outer}>
          <dodecahedronGeometry args={[1.4, 0]} />
          <meshStandardMaterial
            color="#9b30ff"
            emissive="#7b10ff"
            emissiveIntensity={2}
            wireframe
            transparent
            opacity={0.85}
            depthWrite={false}
          />
        </mesh>
        <mesh ref={mid}>
          <icosahedronGeometry args={[0.9, 0]} />
          <meshStandardMaterial
            color="#00d4ff"
            emissive="#00aaff"
            emissiveIntensity={1.5}
            wireframe
            transparent
            opacity={0.6}
            depthWrite={false}
          />
        </mesh>
        <mesh ref={inner}>
          <octahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial color="#ffb800" emissive="#ffb800" emissiveIntensity={4} />
        </mesh>
      </group>
    </Float>
  )
}

// ─── Neural Network Sphere (contact section) ─────────────────────────────────
const _nnDummy = new THREE.Object3D()

function NeuralNet({ mouse }) {
  const group   = useRef()
  const instRef = useRef()

  const nodes = useMemo(() => {
    const pts = []
    const phi = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < 24; i++) {
      const y = 1 - (i / 23) * 2
      const r = Math.sqrt(1 - y * y)
      const theta = phi * i
      pts.push(new THREE.Vector3(r * Math.cos(theta) * 1.9, y * 1.9, r * Math.sin(theta) * 1.9))
    }
    return pts
  }, [])

  useEffect(() => {
    if (!instRef.current) return
    nodes.forEach((pos, i) => {
      _nnDummy.position.copy(pos)
      _nnDummy.updateMatrix()
      instRef.current.setMatrixAt(i, _nnDummy.matrix)
    })
    instRef.current.instanceMatrix.needsUpdate = true
  }, [nodes])

  useFrame(({ clock }) => {
    const t   = clock.getElapsedTime()
    const vis = sectionVis(scrollState.progress, 0.7, 0.82, 1.01)

    if (group.current) {
      group.current.scale.setScalar(lerpC(0, 1.05, vis))
      group.current.rotation.y = t * 0.18 + mouse.current.x * 0.15
      group.current.rotation.x = mouse.current.y * 0.1
    }
  })

  return (
    <Float speed={0.35} floatIntensity={0.3}>
      <group ref={group} position={[0, 1.5, -5]}>
        <instancedMesh ref={instRef} args={[undefined, undefined, 24]}>
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={3} />
        </instancedMesh>
      </group>
    </Float>
  )
}

// ─── Export ──────────────────────────────────────────────────────────────────
export default function ScifiModels({ mouse }) {
  return (
    <>
      <WormholeGate  mouse={mouse} />
      <CrystalOrb    mouse={mouse} />
      <OrbitalRings  mouse={mouse} />
      <DataCore      mouse={mouse} />
      <NeuralNet     mouse={mouse} />
    </>
  )
}
