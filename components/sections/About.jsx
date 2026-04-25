const capabilities = [
  {
    num: '01',
    title: 'Full-Stack Product Engineering',
    body: 'End-to-end systems with React, Django REST, FastAPI, and MERN — from schema design to deployed product. Currently at 4BaseCare building clinical AI dashboards with GCP and vector databases.',
  },
  {
    num: '02',
    title: 'ML Automation & Agentic AI',
    body: 'LangGraph agents, LLM pipelines, DINO-based self-supervised models, PyTorch CV pipelines. Research across DNA analysis, edge LLM compression, and multilingual NLP — 5 IEEE papers.',
  },
  {
    num: '03',
    title: 'Web3 & Real-Time Systems',
    body: 'Solidity contracts, LLM-to-on-chain transaction agents on Monad Testnet. WebRTC telemedicine, WebSocket dashboards, Kafka streams — systems built for zero-latency tolerance.',
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
            Present) — training cancer biomarker models with DINO-based self-supervised learning,
            building clinical dashboards with vector databases, and integrating A2A/MCP protocols on GCP.
          </p>
          <p className="about-lead">
            The work spans healthcare AI, Web3 automation, and systems research — 5 IEEE papers
            published, 2 products shipped live, and 9+ hackathons entered. The throughline is
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
