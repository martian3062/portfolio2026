'use client'
import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

// Instanced bridges + sphere nodes = 2 draw calls instead of ~50.

const _dummy = new THREE.Object3D()
const _up    = new THREE.Vector3(0, 1, 0)
const _dir   = new THREE.Vector3()
const _mid   = new THREE.Vector3()

const TURNS  = 4
const HEIGHT = 14
const RADIUS = 1.0
const N      = 220   // curve points

export default function QuantumHelix({ position = [-7, 1, -16] }) {
  const groupRef    = useRef()
  const bridgesRef  = useRef()
  const nodesARef   = useRef()
  const nodesBRef   = useRef()

  const { curve1, curve2, pts1, pts2, bridges } = useMemo(() => {
    const pts1 = [], pts2 = []
    for (let i = 0; i <= N; i++) {
      const t = i / N, a = t * Math.PI * 2 * TURNS, y = t * HEIGHT - HEIGHT / 2
      pts1.push(new THREE.Vector3( Math.cos(a) * RADIUS, y,  Math.sin(a) * RADIUS))
      pts2.push(new THREE.Vector3(-Math.cos(a) * RADIUS, y, -Math.sin(a) * RADIUS))
    }
    const bridges = []
    for (let i = 0; i <= N; i += 10) {
      if (pts1[i] && pts2[i]) bridges.push({ a: pts1[i], b: pts2[i] })
    }
    return {
      curve1: new THREE.CatmullRomCurve3(pts1),
      curve2: new THREE.CatmullRomCurve3(pts2),
      pts1, pts2, bridges,
    }
  }, [])

  // Upload instanced bridge matrices
  useEffect(() => {
    const bm = bridgesRef.current, na = nodesARef.current, nb = nodesBRef.current
    if (!bm || !na || !nb) return
    bridges.forEach(({ a, b }, i) => {
      _mid.lerpVectors(a, b, 0.5)
      _dir.subVectors(b, a).normalize()
      const q = new THREE.Quaternion().setFromUnitVectors(_up, _dir)
      _dummy.position.copy(_mid)
      _dummy.quaternion.copy(q)
      _dummy.scale.set(1, a.distanceTo(b), 1)
      _dummy.updateMatrix()
      bm.setMatrixAt(i, _dummy.matrix)

      _dummy.position.copy(a); _dummy.quaternion.identity(); _dummy.scale.setScalar(1)
      _dummy.updateMatrix(); na.setMatrixAt(i, _dummy.matrix)

      _dummy.position.copy(b); _dummy.updateMatrix(); nb.setMatrixAt(i, _dummy.matrix)
    })
    bm.instanceMatrix.needsUpdate = true
    na.instanceMatrix.needsUpdate = true
    nb.instanceMatrix.needsUpdate = true
  }, [bridges])

  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.rotation.y = clock.getElapsedTime() * 0.11
  })

  const bCount = bridges.length

  return (
    <Float speed={0.22} floatIntensity={0.3} rotationIntensity={0.06}>
      <group ref={groupRef} position={position}>

        {/* Strand A */}
        <mesh>
          <tubeGeometry args={[curve1, 160, 0.025, 7, false]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={1.6} metalness={0.75} roughness={0.2} />
        </mesh>

        {/* Strand B */}
        <mesh>
          <tubeGeometry args={[curve2, 160, 0.025, 7, false]} />
          <meshStandardMaterial color="#9b30ff" emissive="#9b30ff" emissiveIntensity={1.6} metalness={0.75} roughness={0.2} />
        </mesh>

        {/* Bridges (instanced) */}
        <instancedMesh ref={bridgesRef} args={[undefined, undefined, bCount]}>
          <cylinderGeometry args={[0.014, 0.014, 1, 5]} />
          <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2.2} metalness={0.6} roughness={0.3} />
        </instancedMesh>

        {/* Node spheres A (instanced) */}
        <instancedMesh ref={nodesARef} args={[undefined, undefined, bCount]}>
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={3.0} />
        </instancedMesh>

        {/* Node spheres B (instanced) */}
        <instancedMesh ref={nodesBRef} args={[undefined, undefined, bCount]}>
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshStandardMaterial color="#9b30ff" emissive="#9b30ff" emissiveIntensity={3.0} />
        </instancedMesh>

      </group>
    </Float>
  )
}
