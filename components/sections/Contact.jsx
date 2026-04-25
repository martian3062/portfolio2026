const availability = [
  'Full-time / internship roles in full-stack engineering, ML systems, or agentic AI products.',
  'Research-aligned builds where shipping and publishing both matter.',
  'Web3, healthcare AI, or real-time systems that go past the prototype phase.',
]

export default function Contact() {
  return (
    <section className="section section-glass contact-section" id="contact">
      <div className="inner contact-wrapper">
        <div className="section-head" style={{ textAlign: 'center' }}>
          <p className="section-eyebrow" style={{ justifyContent: 'center' }}>
            OPEN CHANNEL // AVAILABILITY
          </p>
          <h2 className="section-title" style={{ maxWidth: 'none', margin: '0 auto' }}>
            Open to internships,{' '}
            <span className="accent">collaboration,</span>
            {' '}and research-heavy builds.
          </h2>
        </div>

        <div className="transmission-frame">
          <div className="contact-links">
            <a
              className="contact-link"
              href="mailto:sandhupardeep300@gmail.com"
            >
              <span className="contact-link-label">EMAIL</span>
              <span>sandhupardeep300@gmail.com</span>
            </a>
            <a
              className="contact-link"
              href="https://linkedin.com/in/pardeep-singh"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="contact-link-label">LINKEDIN</span>
              <span>linkedin.com/in/pardeep-singh</span>
            </a>
            <a
              className="contact-link"
              href="https://github.com/martian3062"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="contact-link-label">GITHUB</span>
              <span>github.com/martian3062</span>
            </a>
          </div>

          <ul className="availability-list">
            {availability.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
