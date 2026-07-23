'use client'
import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const projects = [
  {
    num: '001',
    kicker: 'Agentic AI · Self-Healing Swarm',
    name: 'eraya',
    date: 'Jun 2026',
    badge: '🛰 Self-Healing Multi-Agent Framework',
    summary:
      'Self-healing multi-agent swarm where agents autonomously detect failures and self-recover without central control — fault-tolerant orchestration, task re-allocation, and resilient messaging.',
    impact: 'Live dashboard for real-time swarm health, resource telemetry, and automatic recovery',
    links: [
      { label: 'LIVE', href: 'http://35.255.196.78/eraya' },
      { label: 'GITHUB', href: 'https://github.com/martian3062/eraya' },
    ],
    stack: ['Multi-Agent', 'LangGraph', 'Python', 'FastAPI', 'Orchestration', 'Telemetry'],
    color: '#00d4ff',
  },
  {
    num: '002',
    kicker: 'Web3 · ML DeFi Agent',
    name: 'Nemesis',
    date: 'Mar 2026',
    badge: '📄 IEEE DELCON 2025 Implementation',
    summary:
      'LLM-powered Web3 system converting natural language into on-chain transactions via AI agents. Multi-layer architecture with payment gating, validation, and privacy-preserving execution on Monad Testnet.',
    impact: 'Implements "The Architecture of AI Agents in Web3" — agents executing real DeFi transactions',
    links: [
      { label: 'LIVE', href: 'https://seb-cheneb.netlify.app' },
      { label: 'GITHUB', href: 'https://github.com/martian3062/Seb-Cheneb-Monad' },
    ],
    stack: ['LangGraph', 'Solidity', 'Web3.py', 'Monad', 'FastAPI', 'Ollama'],
    color: '#9b30ff',
  },
  {
    num: '003',
    kicker: 'Healthcare · One Health Platform',
    name: 'MedGenie 3.0',
    date: 'Nov 2025',
    badge: '🏆 IDEA-ONE Finalist · Govt of India',
    summary:
      'Full-stack One Health platform with React, Tailwind, Django REST, and JWT auth — AI-assisted report interaction, dashboards, and real-time telemedicine over WebRTC.',
    impact: 'National One-Health hackathon finalist — clinical ops + AI at scale',
    links: [
      { label: 'LIVE', href: 'https://medico-cyborg-db.vercel.app' },
      { label: 'GITHUB', href: 'https://github.com/martian3062/medicoCyborgDB' },
    ],
    stack: ['React', 'Django REST', 'WebRTC', 'JWT', 'Tailwind', 'AI Chat'],
    color: '#00ff88',
  },
  {
    num: '004',
    kicker: 'Clinical AI · Data Science Internship',
    name: '4BaseCare Clinical AI',
    date: 'Feb 2026 – Present',
    badge: '💼 4BaseCare Precision Health',
    summary:
      'Automated ML pipelines for cancer analysis — MSI on colorectal & endometrial and HER2/ER/PR on breast-cancer H&E whole-slide images, plus EHR/clinical-document OCR with structured field extraction.',
    impact: 'Vector-DB clinical AI for extraction, summarization & suggestions — Guardrails, A2A/MCP, GCP',
    links: [],
    stack: ['PyTorch', 'Slideflow', 'DINOv2', 'H-Optimus', 'OpenCV', 'GCP', 'Vector DB'],
    color: '#ffb800',
  },
]

export default function Projects() {
  const wrapperRef = useRef(null)
  const trackRef   = useRef(null)
  const [dragLeft, setDragLeft] = useState(-800)
  const [tilts, setTilts] = useState({})
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const calc = () => {
      if (!trackRef.current || !wrapperRef.current) return
      const tw = trackRef.current.scrollWidth
      const ww = wrapperRef.current.offsetWidth
      setDragLeft(Math.min(0, -(tw - ww + 40)))
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  const onMouseMove = (e, idx) => {
    if (dragging) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 2
    const y = ((e.clientY - r.top)  / r.height - 0.5) * 2
    setTilts(t => ({ ...t, [idx]: { x, y } }))
  }
  const onMouseLeave = (idx) => setTilts(t => ({ ...t, [idx]: null }))

  return (
    <section className="section projects-section" id="work">
      <div className="inner">
        <div className="section-head projects-head">
          <p className="section-eyebrow">MISSION LOG // SELECTED WORK</p>
          <h2 className="section-title">
            Products shipped,{' '}
            <span className="accent">papers published,</span>
            {' '}research deployed.
          </h2>
          <p className="drag-hint">← DRAG TO EXPLORE →</p>
        </div>
      </div>

      <div className="projects-gallery-wrap" ref={wrapperRef}>
        <motion.div
          ref={trackRef}
          className="projects-gallery-track"
          drag="x"
          dragConstraints={{ right: 0, left: dragLeft }}
          dragElastic={0.05}
          dragMomentum
          style={{ cursor: 'grab' }}
          whileDrag={{ cursor: 'grabbing' }}
          onDragStart={() => setDragging(true)}
          onDragEnd={() => setTimeout(() => setDragging(false), 120)}
        >
          {projects.map((p, idx) => {
            const tilt = tilts[idx]
            const ry = tilt ? tilt.x * 9  : 0
            const rx = tilt ? -tilt.y * 9 : 0
            return (
              <motion.article
                key={p.num}
                className="project-slide"
                style={{
                  '--card-color': p.color,
                  transform: `perspective(1100px) rotateY(${ry}deg) rotateX(${rx}deg)`,
                  transition: dragging ? 'none' : 'transform 0.18s ease-out',
                }}
                onMouseMove={e => onMouseMove(e, idx)}
                onMouseLeave={() => onMouseLeave(idx)}
              >
                <div className="slide-accent-bar" />
                <div className="slide-inner">
                  <div className="slide-header">
                    <span className="slide-num">{p.num}</span>
                    <span className="slide-date">{p.date}</span>
                  </div>
                  <p className="slide-kicker">{p.kicker}</p>
                  <h3 className="slide-name">{p.name}</h3>
                  {p.badge && <p className="slide-badge">{p.badge}</p>}
                  <p className="slide-summary">{p.summary}</p>
                  <p className="slide-impact">
                    <span className="impact-arr">→</span>{p.impact}
                  </p>
                  {p.links.length > 0 && (
                    <div className="slide-links">
                      {p.links.map(l => (
                        <a
                          key={l.label}
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="slide-link"
                          onClick={e => e.stopPropagation()}
                        >
                          {l.label} ↗
                        </a>
                      ))}
                    </div>
                  )}
                  <ul className="slide-tags" aria-label={`${p.name} stack`}>
                    {p.stack.map(tag => <li key={tag}>{tag}</li>)}
                  </ul>
                </div>
                <div
                  className="slide-glow"
                  style={{ background: `radial-gradient(ellipse at 25% 35%, ${p.color}1a, transparent 65%)` }}
                />
              </motion.article>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
