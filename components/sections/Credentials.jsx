const credentials = [
  {
    title: 'EXPERIENCE',
    items: [
      {
        title: '4BaseCare Precision Health',
        note: 'Data Science Intern · Feb 2026 – Present. Cancer model training with DINO / SSL / CV pipelines; clinical dashboard with vector DBs, Guardrails, A2A/MCP, GCP.',
      },
      {
        title: 'Chandigarh University',
        note: 'B.E. Computer Science & Engineering · Sep 2022 – Jun 2026 · CGPA 7.7/10. Focus: Full-Stack, Agentic ML, Automation.',
      },
      {
        title: 'IGNOU',
        note: 'B.Sc. General (Distance) · Jul 2022 – Jun 2026 · CGPA 6.3/10. Biology, Microbiology, Bioinformatics; Genomic Data Science + Cancer Biology (Johns Hopkins, Coursera).',
      },
    ],
  },
  {
    title: 'RESEARCH // IEEE',
    items: [
      {
        title: 'IEEE ICWITE 2025',
        note: 'Machine Learning Approaches in DNA Analysis.',
      },
      {
        title: 'IEEE ICPC2T 2026',
        note: 'Adaptive Local LLM Compression under Dynamic Edge Constraints.',
      },
      {
        title: 'IEEE PuneCon 2025',
        note: 'Large Language Models in Multilingual and Low-Resource Language Contexts.',
      },
      {
        title: 'IEEE DELCON 2025 · Track A',
        note: 'Wavelet-Based Terrain Generation: Optimizing Ray Tracing Performance in AAA Games.',
      },
      {
        title: 'IEEE DELCON 2025 · Track B',
        note: 'Epigenetic Modifications in MC1R, SLC24A5, and FOXL2 Genes for Phenotypic Trait Engineering.',
      },
    ],
  },
  {
    title: 'STACK & EVENTS',
    items: [
      {
        title: 'Languages & Frameworks',
        note: 'Python · JavaScript · Go · Kotlin · C++ · Django · FastAPI · Flask · MERN · Streamlit · Astro',
      },
      {
        title: 'ML & Agents',
        note: 'PyTorch · LangGraph · Pinecone · n8n · Ollama · DINO · XGBoost · OpenCV · ARIMA · LazySlide · Polars',
      },
      {
        title: 'Web3 & Cloud',
        note: 'Solidity · Web3.py · IPFS · MetaMask · QuickNode · Docker · AWS · GCP · Kafka · Supabase',
      },
      {
        title: 'Hackathons',
        note: 'Monad Blitz New Delhi · AI Builders Bootcamp · IDEA-ONE One-Health (Finalist) · Innovate-a-thon 3.0 · Byteverse 1.0 · SAP Hackfest · TrackShift · SquareHacks 2025 · IIIT Delhi E-Summit 2025',
      },
    ],
  },
]

export default function Credentials() {
  return (
    <section className="section section-glass-warm" id="credentials">
      <div className="inner">
        <div className="section-head">
          <p className="section-eyebrow">DATA ARCHIVE // CREDENTIALS</p>
          <h2 className="section-title">
            5 IEEE papers,{' '}
            <span className="accent-warm">live internship,</span>
            {' '}stack built for shipping.
          </h2>
        </div>

        <div className="cred-grid">
          {credentials.map((group) => (
            <div className="cred-card" key={group.title}>
              <h3 className="cred-title">{group.title}</h3>
              <ul className="cred-list">
                {group.items.map((item) => (
                  <li key={item.title}>
                    <span className="cred-item-title">{item.title}</span>
                    <span className="cred-item-note">{item.note}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
