const credentials = [
  {
    title: 'EXPERIENCE',
    items: [
      {
        title: 'VECTRA International BV',
        note: 'Zoho Systems Intern · Jun 2026 – Present · Remote (Brussels, Belgium). Custom Zoho modules, Deluge scripts, and cross-app integrations automating internal operations, reporting, and process workflows.',
      },
      {
        title: '4BaseCare Precision Health',
        note: 'Data Science Intern · Feb 2026 – Present · Remote (Bengaluru). Automated ML pipelines for cancer analysis (MSI, HER2/ER/PR on H&E WSIs); vector-DB clinical AI with Guardrails, A2A/MCP, GCP; EHR/document OCR.',
      },
      {
        title: 'Chandigarh University',
        note: 'B.E. Computer Science & Engineering · Sep 2022 – Jun 2026 · CGPA 7.7/10. Final-year patent (filed) — Evolet: Patient First, a patient-sovereign digital twin. Certs: Microsoft AI Agents, NVIDIA DL for CV.',
      },
      {
        title: 'IGNOU',
        note: 'B.Sc. General (Distance) · Jul 2022 – Jun 2026 · CGPA 6.3/10. Botany, Microbiology, Bioinformatics; Genomic Data Science + Cancer Biology Specialization.',
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
        note: 'Python · SQL · JavaScript · Kotlin · Go · C++ · Django · FastAPI · Flask · React · Next.js · Node.js · GraphQL',
      },
      {
        title: 'ML & Clinical AI',
        note: 'PyTorch · XGBoost · OpenCV · timm · PySpark · Polars · Slideflow · H-Optimus · DINOv2 · Macenko · SNOMED-CT',
      },
      {
        title: 'Agents · Web3 · Cloud',
        note: 'LangGraph · n8n · Ollama · Zoho · Claude Code · Codex · Solidity · Web3.py · IPFS · QuickNode · Dune · Truffle · Docker · Kubernetes · AWS · GCP',
      },
      {
        title: 'Hackathons & Bootcamps',
        note: 'AMTZ MedTech 2026 · Monad Blitz New Delhi · IDEA-ONE One-Health (Finalist) · TrackShift · Byteverse 1.0 · Innovate-a-thon 3.0 · SAP Hackfest · IIIT Delhi E-Summit 2025 · AI Builders Bootcamp · IIT Guwahati Summer Analytica',
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
            <span className="accent-warm">two live internships,</span>
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
