'use client'

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Html, Stars } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import NebulaBackground from '../canvas/NebulaBackground'
import GameHUD from './GameHUD'

const DISTRICTS = [
  {
    id: 'education',
    name: 'EDU TOWERS',
    subtitle: '// EDUCATION BLOCK',
    position: [-28, 0, -34],
    size: [9, 24, 9],
    color: '#00d4ff',
    accent: '#ffd166',
    items: [
      { t: 'Chandigarh University', n: 'B.E. Computer Science 2022-2026 · CGPA 7.7 · patent filed' },
      { t: 'IGNOU', n: 'B.Sc. General (distance) · CGPA 6.3 · Genomic Data Science' },
      { t: 'Certifications', n: 'Microsoft AI Agents · NVIDIA DL for CV · Coursera' },
    ],
  },
  {
    id: 'work',
    name: 'CAREER ORBIT',
    subtitle: '// EXPERIENCE',
    position: [24, 0, -52],
    size: [12, 30, 12],
    color: '#ff4f8b',
    accent: '#00ff88',
    items: [
      { t: '4BaseCare — Data Science Intern', n: 'Cancer ML pipelines: MSI, HER2/ER/PR on H&E slides' },
      { t: 'VECTRA International — Zoho Intern', n: 'Deluge scripts + cross-app automation (Brussels)' },
      { t: 'Clinical AI', n: 'Vector-DB extraction, Guardrails, A2A/MCP, GCP' },
    ],
  },
  {
    id: 'projects',
    name: 'PROJECT AVE',
    subtitle: '// BUILDS',
    position: [-18, 0, -92],
    size: [13, 22, 10],
    color: '#ff8a00',
    accent: '#7c5cff',
    items: [
      { t: 'eraya', n: 'Self-healing multi-agent swarm · fault-tolerant orchestration' },
      { t: 'Nemesis — ML DeFi Agent', n: 'NL to on-chain transactions on Monad Testnet' },
      { t: 'MedGenie 3.0', n: 'One Health platform · React, Django, WebRTC · IDEA-ONE finalist' },
    ],
  },
  {
    id: 'research',
    name: 'IEEE SKYLAB',
    subtitle: '// RESEARCH',
    position: [29, 0, -126],
    size: [10, 27, 10],
    color: '#a66cff',
    accent: '#00d4ff',
    items: [
      { t: 'DNA Analysis — ICWITE 2025', n: 'Machine learning approaches in genomics' },
      { t: 'Edge LLM Compression — ICPC2T 2026', n: 'Adaptive local LLM compression under edge constraints' },
      { t: 'AAA Terrain — DELCON 2025', n: 'Wavelet-based terrain gen for ray-traced games' },
    ],
  },
  {
    id: 'skills',
    name: 'TECH GARAGE',
    subtitle: '// SKILLS',
    position: [-26, 0, -166],
    size: [14, 20, 12],
    color: '#00ff88',
    accent: '#ffef5a',
    items: [
      { t: 'Core', n: 'Python, SQL, JS, Go, Kotlin, C++ · Django, FastAPI, React, Next.js' },
      { t: 'AI / ML', n: 'PyTorch, Slideflow, DINOv2, H-Optimus, LangGraph, n8n, Ollama' },
      { t: 'Platform', n: 'Docker, Kubernetes, AWS, GCP, Zoho, Web3.py, Solidity' },
    ],
  },
  {
    id: 'contact',
    name: 'SIGNAL PIER',
    subtitle: '// CONTACT',
    position: [0, 0, -210],
    size: [15, 18, 12],
    color: '#5cf2ff',
    accent: '#ff4f8b',
    items: [
      { t: 'Email', n: 'sandhupardeep300@gmail.com' },
      { t: 'LinkedIn', n: 'linkedin.com/in/pardeep-singh' },
      { t: 'GitHub', n: 'github.com/martian3062' },
    ],
  },
]

function SpaceRoad() {
  const grid = useRef()

  useFrame(({ clock }) => {
    if (grid.current) grid.current.material.opacity = 0.22 + Math.sin(clock.elapsedTime * 2) * 0.04
  })

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, -112]}>
        <planeGeometry args={[86, 270]} />
        <meshStandardMaterial color="#050711" roughness={0.4} metalness={0.35} />
      </mesh>
      <gridHelper ref={grid} args={[270, 54, '#00d4ff', '#24345f']} position={[0, 0.02, -112]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, -112]}>
        <planeGeometry args={[8, 270]} />
        <meshBasicMaterial color="#ffd166" transparent opacity={0.16} side={THREE.DoubleSide} />
      </mesh>
      {[-42, 42].map(x => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.05, -112]}>
          <planeGeometry args={[2, 270]} />
          <meshBasicMaterial color="#ff4f8b" transparent opacity={0.28} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}

function PortfolioBuilding({ district }) {
  const group = useRef()
  const [w, h, d] = district.size

  useFrame(({ clock }) => {
    if (group.current) group.current.position.y = Math.sin(clock.elapsedTime * 0.7 + district.position[0]) * 0.12
  })

  return (
    <group ref={group} position={district.position}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#070b1e" emissive={district.color} emissiveIntensity={0.18} metalness={0.6} roughness={0.26} />
      </mesh>

      {[-0.34, 0, 0.34].map((x, index) => (
        <mesh key={x} position={[x * w, h + 2 + index * 0.9, 0]}>
          <boxGeometry args={[w * 0.22, 4 + index, d * 0.28]} />
          <meshStandardMaterial color={district.color} emissive={district.color} emissiveIntensity={1.2} />
        </mesh>
      ))}

      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 3 }).map((__, col) => (
          <mesh key={`${row}-${col}`} position={[-w * 0.32 + col * w * 0.32, 5 + row * 3.7, d / 2 + 0.05]}>
            <boxGeometry args={[w * 0.12, 1.1, 0.12]} />
            <meshBasicMaterial color={row % 2 ? district.color : district.accent} transparent opacity={0.82} />
          </mesh>
        ))
      )}

      <pointLight color={district.color} intensity={3.2} distance={42} />

      <Html position={[0, h + 8, 0]} center distanceFactor={34} style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div className="planet-label building-label">
          <p className="planet-label-name" style={{ color: district.accent }}>{district.name}</p>
          <p className="planet-label-sub">{district.subtitle}</p>
        </div>
      </Html>
    </group>
  )
}

function GTAAvatar({ playerRef }) {
  const texture = useLoader(THREE.TextureLoader, '/pardeep-space.jpg')
  const body = useRef()

  useFrame(({ clock }) => {
    if (body.current) body.current.rotation.z = Math.sin(clock.elapsedTime * 7) * 0.04
  })

  return (
    <group ref={playerRef} position={[0, 0, 12]}>
      <group ref={body}>
        <mesh position={[0, 2.95, 0]}>
          <sphereGeometry args={[0.58, 28, 28]} />
          <meshStandardMaterial color="#d99b72" roughness={0.55} />
        </mesh>
        <mesh position={[0, 2.35, -0.02]}>
          <boxGeometry args={[1.15, 1.28, 0.48]} />
          <meshStandardMaterial color="#111827" emissive="#00d4ff" emissiveIntensity={0.16} roughness={0.42} />
        </mesh>
        <mesh position={[0, 3.42, 0.08]}>
          <boxGeometry args={[1.12, 0.22, 0.82]} />
          <meshStandardMaterial color="#2b174c" emissive="#a66cff" emissiveIntensity={0.35} />
        </mesh>
        <mesh position={[-0.72, 2.3, 0]} rotation={[0, 0, 0.18]}>
          <boxGeometry args={[0.28, 1.2, 0.28]} />
          <meshStandardMaterial color="#ffd166" roughness={0.55} />
        </mesh>
        <mesh position={[0.72, 2.3, 0]} rotation={[0, 0, -0.18]}>
          <boxGeometry args={[0.28, 1.2, 0.28]} />
          <meshStandardMaterial color="#ffd166" roughness={0.55} />
        </mesh>
        <mesh position={[-0.28, 1.35, 0]}>
          <boxGeometry args={[0.32, 1.35, 0.32]} />
          <meshStandardMaterial color="#2b2f3a" />
        </mesh>
        <mesh position={[0.28, 1.35, 0]}>
          <boxGeometry args={[0.32, 1.35, 0.32]} />
          <meshStandardMaterial color="#2b2f3a" />
        </mesh>
      </group>

      <mesh position={[0, 2.6, 0.29]}>
        <planeGeometry args={[0.68, 0.9]} />
        <meshBasicMaterial map={texture} transparent opacity={0.9} />
      </mesh>
      <sprite position={[0, 4.25, 0]} scale={[1.25, 1.85, 1]}>
        <spriteMaterial map={texture} transparent opacity={0.82} depthWrite={false} />
      </sprite>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[1.2, 1.8, 48]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color="#00d4ff" intensity={1.8} distance={12} />
    </group>
  )
}

function GameControls({ playerRef, onNearPlanet, externalKeys, mouseDelta }) {
  const keys = useRef({})
  const yaw = useRef(0)
  const velocity = useRef(new THREE.Vector3())
  const hudTimer = useRef(0)
  const nearRef = useRef(null)

  useEffect(() => {
    const down = e => { keys.current[e.code] = true }
    const up = e => { keys.current[e.code] = false }
    const move = e => {
      if (!document.pointerLockElement) return
      mouseDelta.current.x += e.movementX * 0.0022
    }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    document.addEventListener('mousemove', move)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      document.removeEventListener('mousemove', move)
    }
  }, [mouseDelta])

  useFrame(({ camera }, dt) => {
    const player = playerRef.current
    if (!player) return

    yaw.current -= mouseDelta.current.x
    mouseDelta.current.x = 0

    const k = { ...keys.current, ...externalKeys.current }
    const input = new THREE.Vector3(
      (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0),
      0,
      (k.KeyS || k.ArrowDown ? 1 : 0) - (k.KeyW || k.ArrowUp ? 1 : 0)
    )
    const speed = k.ShiftLeft ? 23 : 12

    if (input.length() > 0) {
      input.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current)
      velocity.current.addScaledVector(input, speed * dt * 7)
    }

    velocity.current.multiplyScalar(0.84)
    if (velocity.current.length() > speed) velocity.current.setLength(speed)
    player.position.addScaledVector(velocity.current, dt)
    player.position.x = THREE.MathUtils.clamp(player.position.x, -38, 38)
    player.position.z = THREE.MathUtils.clamp(player.position.z, -224, 22)
    player.rotation.y = yaw.current

    const cameraTarget = new THREE.Vector3(
      player.position.x + Math.sin(yaw.current) * 12,
      player.position.y + 7.4,
      player.position.z + Math.cos(yaw.current) * 12
    )
    camera.position.lerp(cameraTarget, 1 - Math.pow(0.001, dt))
    camera.lookAt(player.position.x, player.position.y + 2.2, player.position.z)

    hudTimer.current += dt
    if (hudTimer.current < 0.1) return
    hudTimer.current = 0

    let nearest = null
    let nearDist = Infinity
    DISTRICTS.forEach(district => {
      const dist = player.position.distanceTo(new THREE.Vector3(...district.position))
      if (dist < 25 && dist < nearDist) {
        nearest = district
        nearDist = dist
      }
    })

    if (nearest?.id !== nearRef.current?.id) {
      nearRef.current = nearest
      onNearPlanet(nearest, nearDist)
    } else if (nearest) {
      onNearPlanet(nearest, nearDist)
    } else if (nearRef.current) {
      nearRef.current = null
      onNearPlanet(null, Infinity)
    }
  })

  return null
}

function GameScene({ onNearPlanet, externalKeys, mouseDelta }) {
  const playerRef = useRef()

  return (
    <>
      <NebulaBackground />
      <Stars radius={420} depth={180} count={15000} factor={7} saturation={0.35} fade speed={0.35} />

      <ambientLight intensity={0.18} />
      <hemisphereLight skyColor="#071436" groundColor="#090014" intensity={0.55} />
      <directionalLight position={[18, 36, 18]} intensity={1.15} color="#ffffff" />

      <SpaceRoad />
      {DISTRICTS.map(district => <PortfolioBuilding key={district.id} district={district} />)}
      <GTAAvatar playerRef={playerRef} />
      <GameControls playerRef={playerRef} onNearPlanet={onNearPlanet} externalKeys={externalKeys} mouseDelta={mouseDelta} />

      <EffectComposer>
        <Bloom intensity={2.9} luminanceThreshold={0.1} luminanceSmoothing={0.78} radius={0.95} mipmapBlur />
        <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.0024, 0.0024]} />
        <Vignette eskil={false} offset={0.08} darkness={0.9} />
      </EffectComposer>
    </>
  )
}

export default function SpaceGame({ onExit }) {
  const [nearPlanet, setNearPlanet] = useState(null)
  const [nearDist, setNearDist] = useState(Infinity)
  const [locked, setLocked] = useState(false)

  const canvasEl = useRef(null)
  const externalKeys = useRef({})
  const mouseDelta = useRef({ x: 0, y: 0 })

  useEffect(() => {
    let last = null
    const onStart = e => {
      const t = e.touches[0]
      if (t.clientX > window.innerWidth * 0.45) last = { x: t.clientX, y: t.clientY }
    }
    const onMove = e => {
      const t = e.touches[0]
      if (t.clientX > window.innerWidth * 0.45 && last) {
        mouseDelta.current.x += (t.clientX - last.x) * 0.006
        last = { x: t.clientX, y: t.clientY }
      }
    }
    const onEnd = () => { last = null }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
  }, [])

  useEffect(() => {
    const change = () => setLocked(!!document.pointerLockElement)
    document.addEventListener('pointerlockchange', change)
    return () => document.removeEventListener('pointerlockchange', change)
  }, [])

  useEffect(() => () => {
    if (document.pointerLockElement) document.exitPointerLock()
  }, [])

  const handleNear = useCallback((district, distance) => {
    setNearPlanet(district ?? null)
    setNearDist(distance ?? Infinity)
  }, [])

  const requestLock = useCallback(() => {
    canvasEl.current?.requestPointerLock()
  }, [])

  const districts = useMemo(() => DISTRICTS, [])

  return (
    <div className="game-wrapper">
      <Canvas
        camera={{ position: [0, 7, 28], fov: 68 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        onClick={requestLock}
        onCreated={({ gl }) => { canvasEl.current = gl.domElement }}
      >
        <Suspense fallback={null}>
          <GameScene onNearPlanet={handleNear} externalKeys={externalKeys} mouseDelta={mouseDelta} />
        </Suspense>
      </Canvas>

      <GameHUD
        locked={locked}
        nearPlanet={nearPlanet}
        nearDist={nearDist}
        onExit={onExit}
        onLock={requestLock}
        externalKeys={externalKeys}
        planets={districts}
      />
    </div>
  )
}
