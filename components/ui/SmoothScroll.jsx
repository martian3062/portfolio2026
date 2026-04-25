'use client'
import { useEffect } from 'react'

export default function SmoothScroll({ children }) {
  useEffect(() => {
    let lenis
    import('lenis').then(({ default: Lenis }) => {
      lenis = new Lenis({ lerp: 0.08, smoothWheel: true })
      let rafId
      function raf(time) {
        lenis.raf(time)
        rafId = requestAnimationFrame(raf)
      }
      rafId = requestAnimationFrame(raf)
      return () => {
        cancelAnimationFrame(rafId)
        lenis.destroy()
      }
    })
    return () => { if (lenis) lenis.destroy() }
  }, [])

  return <>{children}</>
}
