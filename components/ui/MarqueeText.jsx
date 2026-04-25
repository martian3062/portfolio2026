'use client'

export default function MarqueeText({ items, reverse = false, speed = 40 }) {
  return (
    <div className="marquee-outer" aria-hidden="true">
      <div
        className={`marquee-track${reverse ? ' marquee-rev' : ''}`}
        style={{ '--mq-speed': `${speed}s` }}
      >
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="marquee-item">
            {item}<span className="marquee-sep">◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}
