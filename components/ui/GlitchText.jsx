export default function GlitchText({ children, className = '', tag: Tag = 'span' }) {
  return (
    <Tag className={`glitch ${className}`} data-text={children}>
      {children}
    </Tag>
  )
}
