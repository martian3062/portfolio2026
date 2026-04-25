'use client'
import { useState, useEffect } from 'react'

export default function Nav({ onGameMode }) {
  const [scrolled, setScrolled] = useState(false)
  const [time, setTime] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })

    const tick = () => {
      const now = new Date()
      setTime(now.toUTCString().slice(17, 25) + ' UTC')
    }
    tick()
    const id = setInterval(tick, 1000)

    return () => {
      window.removeEventListener('scroll', onScroll)
      clearInterval(id)
    }
  }, [])

  return (
    <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="nav-inner">
        <div className="nav-brand">
          <span className="nav-signal" />
          <span>PS</span>
          <span className="nav-coords">// N30°44 E76°47</span>
        </div>

        <nav aria-label="Primary">
          <a href="#about">SYSTEMS</a>
          <a href="#work">MISSIONS</a>
          <a href="#credentials">RECORDS</a>
          <a href="#contact">TRANSMIT</a>
        </nav>

        <button className="game-mode-btn" onClick={onGameMode}>⬡ GAME MODE</button>
        <div className="nav-time" aria-hidden="true">{time}</div>
      </div>
    </header>
  )
}
