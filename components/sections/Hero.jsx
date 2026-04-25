'use client'
import { useEffect, useRef, useState } from 'react'
import GlitchText from '../ui/GlitchText'
import MarqueeText from '../ui/MarqueeText'

const highlights = [
  { target: 5,            suffix: '',  noCount: false, label: 'IEEE Papers Published' },
  { target: 2,            suffix: '',  noCount: false, label: 'Products Shipped' },
  { target: 9,            suffix: '+', noCount: false, label: 'Hackathons Entered' },
  { target: 'Full-Stack', suffix: '',  noCount: true,  label: 'ML · Web3 · Real-time' },
]

const techStack = [
  'React', 'Next.js', 'Django REST', 'WebRTC', 'LangGraph',
  'PyTorch', 'Solidity', 'n8n', 'Pinecone', 'FastAPI',
  'Docker', 'GCP', 'DINO', 'Ollama', 'Web3.py',
  'Kafka', 'Supabase', 'Framer Motion', 'Three.js',
]

function Counter({ target, suffix, noCount }) {
  const [val, setVal] = useState(noCount ? target : 0)
  const elRef   = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    if (noCount) { setVal(target); return }
    const ob = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const duration = 1400
        const t0 = Date.now()
        const tick = () => {
          const p = Math.min((Date.now() - t0) / duration, 1)
          const eased = 1 - (1 - p) ** 3
          setVal(Math.round(eased * target))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    if (elRef.current) ob.observe(elRef.current)
    return () => ob.disconnect()
  }, [target, noCount])

  return <span className="stat-val" ref={elRef}>{val}{suffix}</span>
}

export default function Hero() {
  return (
    <section className="hero" id="top">

      <div className="hero-vid-badge" aria-hidden="true">
        <div className="hero-vid-hud-corner tl" />
        <div className="hero-vid-hud-corner tr" />
        <div className="hero-vid-hud-corner bl" />
        <div className="hero-vid-hud-corner br" />
        <video src="/vidpardeep.mp4" autoPlay muted loop playsInline preload="metadata" />
        <div className="hero-vid-overlay" />
        <div className="hero-vid-label">
          <span className="hero-vid-pulse" />
          LIVE // PARDEEP.SINGH
        </div>
      </div>

      <div className="inner hero-content">
        <p className="hero-eyebrow">FULL-STACK · ML AUTOMATION · WEB3 · REAL-TIME</p>

        <h1 className="hero-name">
          <GlitchText>PARDEEP</GlitchText>
          <br />
          <GlitchText>SINGH</GlitchText>
        </h1>

        <p className="hero-title">FULL-STACK DEVELOPER · ML AUTOMATION</p>

        <p className="hero-desc">
          Data Science Intern at 4BaseCare — training cancer models with DINO &amp; CV pipelines.
          Building end-to-end products where healthcare, AI agents, and Web3 converge.
          5 IEEE publications. 9+ hackathons. Ships past the prototype phase.
        </p>

        <div className="hero-actions">
          <a className="btn btn-primary" href="#work">VIEW MISSIONS</a>
          <a className="btn btn-secondary" href="#credentials">ACCESS RECORDS</a>
        </div>

        <ul className="hero-stats" aria-label="Highlights">
          {highlights.map(item => (
            <li className="hero-stat" key={item.label}>
              <Counter target={item.target} suffix={item.suffix} noCount={item.noCount} />
              <span className="stat-lbl">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="hero-marquee-band">
        <MarqueeText items={techStack} speed={35} />
      </div>

      <div className="scroll-indicator" aria-hidden="true">
        <span />
        SCROLL
      </div>
    </section>
  )
}
