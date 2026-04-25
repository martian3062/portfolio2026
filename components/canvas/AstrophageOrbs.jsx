'use client'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Orb({ position, scale, speed, color, distort = 0.4 }) {
  const mesh = useRef()
  const baseY = position[1]

  useFrame(({ clock }) => {
    if (!mesh.current) return
    const t = clock.getElapsedTime() * speed
    mesh.current.position.y = baseY + Math.sin(t) * 0.4
    mesh.current.rotation.x = t * 0.3
    mesh.current.rotation.z = t * 0.2
  })

  return (
    <mesh ref={mesh} position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <MeshDistortMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        distort={distort}
        speed={3}
        transparent
        opacity={0.65}
        roughness={0.2}
        metalness={0.1}
      />
    </mesh>
  )
}

export default function AstrophageOrbs() {
  const orbs = useMemo(() => [
    { position: [-7,  2.5, -4],  scale: 0.32, speed: 0.45, color: '#ffb800', distort: 0.5 },
    { position: [ 8, -1.5, -6],  scale: 0.22, speed: 0.65, color: '#ff6600', distort: 0.4 },
    { position: [-9, -3.0, -9],  scale: 0.45, speed: 0.28, color: '#ffaa00', distort: 0.35 },
    { position: [ 6,  4.5, -5],  scale: 0.18, speed: 0.85, color: '#00ff88', distort: 0.6 },
    { position: [-4,  5.5, -7],  scale: 0.28, speed: 0.55, color: '#ff4400', distort: 0.45 },
    { position: [10, -4.5, -4],  scale: 0.38, speed: 0.38, color: '#ffb800', distort: 0.4 },
    { position: [-6, -6.0, -5],  scale: 0.20, speed: 0.72, color: '#9b30ff', distort: 0.55 },
    { position: [ 3,  7.0, -8],  scale: 0.15, speed: 0.92, color: '#00d4ff', distort: 0.5 },
  ], [])

  return (
    <>
      {orbs.map((orb, i) => <Orb key={i} {...orb} />)}
    </>
  )
}
