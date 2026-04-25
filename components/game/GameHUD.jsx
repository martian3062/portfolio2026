'use client'

const DPAD = [
  { label: 'UP', code: 'KeyW', area: 'up' },
  { label: 'LT', code: 'KeyA', area: 'left' },
  { label: 'DN', code: 'KeyS', area: 'down' },
  { label: 'RT', code: 'KeyD', area: 'right' },
]

export default function GameHUD({ locked, nearPlanet, nearDist, onExit, onLock, externalKeys, planets }) {
  const setKey = (code, val) => { externalKeys.current[code] = val }

  return (
    <div className="game-hud">
      <button className="game-exit-btn" onClick={onExit}>
        EXIT CITY
      </button>

      <div className="game-corners" aria-hidden="true">
        <span className="gc gc-tl" /><span className="gc gc-tr" />
        <span className="gc gc-bl" /><span className="gc gc-br" />
      </div>

      {locked && <div className="game-crosshair" aria-hidden="true" />}

      {!locked && (
        <div className="game-lock-prompt" onClick={onLock} role="button" tabIndex={0}>
          <div className="game-lock-ring" />
          <p className="game-lock-title">ENTER PORTFOLIO CITY</p>
          <p className="game-lock-sub">GTA-STYLE WALK MODE · SPACE NEON DISTRICTS</p>
          <p className="game-lock-sub" style={{ marginTop: 6, opacity: 0.55 }}>
            WASD MOVE · MOUSE TURN · SHIFT SPRINT · ESC PAUSE
          </p>
        </div>
      )}

      {locked && (
        <div className="game-hint">
          <span>W/S/A/D</span> MOVE &nbsp;·&nbsp;
          <span>MOUSE</span> TURN &nbsp;·&nbsp;
          <span>SHIFT</span> SPRINT &nbsp;·&nbsp;
          <span>ESC</span> PAUSE
        </div>
      )}

      {nearPlanet && (
        <div className="game-planet-panel" key={nearPlanet.id}>
          <p className="game-panel-sub">{nearPlanet.subtitle}</p>
          <p className="game-panel-name" style={{ color: nearPlanet.accent || nearPlanet.color }}>
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
            DISTRICT RANGE:&nbsp;
            <strong>{Math.max(0, Math.round(nearDist))} M</strong>
          </p>
        </div>
      )}

      <div className="game-planet-nav" aria-hidden="true">
        {planets.map(p => (
          <div key={p.id} className="game-nav-dot">
            <span style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }} />
            <small>{p.name}</small>
          </div>
        ))}
      </div>

      <div className="game-touch-controls">
        <div className="game-dpad">
          {DPAD.map(b => (
            <button
              key={b.code}
              className={`game-touch-btn dpad-${b.area}`}
              onTouchStart={e => { e.preventDefault(); setKey(b.code, true) }}
              onTouchEnd={e => { e.preventDefault(); setKey(b.code, false) }}
              onMouseDown={() => setKey(b.code, true)}
              onMouseUp={() => setKey(b.code, false)}
              onMouseLeave={() => setKey(b.code, false)}
            >
              {b.label}
            </button>
          ))}
        </div>
        <div className="game-alt-btns">
          <button
            className="game-touch-btn"
            onTouchStart={e => { e.preventDefault(); setKey('ShiftLeft', true) }}
            onTouchEnd={e => { e.preventDefault(); setKey('ShiftLeft', false) }}
            onMouseDown={() => setKey('ShiftLeft', true)}
            onMouseUp={() => setKey('ShiftLeft', false)}
            onMouseLeave={() => setKey('ShiftLeft', false)}
          >
            RUN
          </button>
        </div>
      </div>
    </div>
  )
}
