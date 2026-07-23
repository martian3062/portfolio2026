'use client'
import { Suspense, useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sparkles, Sky } from '@react-three/drei'
import * as THREE from 'three'
import {
  createHandTracker, getWristNorm, getPinchStrength,
  getStringPull, HAND_CONNECTIONS, LM,
} from '../../lib/handTracker'

// ─── Colour palette ───────────────────────────────────────────────────────────
const C = {
  joint:    'rgba(0,212,255,0.9)',
  bone:     'rgba(0,212,255,0.55)',
  tip:      'rgba(155,48,255,1)',
  tipGlow:  'rgba(155,48,255,0.4)',
  pinch:    'rgba(255,184,0,1)',
  label:    'rgba(0,212,255,0.7)',
}

// ─── Hand skeleton overlay renderer ──────────────────────────────────────────
function drawHand(ctx, lms, W, H, isPinching, confidence) {
  const px = lm => (1 - lm.x) * W   // mirror x
  const py = lm => lm.y * H

  // Bones
  ctx.lineWidth = 2
  HAND_CONNECTIONS.forEach(([a, b]) => {
    ctx.strokeStyle = C.bone
    ctx.beginPath()
    ctx.moveTo(px(lms[a]), py(lms[a]))
    ctx.lineTo(px(lms[b]), py(lms[b]))
    ctx.stroke()
  })

  // Joints
  lms.forEach((lm, i) => {
    const isTip  = [4, 8, 12, 16, 20].includes(i)
    const isWrist = i === 0
    const x = px(lm), y = py(lm)
    const r = isTip ? 6 : isWrist ? 7 : 4

    if (isTip) {
      // Glow ring
      const grd = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5)
      grd.addColorStop(0, C.tipGlow)
      grd.addColorStop(1, 'transparent')
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.arc(x, y, r * 2.5, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = isTip ? (isPinching && i === 4 ? C.pinch : C.tip) : C.joint
    ctx.fill()
  })

  // Pinch line: thumb ↔ index tip
  if (isPinching) {
    const t = lms[LM.THUMB_TIP], f = lms[LM.INDEX_TIP]
    ctx.strokeStyle = C.pinch
    ctx.lineWidth   = 2.5
    ctx.setLineDash([4, 3])
    ctx.beginPath()
    ctx.moveTo(px(t), py(t))
    ctx.lineTo(px(f), py(f))
    ctx.stroke()
    ctx.setLineDash([])
  }

  // Confidence badge
  ctx.font = 'bold 10px monospace'
  ctx.fillStyle = C.label
  const wx = px(lms[LM.WRIST]), wy = py(lms[LM.WRIST])
  ctx.fillText(`${(confidence * 100).toFixed(0)}%`, wx + 8, wy + 4)
}

// ─── Kite 3D mesh ─────────────────────────────────────────────────────────────
function Kite({ kitePos, windRef, tension }) {
  const groupRef = useRef()
  const tailPts  = useRef(Array.from({ length: 22 }, (_, i) => new THREE.Vector3(0, -i * 0.24, 0)))

  const tailGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(22 * 3), 3))
    return g
  }, [])

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()

    groupRef.current.position.lerp(kitePos.current, Math.min(1, delta * 6))
    groupRef.current.rotation.z = -(kitePos.current.x - groupRef.current.position.x) * 1.8
    groupRef.current.rotation.x = (kitePos.current.y - groupRef.current.position.y) * 0.7
    groupRef.current.rotation.y = Math.sin(t * 0.9) * 0.07 + windRef.current.x * 0.45

    // Tail physics with tension influence
    const pull = tension.current
    tailPts.current[0].copy(groupRef.current.position).add(new THREE.Vector3(0, -0.3, 0))
    for (let i = 1; i < tailPts.current.length; i++) {
      const prev = tailPts.current[i - 1]
      const t2 = new THREE.Vector3(
        prev.x + windRef.current.x * (0.14 + pull * 0.08) * i * 0.05,
        prev.y - 0.22 + pull * 0.03,
        prev.z + Math.sin(t * 1.6 + i * 0.55) * (0.05 - pull * 0.025),
      )
      tailPts.current[i].lerp(t2, Math.min(1, delta * 14))
    }
    const pos = tailGeo.attributes.position
    tailPts.current.forEach((p, i) => pos.setXYZ(i, p.x, p.y, p.z))
    pos.needsUpdate = true
    tailGeo.computeBoundingSphere()
  })

  return (
    <>
      <group ref={groupRef} position={[0, 3, 0]}>
        {/* Diamond face */}
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[1.15, 1.15, 0.045]} />
          <meshStandardMaterial color="#ff3300" emissive="#ff1100" emissiveIntensity={0.35} roughness={0.55} />
        </mesh>
        {/* Vertical spine */}
        <mesh><boxGeometry args={[0.045, 1.65, 0.06]} /><meshStandardMaterial color="#3d1500" roughness={0.9} /></mesh>
        {/* Horizontal spine */}
        <mesh rotation={[0, 0, Math.PI / 2]}><boxGeometry args={[0.045, 1.15, 0.06]} /><meshStandardMaterial color="#3d1500" roughness={0.9} /></mesh>
        {/* Decorative strips */}
        {[-0.32, 0, 0.32].map((x, i) => (
          <mesh key={i} position={[x, 0, 0.035]}>
            <boxGeometry args={[0.065, 1.45, 0.012]} />
            <meshStandardMaterial
              color={i === 1 ? '#ffdd00' : '#0088ff'}
              emissive={i === 1 ? '#ffaa00' : '#0055ff'}
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
      </group>
      {/* Ribbon tail */}
      <line geometry={tailGeo}>
        <lineBasicMaterial color="#ff6600" linewidth={2} />
      </line>
    </>
  )
}

// ─── Ground ───────────────────────────────────────────────────────────────────
const _wDummy = new THREE.Object3D()

function RuralGround() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(240, 240, 100, 100)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i)
      p.setZ(i, Math.sin(x * 0.07) * Math.cos(z * 0.055) * 1.3 + Math.sin(x * 0.28 + z * 0.19) * 0.35)
    }
    g.computeVertexNormals()
    return g
  }, [])

  return <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
    <meshStandardMaterial color="#b8a645" roughness={0.96} />
  </mesh>
}

function WheatField() {
  const ref = useRef()
  useEffect(() => {
    if (!ref.current) return
    for (let i = 0; i < 1000; i++) {
      _wDummy.position.set((Math.random() - 0.5) * 200, -3 + Math.random() * 0.5, (Math.random() - 0.5) * 200)
      _wDummy.scale.set(0.28 + Math.random() * 0.3, 0.6 + Math.random() * 0.7, 0.28 + Math.random() * 0.3)
      _wDummy.rotation.set(0, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.18)
      _wDummy.updateMatrix()
      ref.current.setMatrixAt(i, _wDummy.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [])
  return <instancedMesh ref={ref} args={[undefined, undefined, 1000]}>
    <cylinderGeometry args={[0.04, 0.08, 2, 5]} />
    <meshStandardMaterial color="#d4a030" roughness={0.95} />
  </instancedMesh>
}

const _tDummy = new THREE.Object3D()
function Trees() {
  const trunk = useRef(), crown = useRef()
  useEffect(() => {
    if (!trunk.current || !crown.current) return
    for (let i = 0; i < 55; i++) {
      const a = (i / 55) * Math.PI * 2 + Math.random() * 0.5
      const r = 38 + Math.random() * 70
      const x = Math.cos(a) * r, z = Math.sin(a) * r
      const h = 2.8 + Math.random() * 2.2
      _tDummy.position.set(x, -3 + h / 2, z); _tDummy.scale.set(1, h, 1); _tDummy.updateMatrix()
      trunk.current.setMatrixAt(i, _tDummy.matrix)
      _tDummy.position.set(x, -3 + h + 1.8, z); _tDummy.scale.setScalar(2 + Math.random() * 0.9); _tDummy.rotation.set(0,0,0); _tDummy.updateMatrix()
      crown.current.setMatrixAt(i, _tDummy.matrix)
    }
    trunk.current.instanceMatrix.needsUpdate = true
    crown.current.instanceMatrix.needsUpdate = true
  }, [])
  return <>
    <instancedMesh ref={trunk} args={[undefined, undefined, 55]}>
      <cylinderGeometry args={[0.2, 0.32, 1, 6]} />
      <meshStandardMaterial color="#4a3520" roughness={0.9} />
    </instancedMesh>
    <instancedMesh ref={crown} args={[undefined, undefined, 55]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#265a18" roughness={0.95} />
    </instancedMesh>
  </>
}

function KiteString({ kitePos }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
    return g
  }, [])
  useFrame(() => {
    const p = geo.attributes.position, k = kitePos.current
    p.setXYZ(0, 0, -2.5, 3); p.setXYZ(1, k.x, k.y, k.z); p.needsUpdate = true
  })
  return <line geometry={geo}><lineBasicMaterial color="#ccccaa" opacity={0.7} transparent /></line>
}

function KiteScene({ kitePos, windRef, tension, arMode }) {
  const { camera } = useThree()
  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const k = kitePos.current
    camera.position.x += (k.x * 0.14 - camera.position.x) * delta * 0.7
    camera.position.y += (Math.max(0, k.y * 0.1 - 0.4) - camera.position.y) * delta * 0.7
    camera.lookAt(k.x * 0.28, k.y * 0.45, 0)
    windRef.current.x     = Math.sin(t * 0.17) * 0.7 + Math.sin(t * 0.39) * 0.35
    windRef.current.speed = 0.4 + Math.abs(Math.sin(t * 0.24)) * 0.65
  })

  return <>
    {!arMode && <Sky sunPosition={[100, 22, 80]} inclination={0.49} azimuth={0.25} turbidity={2.5} rayleigh={1.8} />}
    <ambientLight intensity={arMode ? 0.6 : 0.9} color="#fff5e0" />
    <directionalLight position={[50, 80, 30]} intensity={2.2} color="#ffe090" />
    <hemisphereLight skyColor="#87ceeb" groundColor="#b5a642" intensity={0.65} />
    {!arMode && <><RuralGround /><WheatField /><Trees /></>}
    {!arMode && <Sparkles count={80} scale={[60,30,60]} size={1.5} speed={0.03} opacity={0.12} color="#ffe8a0" />}
    <KiteString kitePos={kitePos} />
    <Kite kitePos={kitePos} windRef={windRef} tension={tension} />
  </>
}

// ─── Main game component ──────────────────────────────────────────────────────
export default function KiteGame({ onExit }) {
  const kitePos   = useRef(new THREE.Vector3(0, 3, 0))
  const windRef   = useRef({ x: 0, speed: 0.5 })
  const tension   = useRef(0)
  const dragging  = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })

  const videoRef      = useRef()
  const overlayRef    = useRef()  // hand skeleton canvas
  const trackerRef    = useRef()
  const rafRef        = useRef()
  const cancelRef     = useRef(null)  // cancels in-flight startHandTracking

  const [arMode,     setArMode]     = useState(false)
  const [handMode,   setHandMode]   = useState('loading') // loading|active|denied|none
  const [gesture,    setGesture]    = useState('')
  const [confidence, setConfidence] = useState(0)
  const [wind,       setWind]       = useState({ speed: 0 })

  // ── Wind HUD refresh ──
  useEffect(() => {
    const id = setInterval(() => setWind({ speed: windRef.current.speed }), 250)
    return () => clearInterval(id)
  }, [])

  // ── Start MediaPipe hand tracking ──────────────────────────────────────────
  const startHandTracking = useCallback(async () => {
    // Cancel any prior in-flight init (React Strict Mode double-invoke, hot reload)
    cancelRef.current?.()
    cancelAnimationFrame(rafRef.current)
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop())

    let cancelled = false
    cancelRef.current = () => { cancelled = true }

    setHandMode('loading')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user', frameRate: { ideal: 60 } },
      })
      if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }

      videoRef.current.srcObject = stream

      await new Promise((resolve, reject) => {
        const v = videoRef.current
        v.onplaying = resolve
        v.onerror   = reject
        v.play().catch(reject)
      })
      if (cancelled) return

      trackerRef.current = await createHandTracker()
      if (cancelled) return

      setHandMode('active')
      setArMode(true)

      let lastTs = -1
      const loop = (ts) => {
        if (cancelled) return   // stop loop when this invocation is superseded
        rafRef.current = requestAnimationFrame(loop)
        if (ts - lastTs < 16) return  // cap at ~60fps
        lastTs = ts

        const video   = videoRef.current
        const overlay = overlayRef.current
        if (!video || !overlay || video.readyState < 2 || video.videoWidth === 0) return

        const W = overlay.width, H = overlay.height
        const ctx = overlay.getContext('2d')
        ctx.clearRect(0, 0, W, H)

        const result = trackerRef.current?.detect(video, ts)
        if (!result || !result.landmarks.length) return

        result.landmarks.forEach((lms, hi) => {
          const conf    = result.handednesses[hi]?.[0]?.score ?? 0
          const pinch   = getPinchStrength(lms) < 0.08
          const pull    = getStringPull(lms)
          const wrist   = getWristNorm(lms)
          const gesture = result.gestures[hi]?.[0]?.categoryName ?? ''

          drawHand(ctx, lms, W, H, pinch, conf)

          if (hi === 0) {
            const targetX = (wrist.x - 0.5) * 14
            const targetY = (0.65 - wrist.y) * 16 + 1
            kitePos.current.x = THREE.MathUtils.lerp(kitePos.current.x, targetX, 0.12)
            kitePos.current.y = THREE.MathUtils.clamp(
              THREE.MathUtils.lerp(kitePos.current.y, targetY + pull * 2, 0.12), 0.5, 14
            )
            tension.current = pull
            setGesture(pinch ? '🤏 PINCH — REEL IN' : gesture ? `✋ ${gesture.toUpperCase()}` : '')
            setConfidence(conf)
          }
        })
      }
      rafRef.current = requestAnimationFrame(loop)
    } catch {
      if (!cancelled) setHandMode('denied')
    }
  }, [])

  // ── Stop tracking ──────────────────────────────────────────────────────────
  const stopHandTracking = useCallback(() => {
    cancelRef.current?.()
    cancelAnimationFrame(rafRef.current)
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop())
    trackerRef.current?.close()
    setHandMode('none')
    setArMode(false)
  }, [])

  useEffect(() => {
    startHandTracking()
    return () => {
      cancelRef.current?.()
      cancelAnimationFrame(rafRef.current)
      videoRef.current?.srcObject?.getTracks().forEach(t => t.stop())
    }
  }, [])

  // ── Fallback mouse/touch drag ──────────────────────────────────────────────
  const onPointerDown = e => { dragging.current = true; lastMouse.current = { x: e.clientX, y: e.clientY } }
  const onPointerUp   = () => { dragging.current = false }
  const onPointerMove = e => {
    if (handMode === 'active' || !dragging.current) return
    const dx = (e.clientX - lastMouse.current.x) / window.innerWidth  * 14
    const dy = -(e.clientY - lastMouse.current.y) / window.innerHeight * 10
    kitePos.current.x = Math.max(-8, Math.min(8,  kitePos.current.x + dx))
    kitePos.current.y = Math.max(0.5, Math.min(13, kitePos.current.y + dy))
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }

  // ── Device tilt ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (handMode === 'active') return
    const onOrient = e => {
      if (e.gamma == null) return
      kitePos.current.x = Math.max(-8, Math.min(8,  kitePos.current.x + e.gamma / 45 * 0.07))
      kitePos.current.y = Math.max(0.5, Math.min(13, kitePos.current.y - e.beta  / 90 * 0.05))
    }
    window.addEventListener('deviceorientation', onOrient)
    return () => window.removeEventListener('deviceorientation', onOrient)
  }, [handMode])

  // ── Keyboard fallback ─────────────────────────────────────────────────────
  useEffect(() => {
    const keys = {}
    const dn = e => { keys[e.key] = true }
    const up = e => { keys[e.key] = false }
    let af
    const loop = () => {
      if (handMode !== 'active') {
        const s = 0.09
        if (keys['ArrowLeft']  || keys['a']) kitePos.current.x = Math.max(-8,  kitePos.current.x - s)
        if (keys['ArrowRight'] || keys['d']) kitePos.current.x = Math.min(8,   kitePos.current.x + s)
        if (keys['ArrowUp']    || keys['w']) kitePos.current.y = Math.min(13,  kitePos.current.y + s)
        if (keys['ArrowDown']  || keys['s']) kitePos.current.y = Math.max(0.5, kitePos.current.y - s)
      }
      af = requestAnimationFrame(loop)
    }
    af = requestAnimationFrame(loop)
    window.addEventListener('keydown', dn)
    window.addEventListener('keyup', up)
    return () => { cancelAnimationFrame(af); window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up) }
  }, [handMode])

  return (
    <div className="kite-game-root" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerMove={onPointerMove}>

      {/* ── AR webcam background ── */}
      <video
        ref={videoRef}
        className={`kite-ar-video ${arMode ? 'kite-ar-video--active' : ''}`}
        playsInline muted autoPlay
      />

      {/* ── 3D canvas ── */}
      <Canvas
        className="kite-3d-canvas"
        camera={{ position: [0, 2, 13], fov: 65, near: 0.1, far: 600 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.1
          gl.setClearAlpha(0)
        }}
      >
        <Suspense fallback={null}>
          <KiteScene kitePos={kitePos} windRef={windRef} tension={tension} arMode={arMode} />
        </Suspense>
      </Canvas>

      {/* ── Hand landmark overlay ── */}
      <canvas
        ref={overlayRef}
        className="kite-hand-overlay"
        width={640}
        height={480}
      />

      {/* ── Loading / denied banner ── */}
      {handMode === 'loading' && (
        <div className="kite-hand-status">
          <span className="kite-hand-spin">◌</span>
          INITIALISING MEDIAPIPE · LOADING GPU WASM...
        </div>
      )}
      {handMode === 'denied' && (
        <div className="kite-hand-status kite-hand-status--warn">
          CAMERA ACCESS DENIED · USING MOUSE / KEYBOARD CONTROL
        </div>
      )}

      {/* ── Hand mode HUD (top-left when active) ── */}
      {handMode === 'active' && (
        <div className="kite-hand-hud">
          <div className="khh-row">
            <span className="khh-dot" />
            MEDIAPIPE HANDS
          </div>
          {gesture && <div className="khh-gesture">{gesture}</div>}
          <div className="khh-conf">CONF {(confidence * 100).toFixed(0)}%</div>
          <button className="khh-stop" onClick={stopHandTracking}>STOP AR</button>
        </div>
      )}
      {handMode === 'denied' && (
        <button className="kite-restart-ar" onClick={startHandTracking}>RETRY CAMERA</button>
      )}

      {/* ── Wind HUD ── */}
      <div className="kite-hud">
        <div className="kite-hud-row">
          <span className="kite-hud-label">WIND</span>
          <span className="kite-hud-val">{(wind.speed * 10).toFixed(1)} m/s</span>
        </div>
        <div className="kite-hud-row">
          <span className="kite-hud-label">HEIGHT</span>
          <span className="kite-hud-val">{(kitePos.current.y * 12).toFixed(0)} m</span>
        </div>
        <div className="kite-hud-row">
          <span className="kite-hud-label">TENSION</span>
          <span className="kite-hud-val">{(tension.current * 100).toFixed(0)}%</span>
        </div>
        <div className="kite-hud-tip">
          {handMode === 'active' ? '✋ MOVE HAND TO STEER · PINCH TO REEL IN' : 'DRAG · WASD · TILT DEVICE'}
        </div>
      </div>

      {/* ── Control hints ── */}
      <div className="kite-controls-hint">
        <span>✋ HAND TRACKING</span>
        <span>🖱 DRAG</span>
        <span>⌨ WASD</span>
        <span>📱 TILT</span>
      </div>

      {/* ── Env label ── */}
      <div className="kite-env-label">
        PUNJAB · HARVEST SEASON · 38°C
        {arMode && <span style={{ color: '#00ff88', marginLeft: 10 }}>● AR LIVE</span>}
      </div>

      {/* ── Game corners + exit ── */}
      <div className="game-corners">
        <div className="gc gc-tl" /><div className="gc gc-tr" />
        <div className="gc gc-bl" /><div className="gc gc-br" />
      </div>
      <button className="game-exit-btn" onClick={onExit}>⟵ EXIT</button>
    </div>
  )
}
