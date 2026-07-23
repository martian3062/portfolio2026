'use client'

export default function VersionBanner() {
  return (
    <a
      href="https://portfoliov32026.vercel.app/"
      target="_blank"
      rel="noopener noreferrer"
      className="version-banner"
      aria-label="Visit previous portfolio version"
    >
      {/* Scan-line shimmer overlay */}
      <span className="vb-shimmer" aria-hidden="true" />

      <span className="vb-tag">V3.0</span>
      <span className="vb-text">GO TO PREVIOUS VERSION</span>
      <span className="vb-arrow">⟶</span>
      <span className="vb-domain">portfoliov32026.vercel.app</span>
    </a>
  )
}
