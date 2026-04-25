'use client'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

const STRAND_SEGS  = 180   // tube resolution along path
const BRIDGE_EVERY = 12    // rung every N points

function HelixStrand({ curve, color, tubeR = 0.028 }) {
  const mat = useRef()
  useFrame(({ clock }) => {
    if (mat.current) mat.current.emissiveIntensity = 1.8 + Math.sin(clock.getElapsedTime() * 1.1) * 0.6
  })
  return (
    <mesh>
      <tubeGeometry args={[curve, STRAND_SEGS, tubeR, 8, false]} />
      <meshStandardMaterial
        ref={mat}
        color={color}
        emissive={color}
        emissiveIntensity={1.8}
        metalness={0.8}
        roughness={0.15}
      />
    </mesh>
  )
}

function HelixBridges({ pts1, pts2 }) {
  const bridges = useMemo(() => {
    const out = []
    for (let i = 0; i < pts1.length; i += BRIDGE_EVERY) {
      const a = pts1[i]
      const b = pts2[i]
      if (!a || !b) continue
      const mid  = new THREE.Vector3().lerpVectors(a, b, 0.5)
      const len  = a.distanceTo(b)
      const dir  = new THREE.Vector3().subVectors(b, a).normalize()
      const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
      out.push({ mid, len, quat, a, b })
    }
    return out
  }, [pts1, pts2])

  return (
    <>
      {bridges.map((br, i) => (
        <group key={i}>
          {/* Bridge tube */}
          <mesh position={br.mid} quaternion={br.quat}>
            <cylinderGeometry args={[0.016, 0.016, br.len, 6]} />
            <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2.4} metalness={0.6} roughness={0.2} />
          </mesh>
          {/* Node sphere at A end */}
          <mesh position={br.a}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={3.5} />
          </mesh>
          {/* Node sphere at B end */}
          <mesh position={br.b}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial color="#9b30ff" emissive="#9b30ff" emissiveIntensity={3.5} />
          </mesh>
        </group>
      ))}
    </>
  )
}

export default function QuantumHelix({ position = [-7, 1, -16] }) {
  const group  = useRef()
  const TURNS  = 5
  const HEIGHT = 16
  const RADIUS = 1.05
  const N      = 300

  const { curve1, curve2, pts1, pts2 } = useMemo(() => {
    const pts1 = [], pts2 = []
    for (let i = 0; i <= N; i++) {
      const t     = i / N
      const angle = t * Math.PI * 2 * TURNS
      const y     = t * HEIGHT - HEIGHT / 2
      pts1.push(new THREE.Vector3( Math.cos(angle) * RADIUS, y,  Math.sin(angle) * RADIUS))
      pts2.push(new THREE.Vector3(-Math.cos(angle) * RADIUS, y, -Math.sin(angle) * RADIUS))
    }
    return {
      curve1: new THREE.CatmullRomCurve3(pts1),
      curve2: new THREE.CatmullRomCurve3(pts2),
      pts1,
      pts2,
    }
  }, [])

  useFrame(({ clock }) => {
    if (group.current) {
      const t = clock.getElapsedTime()
      group.current.rotation.y = t * 0.12
    }
  })

  return (
    <Float speed={0.25} floatIntensity={0.35} rotationIntensity={0.08}>
      <group ref={group} position={position}>
        <HelixStrand curve={curve1} color="#00d4ff" />
        <HelixStrand curve={curve2} color="#9b30ff" />
        <HelixBridges pts1={pts1} pts2={pts2} />
      </group>
    </Float>
  )
}
