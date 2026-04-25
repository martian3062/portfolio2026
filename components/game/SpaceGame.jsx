'use client'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Suspense, useRef, useState, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import NebulaBackground from '../canvas/NebulaBackground'
import Planet from './Planet'
import GameHUD from './GameHUD'

// ─── Planet data (each = one section of your life) ────────────────────────────
const PLANETS = [
  {
    id: 'education',
    name: 'ACADEMIA',
    subtitle: '// EDUCATION',
    position: [-28, 7, -75],
    radius: 4.5,
    color: '#0088ff',
    atmosphereColor: '#002299',
    rings: false,
    items: [
      { t: 'Chandigarh University', n: 'B.E. Computer Science · 2022–2026 · CGPA 7.7' },
      { t: 'IGNOU',                 n: 'B.Sc. General · Distance Program' },
      { t: 'Certifications',        n: 'Microsoft AI · NVIDIA Deep Learning · Coursera' },
    ],
  },
  {
    id: 'projects',
    name: 'FORGE',
    subtitle: '// MISSION LOG',
    position: [32, -6, -140],
    radius: 3.6,
    color: '#ff8800',
    atmosphereColor: '#aa2200',
    rings: true,
    items: [
      { t: 'MedGenie 3.0',    n: 'Healthcare AI — React, Django, JWT, LLMs, forecasting' },
      { t: 'Telemedicine',    n: 'WebRTC live sessions + real-time clinical dashboards' },
      { t: 'Gen3 DeFi Agent', n: 'Web3 automation, wallet flows, WebSocket sim engine' },
    ],
  },
  {
    id: 'research',
    name: 'NEXUS',
    subtitle: '// RESEARCH',
    position: [-22, 13, -210],
    radius: 3.1,
    color: '#00d4ff',
    atmosphereColor: '#003366',
    rings: false,
    items: [
      { t: 'IEEE ICWITE 2025',  n: 'Machine Learning Approaches in DNA Analysis' },
      { t: 'IEEE PUNECON 2025', n: 'LLMs in multilingual & low-resource contexts' },
      { t: 'IEEE DELCON 2025',  n: 'Wavelet terrain generation + epigenetic modification' },
    ],
  },
  {
    id: 'skills',
    name: 'ARSENAL',
    subtitle: '// TECH STACK',
    position: [36, -11, -278],
    radius: 3.3,
    color: '#00ff88',
    atmosphereColor: '#003322',
    rings: false,
    items: [
      { t: 'Core',     n: 'Python · JavaScript · Django · DRF · React · WebSockets' },
      { t: 'Platform', n: 'Docker · AWS · Postgres · SQLite · MySQL · Git' },
      { t: 'AI / ML',  n: 'LLM tooling · Computer Vision · Forecasting models' },
    ],
  },
  {
    id: 'contact',
    name: 'BEACON',
    subtitle: '// OPEN CHANNEL',
    position: [0, 5, -345],
    radius: 4.2,
    color: '#9b30ff',
    atmosphereColor: '#330066',
    rings: false,
    items: [
      { t: 'Email',    n: 'sandhupardeep300@gmail.com' },
      { t: 'LinkedIn', n: 'linkedin.com/in/pardeep-singh' },
      { t: 'GitHub',   n: 'github.com/pardeepsandhu' },
    ],
  },
]

// ─── Player movement + look controls (inside Canvas) ─────────────────────────
function GameControls({ onNearPlanet, externalKeys, mouseDelta }) {
  const { camera } = useThree()
  const vel      = useRef(new THREE.Vector3())
  const keys     = useRef({})
  const yaw      = useRef(0)
  const pitch    = useRef(0)
  const locked   = useRef(false)
  const hudTimer = useRef(0)
  const nearRef  = useRef(null)

  useEffect(() => {
    camera.position.set(0, 2, 22)
    camera.rotation.order = 'YXZ'

    const down     = e  => { keys.current[e.code] = true }
    const up       = e  => { keys.current[e.code] = false }
    const onMove   = e  => {
      if (!locked.current) return
      mouseDelta.current.x += e.movementX * 0.0016
      mouseDelta.current.y += e.movementY * 0.0016
    }
    const onLockCh = () => { locked.current = !!document.pointerLockElement }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup',   up)
    document.addEventListener('mousemove',         onMove)
    document.addEventListener('pointerlockchange', onLockCh)

    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup',   up)
      document.removeEventListener('mousemove',         onMove)
      document.removeEventListener('pointerlockchange', onLockCh)
    }
  }, [camera, mouseDelta])

  useFrame((_, dt) => {
    // ── Mouse look ──────────────────────────────────────────────────────────
    yaw.current   -= mouseDelta.current.x
    pitch.current -= mouseDelta.current.y
    pitch.current  = Math.max(-1.3, Math.min(1.3, pitch.current))
    mouseDelta.current.x = 0
    mouseDelta.current.y = 0
    camera.rotation.y = yaw.current
    camera.rotation.x = pitch.current

    // ── Movement ────────────────────────────────────────────────────────────
    const k   = { ...keys.current, ...externalKeys.current }
    const spd = k['ShiftLeft'] ? 32 : 15
    const dir = new THREE.Vector3()
    if (k['KeyW'] || k['ArrowUp'])    dir.z -= 1
    if (k['KeyS'] || k['ArrowDown'])  dir.z += 1
    if (k['KeyA'] || k['ArrowLeft'])  dir.x -= 1
    if (k['KeyD'] || k['ArrowRight']) dir.x += 1
    if (k['Space'])       dir.y += 0.6
    if (k['ControlLeft']) dir.y -= 0.6

    if (dir.length() > 0) {
      dir.normalize().multiplyScalar(spd * dt * 9)
      dir.applyQuaternion(camera.quaternion)
      vel.current.add(dir)
    }
    // Cap + damp
    if (vel.current.length() > spd) vel.current.setLength(spd)
    vel.current.multiplyScalar(0.87)
    camera.position.addScaledVector(vel.current, dt)

    // ── Proximity check (throttled ~8fps for React state) ──────────────────
    hudTimer.current += dt
    if (hudTimer.current < 0.12) return
    hudTimer.current = 0

    let nearest = null, nearDist = Infinity
    PLANETS.forEach(p => {
      const d = camera.position.distanceTo(new THREE.Vector3(...p.position))
      if (d < p.radius + 22 && d < nearDist) { nearest = p; nearDist = d }
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

// ─── Scene (inside Canvas) ────────────────────────────────────────────────────
function GameScene({ onNearPlanet, externalKeys, mouseDelta }) {
  return (
    <>
      <NebulaBackground />
      <Stars radius={400} depth={150} count={12000} factor={6} saturation={0.3} fade speed={0.25} />

      <ambientLight intensity={0.04} />
      <hemisphereLight skyColor="#000a22" groundColor="#0a0005" intensity={0.45} />

      <GameControls
        onNearPlanet={onNearPlanet}
        externalKeys={externalKeys}
        mouseDelta={mouseDelta}
      />

      {PLANETS.map(p => <Planet key={p.id} {...p} />)}

      <EffectComposer>
        <Bloom
          intensity={2.4}
          luminanceThreshold={0.12}
          luminanceSmoothing={0.78}
          radius={0.95}
          mipmapBlur
        />
        <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.0022, 0.0022]} />
        <Vignette eskil={false} offset={0.1} darkness={0.92} />
      </EffectComposer>
    </>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function SpaceGame({ onExit }) {
  const [nearPlanet, setNearPlanet] = useState(null)
  const [nearDist,   setNearDist]   = useState(Infinity)
  const [locked,     setLocked]     = useState(false)

  const canvasEl    = useRef(null)
  const externalKeys = useRef({})
  const mouseDelta  = useRef({ x: 0, y: 0 })

  // Touch-look: swipe on the right half of the screen
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
        mouseDelta.current.y += (t.clientY - last.y) * 0.006
        last = { x: t.clientX, y: t.clientY }
      }
    }
    const onEnd = () => { last = null }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchmove',  onMove,  { passive: true })
    window.addEventListener('touchend',   onEnd,   { passive: true })
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove',  onMove)
      window.removeEventListener('touchend',   onEnd)
    }
  }, [])

  // Pointer-lock state sync
  useEffect(() => {
    const ch = () => setLocked(!!document.pointerLockElement)
    document.addEventListener('pointerlockchange', ch)
    return () => document.removeEventListener('pointerlockchange', ch)
  }, [])

  // Release lock on exit
  useEffect(() => {
    return () => {
      if (document.pointerLockElement) document.exitPointerLock()
    }
  }, [])

  const handleNear = useCallback((p, d) => {
    setNearPlanet(p ?? null)
    setNearDist(d  ?? Infinity)
  }, [])

  const requestLock = useCallback(() => {
    canvasEl.current?.requestPointerLock()
  }, [])

  return (
    <div className="game-wrapper">
      <Canvas
        camera={{ position: [0, 2, 22], fov: 72 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        onClick={requestLock}
        onCreated={({ gl }) => { canvasEl.current = gl.domElement }}
      >
        <Suspense fallback={null}>
          <GameScene
            onNearPlanet={handleNear}
            externalKeys={externalKeys}
            mouseDelta={mouseDelta}
          />
        </Suspense>
      </Canvas>

      <GameHUD
        locked={locked}
        nearPlanet={nearPlanet}
        nearDist={nearDist}
        onExit={onExit}
        onLock={requestLock}
        externalKeys={externalKeys}
        planets={PLANETS}
      />
    </div>
  )
}
