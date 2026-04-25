export default function HUDFrame({ children, label, className = '' }) {
  return (
    <div className={`hud-frame ${className}`}>
      {label && <span className="hud-label">{label}</span>}
      <div className="hud-corner hud-tl" />
      <div className="hud-corner hud-tr" />
      <div className="hud-corner hud-bl" />
      <div className="hud-corner hud-br" />
      {children}
    </div>
  )
}
