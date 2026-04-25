'use client'
import { useProgress } from '@react-three/drei'
import { useEffect, useState } from 'react'

const STAGES = [
  'CALIBRATING EVENT HORIZON',
  'MAPPING GRAVITATIONAL FIELD',
  'SYNCHRONISING ASTROPHAGE DATA',
  'COMPUTING NULL GEODESICS',
  'LOADING ACCRETION DISK',
  'INITIALISING SPACETIME',
]

export default function LoadingScreen() {
  const { progress, active } = useProgress()
  const [visible, setVisible] = useState(true)
  const [stage, setStage]     = useState(0)
  const [fadeOut, setFadeOut] = useState(false)
  const [minReady, setMinReady] = useState(false)
  const pct = Math.floor(progress)

  // Cycle through stages
  useEffect(() => {
    const id = setInterval(() => setStage(s => (s + 1) % STAGES.length), 900)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setTimeout(() => setMinReady(true), 3000)
    return () => clearTimeout(id)
  }, [])

  // Start fade when loading completes
  useEffect(() => {
    if (minReady && !active && progress >= 99) {
      setTimeout(() => setFadeOut(true), 400)
      setTimeout(() => setVisible(false), 1300)
    }
  }, [active, progress, minReady])

  if (!visible) return null

  return (
    <div
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         9000,
        background:     '#00000a',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        fontFamily:     "'Share Tech Mono', monospace",
        color:          '#00d4ff',
        transition:     'opacity 0.9s ease',
        opacity:        fadeOut ? 0 : 1,
        pointerEvents:  fadeOut ? 'none' : 'all',
        userSelect:     'none',
      }}
    >
      {/* Scan-line overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)',
      }} />

      <div className="loading-shell">
        <div className="loading-core">
          {/* Gargantua ring SVG */}
          <svg width="130" height="130" viewBox="0 0 130 130" style={{ marginBottom: 32 }}>
            <circle cx="65" cy="65" r="28" fill="none" stroke="rgba(0,212,255,0.12)" strokeWidth="22" />
            <circle cx="65" cy="65" r="20" fill="#000008" />
            <ellipse cx="65" cy="65" rx="46" ry="10" fill="none"
              stroke="rgba(255,160,40,0.55)" strokeWidth="3.5">
              <animateTransform attributeName="transform" type="rotate"
                from="0 65 65" to="360 65 65" dur="8s" repeatCount="indefinite" />
            </ellipse>
            {/* photon ring */}
            <circle cx="65" cy="65" r="28" fill="none"
              stroke="rgba(255,220,160,0.18)" strokeWidth="1" />
            {/* pulsing glow */}
            <circle cx="65" cy="65" r="20" fill="none"
              stroke="rgba(0,212,255,0.35)" strokeWidth="1.5">
              <animate attributeName="r" values="20;23;20" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0.7;0.35" dur="2.4s" repeatCount="indefinite" />
            </circle>
          </svg>

          {/* Title */}
          <div style={{ fontSize: 11, letterSpacing: '0.35em', color: 'rgba(0,212,255,0.5)', marginBottom: 8 }}>
            PARDEEP SINGH // PORTFOLIO
          </div>
          <div style={{ fontSize: 14, letterSpacing: '0.2em', marginBottom: 36 }}>
            GARGANTUA NAVIGATION SYSTEM
          </div>

          {/* Progress bar */}
          <div style={{ width: 260, marginBottom: 14 }}>
            <div style={{
              height: 2, width: '100%', background: 'rgba(0,212,255,0.12)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width:  `${pct}%`,
                background: 'linear-gradient(90deg,#9b30ff,#00d4ff)',
                transition: 'width 0.3s ease',
                boxShadow:  '0 0 8px #00d4ff',
              }} />
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginTop: 6, fontSize: 10, letterSpacing: '0.12em',
              color: 'rgba(0,212,255,0.45)',
            }}>
              <span>{STAGES[stage]}</span>
              <span>{pct}%</span>
            </div>
          </div>
        </div>

        <div className="loading-model-panel">
          <div className="loading-model-orbit" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p className="loading-model-kicker">LOCAL GLB PAYLOAD</p>
          <h2>HAIL MARY / ENDURANCE / BLACK HOLE</h2>
          <ul>
            <li>black_hole.glb</li>
            <li>interstellar__endurance.glb</li>
            <li>project_hail_mary_ship.glb</li>
          </ul>
        </div>
      </div>

      {/* Corner decorations */}
      {['tl','tr','bl','br'].map(pos => (
        <div key={pos} style={{
          position:   'absolute',
          width:      16, height: 16,
          borderColor: 'rgba(0,212,255,0.3)',
          borderStyle: 'solid',
          borderWidth: pos.includes('t') ? '1px 0 0 1px' : '0 1px 1px 0',
          ...(pos.includes('t') ? { top: 20 } : { bottom: 20 }),
          ...(pos.includes('l') ? { left: 20 } : { right: 20 }),
        }} />
      ))}
    </div>
  )
}
