const capabilities = [
  {
    num: '01',
    title: 'Full-Stack Product Engineering',
    body: 'End-to-end systems with React, Next.js, Django REST, FastAPI, and Node — from schema design to deployed product. Currently building clinical AI dashboards at 4BaseCare and automating business workflows in Zoho at VECTRA International.',
  },
  {
    num: '02',
    title: 'ML Automation & Agentic AI',
    body: 'Self-healing multi-agent swarms (eraya), LangGraph agents, and LLM pipelines. Clinical computer vision with Slideflow, DINOv2, and H-Optimus on whole-slide images. Research across DNA analysis, edge-LLM compression, and multilingual NLP — 5 IEEE papers.',
  },
  {
    num: '03',
    title: 'Web3 & Real-Time Systems',
    body: 'Solidity contracts and Nemesis — an LLM-to-on-chain agent system on Monad Testnet. WebRTC telemedicine, WebSocket dashboards, and real-time swarm telemetry — systems built for zero-latency tolerance.',
  },
]

export default function About() {
  return (
    <section className="section section-glass" id="about">
      <div className="inner">
        <div className="section-head">
          <p className="section-eyebrow">SYSTEM PROFILE // ABOUT</p>
          <h2 className="section-title">
            Engineering for clarity,{' '}
            <span className="accent">speed</span>{' '}
            and operational{' '}
            <span className="accent-warm">trust.</span>
          </h2>
        </div>

        <div className="about-single">
          <p className="about-lead">
            Data Science Intern at <strong style={{ color: 'var(--plasma)' }}>4BaseCare Precision Health</strong> (Feb 2026 –
            Present) — building automated ML pipelines for cancer analysis (MSI, HER2/ER/PR on H&amp;E
            whole-slide images), vector-DB clinical AI, and A2A/MCP integrations on GCP. Concurrently a
            Zoho Systems Intern at <strong style={{ color: 'var(--plasma)' }}>VECTRA International BV</strong> (Brussels),
            automating business workflows with custom modules and Deluge.
          </p>
          <p className="about-lead">
            The work spans healthcare AI, Web3 automation, and systems research — 5 IEEE papers
            published, 3 products shipped live, and 8+ hackathons entered. The throughline is
            the same: ship things that hold up past the demo.
          </p>

          <ul className="capability-list" aria-label="Core capabilities">
            {capabilities.map((cap) => (
              <li className="capability-item" key={cap.num}>
                <span className="cap-num">{cap.num}</span>
                <div>
                  <p className="cap-title">{cap.title}</p>
                  <p className="cap-body">{cap.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
