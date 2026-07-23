'use client'
import { useRef, useState, useEffect } from 'react'

const GAMES = [
  {
    id: 'kite',
    title: 'KITE FLIGHT',
    sub: 'RURAL INDIA // AR HANDS',
    desc: 'Fly a traditional patang over wheat fields. Tilt your device or drag to guide — catch thermals, fight the wind.',
    tag: 'MOTION CONTROL',
    color: '#ffb800',
    icon: '🪁',
    env: 'RURAL / COUNTRYSIDE',
    ctrl: 'MOUSE · TILT · HAND-AR',
  },
  {
    id: 'torii',
    title: 'TORII RUN',
    sub: 'KYOTO FOREST // VR',
    desc: 'Sprint through an infinite tunnel of glowing torii gates. Dodge fox spirits, collect lanterns.',
    tag: 'ENDLESS RUNNER',
    color: '#ff4400',
    icon: '⛩',
    env: 'JAPANESE FOREST',
    ctrl: 'KEYBOARD · VR CONTROLLER',
  },
  {
    id: 'astro',
    title: 'ASTROPHAGE HUNT',
    sub: 'DEEP SPACE // SPACE',
    desc: 'Navigate the Tau Ceti system, harvest astrophage from stellar streams to power your Hail Mary drive.',
    tag: 'ALREADY UNLOCKED',
    color: '#00d4ff',
    icon: '🚀',
    env: 'DEEP SPACE',
    ctrl: 'WASD + MOUSE',
    available: true,
  },
  {
    id: 'tabla',
    title: 'TABLA BEATS',
    sub: 'PUNJAB VILLAGE // AR',
    desc: 'Tap the rhythms of a classic tabla sequence. AR hand overlay maps your real fingers to the drum skin.',
    tag: 'AR MUSIC',
    color: '#9b30ff',
    icon: '🥁',
    env: 'PUNJABI COURTYARD',
    ctrl: 'AR HAND TRACKING',
  },
  {
    id: 'origami',
    title: 'PAPER COSMOS',
    sub: 'ORIGAMI SPACE // AR',
    desc: 'Fold paper cranes in AR, release them — they orbit the room as constellations.',
    tag: 'AR CREATION',
    color: '#00ff88',
    icon: '🕊',
    env: 'YOUR ROOM',
    ctrl: 'AR HAND TRACKING',
  },
  {
    id: 'chess',
    title: 'INTERSTELLAR CHESS',
    sub: 'TESSERACT BOARD // VR',
    desc: '3-D chess across 4 parallel boards. Physics-based pieces, wormhole shortcuts, zero-gravity mode.',
    tag: 'VR STRATEGY',
    color: '#ccd8ee',
    icon: '♟',
    env: 'TESSERACT',
    ctrl: 'VR CONTROLLER · MOUSE',
  },
]

function GameCard({ game, onPlay }) {
  const ref = useRef()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      el.style.setProperty('--rx', `${y * -12}deg`)
      el.style.setProperty('--ry', `${x * 12}deg`)
      el.style.setProperty('--gx', `${(x + 0.5) * 100}%`)
      el.style.setProperty('--gy', `${(y + 0.5) * 100}%`)
    }
    const onLeave = () => {
      el.style.setProperty('--rx', '0deg')
      el.style.setProperty('--ry', '0deg')
    }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave) }
  }, [])

  return (
    <div
      ref={ref}
      className="game-card"
      style={{ '--card-col': game.color }}
      onClick={() => onPlay(game.id)}
    >
      <div className="gc-shine" />
      <div className="gc-top">
        <span className="gc-icon">{game.icon}</span>
        <span className="gc-tag" style={{ color: game.color, borderColor: game.color + '55' }}>{game.tag}</span>
      </div>
      <div className="gc-env">{game.env}</div>
      <div className="gc-title">{game.title}</div>
      <div className="gc-sub">{game.sub}</div>
      <div className="gc-desc">{game.desc}</div>
      <div className="gc-footer">
        <span className="gc-ctrl">{game.ctrl}</span>
        <button className="gc-play-btn">
          {game.available ? 'LAUNCH ⟶' : 'COMING SOON'}
        </button>
      </div>
    </div>
  )
}

export default function Play({ onGameMode, onKite }) {
  const [arSupport, setArSupport] = useState(null)
  const [vrSupport, setVrSupport] = useState(null)

  useEffect(() => {
    if ('xr' in navigator) {
      navigator.xr?.isSessionSupported('immersive-ar').then(s => setArSupport(s))
      navigator.xr?.isSessionSupported('immersive-vr').then(s => setVrSupport(s))
    } else {
      setArSupport(false)
      setVrSupport(false)
    }
  }, [])

  const handlePlay = (id) => {
    if (id === 'astro') { onGameMode?.(); return }
    if (id === 'kite')  { onKite?.();    return }
  }

  return (
    <section className="section play-section" id="play">
      <div className="inner">

        <div className="section-head">
          <div className="section-eyebrow">SIGNAL LOST?</div>
          <h2 className="section-title">
            BORED? <span className="accent">WANNA PLAY.</span>
          </h2>
          <p className="play-sub">
            Six interactive worlds — AR hand-tracking, VR, and browser games. No headset required for most.
          </p>
        </div>

        {/* XR status strip */}
        <div className="xr-status-strip">
          <div className={`xr-badge ${arSupport === true ? 'xr-on' : arSupport === false ? 'xr-off' : 'xr-check'}`}>
            <span className="xr-dot" />
            AR {arSupport === true ? 'READY' : arSupport === false ? 'UNAVAILABLE' : 'CHECKING...'}
          </div>
          <div className={`xr-badge ${vrSupport === true ? 'xr-on' : vrSupport === false ? 'xr-off' : 'xr-check'}`}>
            <span className="xr-dot" />
            VR {vrSupport === true ? 'READY' : vrSupport === false ? 'UNAVAILABLE' : 'CHECKING...'}
          </div>
          <div className="xr-badge xr-on">
            <span className="xr-dot" />
            HAND TRACKING — MOUSE FALLBACK
          </div>
          <div className="xr-badge xr-on">
            <span className="xr-dot" />
            DEVICE TILT — GYROSCOPE
          </div>
        </div>

        {/* Game grid */}
        <div className="game-grid">
          {GAMES.map(g => (
            <GameCard key={g.id} game={g} onPlay={handlePlay} />
          ))}
        </div>

        {/* Kite callout — flagship experience */}
        <div className="kite-callout">
          <div className="kite-callout-content">
            <span className="kite-callout-icon">🪁</span>
            <div>
              <div className="kite-callout-title">FLAGSHIP: KITE FLIGHT</div>
              <div className="kite-callout-desc">
                Golden wheat fields. A Punjabi summer. You hold the string — the wind does the rest.
                Full AR hand-tracking maps your hand motion directly to kite control.
                Mouse drag works everywhere, no hardware needed.
              </div>
            </div>
          </div>
          <button className="kite-launch-btn" onClick={() => onKite?.()}>
            FLY NOW ⟶
          </button>
        </div>

      </div>
    </section>
  )
}
