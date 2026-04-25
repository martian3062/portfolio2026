'use client'

const DPAD = [
  { label: '▲', code: 'KeyW',         area: 'up'    },
  { label: '◄', code: 'KeyA',         area: 'left'  },
  { label: '▼', code: 'KeyS',         area: 'down'  },
  { label: '►', code: 'KeyD',         area: 'right' },
]

export default function GameHUD({ locked, nearPlanet, nearDist, onExit, onLock, externalKeys, planets }) {
  const setKey = (code, val) => { externalKeys.current[code] = val }

  return (
    <div className="game-hud">

      {/* ── Exit ── */}
      <button className="game-exit-btn" onClick={onExit}>
        ← EXIT
      </button>

      {/* ── HUD corner brackets ── */}
      <div className="game-corners" aria-hidden="true">
        <span className="gc gc-tl" /><span className="gc gc-tr" />
        <span className="gc gc-bl" /><span className="gc gc-br" />
      </div>

      {/* ── Crosshair (only when pointer locked) ── */}
      {locked && <div className="game-crosshair" aria-hidden="true" />}

      {/* ── Click-to-pilot prompt ── */}
      {!locked && (
        <div className="game-lock-prompt" onClick={onLock} role="button" tabIndex={0}>
          <div className="game-lock-ring" />
          <p className="game-lock-title">CLICK TO PILOT</p>
          <p className="game-lock-sub">WASD · MOUSE LOOK · SHIFT BOOST</p>
          <p className="game-lock-sub" style={{ marginTop: 6, opacity: 0.45 }}>
            SPACE ↑ &nbsp;·&nbsp; CTRL ↓ &nbsp;·&nbsp; ESC PAUSE
          </p>
        </div>
      )}

      {/* ── Controls hint (when locked) ── */}
      {locked && (
        <div className="game-hint">
          <span>W/S/A/D</span> MOVE &nbsp;·&nbsp;
          <span>SPACE</span> UP &nbsp;·&nbsp;
          <span>CTRL</span> DOWN &nbsp;·&nbsp;
          <span>SHIFT</span> BOOST &nbsp;·&nbsp;
          <span>ESC</span> PAUSE
        </div>
      )}

      {/* ── Proximity panel ── */}
      {nearPlanet && (
        <div className="game-planet-panel" key={nearPlanet.id}>
          <p className="game-panel-sub">{nearPlanet.subtitle}</p>
          <p className="game-panel-name" style={{ color: nearPlanet.color }}>
            {nearPlanet.name}
          </p>
          <ul className="game-panel-list">
            {nearPlanet.items.map(item => (
              <li key={item.t}>
                <span className="gpl-title">{item.t}</span>
                <span className="gpl-note">{item.n}</span>
              </li>
            ))}
          </ul>
          <p className="game-panel-dist">
            ◈ DISTANCE:&nbsp;
            <strong>{Math.max(0, Math.round(nearDist - nearPlanet.radius))} UNITS</strong>
          </p>
        </div>
      )}

      {/* ── Planet nav dots (right-side mini-map) ── */}
      <div className="game-planet-nav" aria-hidden="true">
        {planets.map(p => (
          <div key={p.id} className="game-nav-dot">
            <span style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }} />
            <small>{p.name}</small>
          </div>
        ))}
      </div>

      {/* ── Mobile touch D-pad ── */}
      <div className="game-touch-controls">
        <div className="game-dpad">
          {DPAD.map(b => (
            <button
              key={b.code}
              className={`game-touch-btn dpad-${b.area}`}
              onTouchStart={e => { e.preventDefault(); setKey(b.code, true) }}
              onTouchEnd={e   => { e.preventDefault(); setKey(b.code, false) }}
              onMouseDown={() => setKey(b.code, true)}
              onMouseUp={()   => setKey(b.code, false)}
              onMouseLeave={()=> setKey(b.code, false)}
            >
              {b.label}
            </button>
          ))}
        </div>
        <div className="game-alt-btns">
          {[['Space', '▲ UP'], ['ControlLeft', '▼ DN']].map(([code, label]) => (
            <button
              key={code}
              className="game-touch-btn"
              onTouchStart={e => { e.preventDefault(); setKey(code, true) }}
              onTouchEnd={e   => { e.preventDefault(); setKey(code, false) }}
              onMouseDown={() => setKey(code, true)}
              onMouseUp={()   => setKey(code, false)}
              onMouseLeave={()=> setKey(code, false)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
