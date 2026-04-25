import HUDFrame from '../ui/HUDFrame'

export default function Reel() {
  return (
    <section className="section reel-section" id="reel">
      <div className="inner">
        <div className="reel-layout">
          <div>
            <div className="section-head" style={{ marginBottom: 0 }}>
              <p className="section-eyebrow">SIGNAL FEED // QUICK REEL</p>
              <h2 className="section-title">
                A short{' '}
                <span className="accent">visual pass</span>
                {' '}through the same interstellar tone.
              </h2>
            </div>
            <p className="about-lead" style={{ marginTop: 20 }}>
              The visual language stays cinematic, but the page is grounded in
              the actual work — full-stack delivery, AI-backed product thinking,
              and systems built to be used rather than just shown.
            </p>
          </div>

          <HUDFrame label="PLAYBACK // REEL.MP4" className="reel-frame">
            <video
              src="/vidpardeep.mp4"
              controls
              muted
              playsInline
              preload="metadata"
              style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', display: 'block' }}
            />
          </HUDFrame>
        </div>
      </div>
    </section>
  )
}
