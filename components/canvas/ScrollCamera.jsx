'use client'
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { scrollState } from '../../lib/scrollState'

function damp(cur, tgt, lambda, dt) {
  return cur + (tgt - cur) * (1 - Math.exp(-lambda * dt))
}

export default function ScrollCamera() {
  const { camera } = useThree()
  const smooth = useRef(0)

  useFrame((_, delta) => {
    smooth.current = damp(smooth.current, scrollState.progress, 2.8, delta)
    const p = smooth.current

    // Pull back deeply on scroll so the far CosmicRing structures reveal themselves
    camera.position.z =  9  + p * 9        // 9 → 18  (pulls back, CosmicRing at z=-28 grows)
    camera.position.y = -0  - p * 1.8      // drift slightly down
    camera.position.x =  0  - p * 1.2      // drift slightly left

    // Subtle FOV breathe — wider as you go deeper
    camera.fov = 62 + p * 6                // 62 → 68 °
    camera.updateProjectionMatrix()
  })

  return null
}
