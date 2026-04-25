'use client'
import { useEffect, useRef } from 'react'

const metrics = [
  { num: '5',   label: 'IEEE Papers' },
  { num: '2',   label: 'Systems Shipped' },
  { num: '9+',  label: 'Hackathons' },
  { num: '0ms', label: 'Latency Tolerance' },
]

export default function Manifesto() {
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          ref.current?.querySelectorAll('.mf-line').forEach((el, i) => {
            setTimeout(() => el.classList.add('mf-line--in'), i * 120)
          })
          ref.current?.querySelectorAll('.mm-item').forEach((el, i) => {
            setTimeout(() => el.classList.add('mm-item--in'), 600 + i * 80)
          })
        }
      },
      { threshold: 0.12 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="manifesto-section" id="manifesto" ref={ref}>
      <div className="manifesto-grid" aria-hidden="true" />

      <div className="inner manifesto-inner">
        <p className="manifesto-eyebrow">// ENGINEERING PHILOSOPHY</p>

        <div className="manifesto-text">
          <div className="mf-line">
            <span className="mf-dim">MOST ENGINEERS BUILD</span>
          </div>
          <div className="mf-line">
            <span className="mf-big">FOR THE DEMO.</span>
          </div>
          <div className="mf-line mf-gap">
            <span className="mf-small mf-dim">I build for the day after launch —</span>
          </div>
          <div className="mf-line">
            <span className="mf-accent">FOR THE REAL WORLD.</span>
          </div>
        </div>

        <div className="manifesto-metrics">
          {metrics.map(({ num, label }) => (
            <div className="mm-item" key={label}>
              <span className="mm-num">{num}</span>
              <span className="mm-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
