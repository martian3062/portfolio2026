'use client'
import { useEffect, useRef, useState } from 'react'

const JOINTS = [
  [60,160],[45,130],[30,108],[18,90],[10,74],
  [55,100],[50,72],[46,52],[43,36],
  [60,98],[59,68],[58,46],[57,30],
  [68,100],[70,70],[71,50],[71,34],
  [78,106],[82,78],[84,60],[85,46],
]
const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
]

export default function CameraHUD() {
  const canvasRef  = useRef()
  const frameRef   = useRef()
  const [ts, setTs] = useState('00:00:00')
  const [focal, setFocal] = useState(62)

  useEffect(() => {
    const id = setInterval(() => {
      setTs(new Date().toISOString().slice(11, 19))
      setFocal(62 + Math.round(Math.sin(Date.now() * 0.0003) * 4))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 172, H = 172, CX = W / 2, CY = H / 2, R = 80

    const draw = (now) => {
      const t = now * 0.001
      ctx.clearRect(0, 0, W, H)

      // ── Outer tick ring ──
      ctx.save()
      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2 - Math.PI / 2
        const major = i % 5 === 0
        const inner = R - (major ? 9 : 5)
        ctx.strokeStyle = major
          ? `rgba(0,212,255,${0.65 + 0.25 * Math.sin(t * 0.5 + i * 0.3)})`
          : 'rgba(0,212,255,0.22)'
        ctx.lineWidth = major ? 1.5 : 0.8
        ctx.beginPath()
        ctx.moveTo(CX + Math.cos(angle) * inner, CY + Math.sin(angle) * inner)
        ctx.lineTo(CX + Math.cos(angle) * R,     CY + Math.sin(angle) * R)
        ctx.stroke()
      }
      ctx.restore()

      // ── Concentric rings ──
      ;[R, R - 14, R - 28].forEach((r, ri) => {
        ctx.beginPath()
        ctx.arc(CX, CY, r, 0, Math.PI * 2)
        ctx.strokeStyle = ri === 0
          ? `rgba(0,212,255,${0.45 + 0.15 * Math.sin(t * 0.7)})`
          : `rgba(0,212,255,${0.1 + 0.05 * ri})`
        ctx.lineWidth = ri === 0 ? 1.5 : 0.7
        ctx.stroke()
      })

      // ── Rotating scanner beam ──
      const scanAngle = (t * 0.9) % (Math.PI * 2) - Math.PI / 2
      const grad = ctx.createConicalGradient
        ? ctx.createConicalGradient(CX, CY, scanAngle)
        : null
      if (!grad) {
        // Fallback: rotating line + fade arc
        ctx.save()
        ctx.translate(CX, CY)
        ctx.rotate(scanAngle + Math.PI / 2)
        const beam = ctx.createLinearGradient(0, 0, 0, -(R - 2))
        beam.addColorStop(0, 'rgba(0,212,255,0.55)')
        beam.addColorStop(1, 'rgba(0,212,255,0)')
        ctx.strokeStyle = beam
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, -(R - 2))
        ctx.stroke()

        // Swept arc fade
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.arc(0, 0, R - 2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 0.45, false)
        ctx.closePath()
        const arcFade = ctx.createRadialGradient(0, 0, 0, 0, 0, R - 2)
        arcFade.addColorStop(0, 'rgba(0,212,255,0.0)')
        arcFade.addColorStop(1, 'rgba(0,212,255,0.06)')
        ctx.fillStyle = arcFade
        ctx.fill()
        ctx.restore()
      }

      // ── Hand skeleton (scaled to fit inner circle) ──
      const scaleX = (x) => CX + ((x - 60) / 90) * (R - 32)
      const scaleY = (y) => CY + ((y - 100) / 90) * (R - 28)

      const joints = JOINTS.map(([x, y], i) => [
        scaleX(x + Math.sin(t * 0.7 + i * 1.3) * 1.0),
        scaleY(y + Math.cos(t * 0.5 + i * 0.9) * 0.7),
      ])

      ctx.save()
      ctx.beginPath()
      ctx.arc(CX, CY, R - 18, 0, Math.PI * 2)
      ctx.clip()

      // Scanline texture
      for (let sy = 0; sy < H; sy += 4) {
        ctx.fillStyle = `rgba(0,212,255,${0.015 + 0.008 * Math.sin(sy * 0.15 - t * 3)})`
        ctx.fillRect(0, sy, W, 1)
      }

      // Bones
      ctx.lineWidth = 1.0
      CONNECTIONS.forEach(([a, b]) => {
        const pulse = 0.45 + 0.25 * Math.sin(t * 1.8 + (a + b) * 0.4)
        ctx.strokeStyle = `rgba(0,212,255,${pulse})`
        ctx.beginPath()
        ctx.moveTo(joints[a][0], joints[a][1])
        ctx.lineTo(joints[b][0], joints[b][1])
        ctx.stroke()
      })

      // Joints
      joints.forEach(([x, y], i) => {
        const isTip = [4, 8, 12, 16, 20].includes(i)
        const glow  = 0.6 + 0.35 * Math.sin(t * 2.2 + i * 0.7)
        ctx.beginPath()
        ctx.arc(x, y, isTip ? 2.5 : 1.8, 0, Math.PI * 2)
        ctx.fillStyle = isTip ? `rgba(155,48,255,${glow})` : `rgba(0,212,255,${glow})`
        ctx.fill()
        if (isTip) {
          ctx.beginPath()
          ctx.arc(x, y, 4.5, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(155,48,255,${glow * 0.45})`
          ctx.lineWidth = 0.7
          ctx.stroke()
        }
      })
      ctx.restore()

      // ── Cardinal labels ──
      ctx.font = '600 6.5px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ;[['N', 0], ['E', 90], ['S', 180], ['W', 270]].forEach(([lbl, deg]) => {
        const rad = (deg - 90) * (Math.PI / 180)
        const lr  = R - 5
        ctx.fillStyle = lbl === 'N' ? 'rgba(0,255,136,0.8)' : 'rgba(0,212,255,0.5)'
        ctx.fillText(lbl, CX + Math.cos(rad) * lr, CY + Math.sin(rad) * lr)
      })

      // ── Center dot ──
      ctx.beginPath()
      ctx.arc(CX, CY, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(0,212,255,${0.7 + 0.3 * Math.sin(t * 3)})`
      ctx.fill()
      ctx.beginPath()
      ctx.arc(CX, CY, 7, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(0,212,255,${0.25 + 0.15 * Math.sin(t * 3)})`
      ctx.lineWidth = 0.8
      ctx.stroke()

      frameRef.current = requestAnimationFrame(draw)
    }

    frameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  return (
    <div className="cam-hud-circle" aria-hidden="true">
      <canvas ref={canvasRef} width={172} height={172} className="cam-circle-canvas" />

      {/* Outer glow ring (CSS) */}
      <div className="cam-circle-ring" />

      {/* Readout chips */}
      <div className="cam-chip cam-chip-top">
        <span className="cam-rec-dot" />REC · {ts}
      </div>
      <div className="cam-chip cam-chip-bot">
        FOV {focal}° · HAND TRACK
      </div>
    </div>
  )
}
