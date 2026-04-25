'use client'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function CosmicParticles({ count = 6000 }) {
  const pts = useRef()

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors    = new Float32Array(count * 3)
    const sizes     = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const r     = 8 + Math.random() * 55
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)

      positions[i3]     = r * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = r * Math.cos(phi)

      sizes[i] = Math.random() * 1.5 + 0.5

      const t = Math.random()
      if (t < 0.25) {
        // Cyan — plasma
        colors[i3] = 0.0; colors[i3 + 1] = 0.83; colors[i3 + 2] = 1.0
      } else if (t < 0.45) {
        // Amber — Astrophage
        colors[i3] = 1.0; colors[i3 + 1] = 0.72; colors[i3 + 2] = 0.05
      } else if (t < 0.55) {
        // Purple — wormhole
        colors[i3] = 0.6; colors[i3 + 1] = 0.18; colors[i3 + 2] = 1.0
      } else {
        // White — stars
        colors[i3] = 0.95; colors[i3 + 1] = 0.95; colors[i3 + 2] = 1.0
      }
    }
    return { positions, colors, sizes }
  }, [count])

  useFrame(({ clock }) => {
    if (!pts.current) return
    pts.current.rotation.y = clock.getElapsedTime() * 0.018
    pts.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.005) * 0.04
  })

  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors, 3]} />
        <bufferAttribute attach="attributes-size"     args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
