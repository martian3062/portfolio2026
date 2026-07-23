'use client'
import { Suspense, useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment } from '@react-three/drei'

function RockyModel() {
  const { scene } = useGLTF('/models/rocky_twin.glb')
  const ref = useRef()

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.5
      ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.8) * 0.08
    }
  })

  return (
    <primitive
      ref={ref}
      object={scene}
      scale={1.4}
      position={[0, -0.6, 0]}
    />
  )
}

export default function DigitalTwin() {
  const [open, setOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [msgs, setMsgs] = useState([
    { role: 'ai', text: 'I\'m Pardeep\'s digital twin — trained on his writing, code, and decisions. Ask about his work, stack, or projects.' }
  ])
  const [input, setInput] = useState('')

  const send = async () => {
    if (!input.trim()) return
    const question = input.trim()
    setInput('')
    setMsgs(m => [...m, { role: 'user', text: question }])

    const DJANGO_URL = process.env.NEXT_PUBLIC_TWIN_API_URL || 'http://localhost:8000'

    // Try WebSocket streaming first, fall back to REST
    try {
      const ws = new WebSocket(`${DJANGO_URL.replace('http', 'ws')}/ws/twin/chat/`)

      let tokens = ''
      const aiIdx = Date.now()
      setMsgs(m => [...m, { role: 'ai', text: '▋', key: aiIdx }])

      ws.onopen  = () => ws.send(JSON.stringify({ message: question }))
      ws.onmessage = e => {
        const data = JSON.parse(e.data)
        if (data.token) {
          tokens += data.token
          setMsgs(m => m.map(msg => msg.key === aiIdx ? { ...msg, text: tokens + '▋' } : msg))
        }
        if (data.done) {
          setMsgs(m => m.map(msg => msg.key === aiIdx ? { ...msg, text: tokens } : msg))
          ws.close()
        }
        if (data.error) {
          setMsgs(m => m.map(msg => msg.key === aiIdx ? { ...msg, text: data.error } : msg))
          ws.close()
        }
      }
      ws.onerror = async () => {
        ws.close()
        // Fall back to REST
        const res = await fetch(`${DJANGO_URL}/api/twin/chat/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: question }),
        })
        const json = await res.json()
        setMsgs(m => m.map(msg => msg.key === aiIdx
          ? { ...msg, text: json.response || 'no response from twin' }
          : msg
        ))
      }
    } catch {
      setMsgs(m => [...m, {
        role: 'ai',
        text: 'Twin offline — sandhupardeep300@gmail.com',
      }])
    }
  }

  return (
    <div className="dt-widget">
      {/* Collapsed pill */}
      {!open && (
        <button className="dt-pill" onClick={() => setOpen(true)} aria-label="Open digital twin">
          <span className="dt-pill-ring" />
          <span className="dt-pill-label">CHAT WITH MY DIGITAL TWIN</span>
          <span className="dt-pill-dot" />
        </button>
      )}

      {/* Expanded panel */}
      {open && (
        <div className="dt-panel">
          <div className="dt-panel-header">
            <span className="dt-header-title">PARDEEP // DIGITAL TWIN</span>
            <span className="dt-stack-badge" title="Next.js streams to client, Django runs transformers/scikit-learn inference">NEXT.JS ⟷ DJANGO API</span>
            <button className="dt-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>

          {/* 3D model viewport */}
          <div className="dt-viewport">
            <Canvas
              camera={{ position: [0, 0, 3], fov: 50 }}
              gl={{ antialias: true, alpha: true }}
              style={{ background: 'transparent' }}
            >
              <ambientLight intensity={0.4} />
              <pointLight position={[2, 3, 2]} intensity={2.5} color="#00d4ff" />
              <pointLight position={[-2, -1, 1]} intensity={1.2} color="#9b30ff" />
              <Environment preset="city" background={false} />
              <Suspense fallback={null}>
                <RockyModel />
              </Suspense>
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate={false}
                minPolarAngle={Math.PI * 0.35}
                maxPolarAngle={Math.PI * 0.65}
              />
            </Canvas>
            <div className="dt-viewport-label">ROCKY — HAIL MARY CREW</div>
          </div>

          {/* Chat toggle */}
          <button className="dt-chat-toggle" onClick={() => setChatOpen(c => !c)}>
            {chatOpen ? 'HIDE CHAT' : '⟶ OPEN CHAT INTERFACE'}
          </button>

          {chatOpen && (
            <div className="dt-chat">
              <div className="dt-messages">
                {msgs.map((m, i) => (
                  <div key={i} className={`dt-msg dt-msg--${m.role}`}>
                    {m.role === 'ai' && <span className="dt-msg-sender">TWIN //</span>}
                    <span>{m.text}</span>
                  </div>
                ))}
              </div>
              <div className="dt-input-row">
                <input
                  className="dt-input"
                  placeholder="TRANSMIT MESSAGE..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                />
                <button className="dt-send" onClick={send}>⟶</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
