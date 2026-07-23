'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import Nav from '../components/ui/Nav'
import SmoothScroll from '../components/ui/SmoothScroll'
import Hero from '../components/sections/Hero'
import About from '../components/sections/About'
import Manifesto from '../components/sections/Manifesto'
import Projects from '../components/sections/Projects'
import Credentials from '../components/sections/Credentials'
import Contact from '../components/sections/Contact'
import Play from '../components/sections/Play'
import ExperienceLoader from '../components/canvas/ExperienceLoader'
import GameLoader from '../components/game/GameLoader'

const DigitalTwin = dynamic(() => import('../components/ui/DigitalTwin'), { ssr: false })
const KiteGame    = dynamic(() => import('../components/game/KiteGame'),  { ssr: false })
const CameraHUD   = dynamic(() => import('../components/ui/CameraHUD'),   { ssr: false })

export default function HomePage() {
  const [mode, setMode] = useState('portfolio')

  if (mode === 'game') {
    return (
      <div className="game-enter">
        <GameLoader onExit={() => setMode('portfolio')} />
      </div>
    )
  }

  if (mode === 'kite') {
    return (
      <div className="game-enter">
        <KiteGame onExit={() => setMode('portfolio')} />
      </div>
    )
  }

  return (
    <SmoothScroll>
      <ExperienceLoader />
      <Nav onGameMode={() => setMode('game')} />
      <div className="scroll-content">
        <main>
          <Hero />
          <About />
          <Manifesto />
          <Projects />
          <Credentials />
          <Play onGameMode={() => setMode('game')} onKite={() => setMode('kite')} />
          <Contact />
        </main>
        <footer className="site-footer">
          <div className="inner footer-inner">
            <span className="footer-brand">PARDEEP SINGH // PS</span>
            <span className="footer-copy">
              COORDINATES N30°44 E76°47 · SIGNAL ACTIVE · 2026
            </span>
          </div>
        </footer>
      </div>
      {/* Floating digital twin widget */}
      <DigitalTwin />
      {/* Camera HUD + hand tracker */}
      <CameraHUD />
    </SmoothScroll>
  )
}
