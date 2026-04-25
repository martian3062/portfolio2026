'use client'
import { Canvas }            from '@react-three/fiber'
import { PerformanceMonitor, Environment, Sparkles } from '@react-three/drei'
import {
  EffectComposer, Bloom, ChromaticAberration,
  Noise, Vignette, DepthOfField,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE                from 'three'
import { Suspense, useState, useEffect, useRef } from 'react'

import NebulaBackground from './NebulaBackground'
import CosmicRing       from './CosmicRing'
import QuantumHelix     from './QuantumHelix'
import BlackHole        from './BlackHole'
import AstrophageOrbs   from './AstrophageOrbs'
import ScifiModels      from './ScifiModels'
import MouseRipple      from './MouseRipple'
import ScrollCamera     from './ScrollCamera'
import { scrollState }  from '../../lib/scrollState'

// ─── Realistic volumetric dust cloud ─────────────────────────────────────────
// Uses drei's Sparkles (GPU-instanced point sprites) instead of custom particles.
// No coloured LED toys — size/opacity/speed tuned for real interstellar dust.
function DustField() {
  return (
    <>
      {/* Near dust — very faint, moves with camera parallax */}
      <Sparkles
        count={1200}
        scale={28}
        size={0.6}
        speed={0.08}
        opacity={0.18}
        color="#ccd8ee"
        noise={0.4}
      />
      {/* Mid dust — slightly larger, warmer */}
      <Sparkles
        count={600}
        scale={55}
        size={1.1}
        speed={0.04}
        opacity={0.12}
        color="#e8d5b0"
        noise={0.6}
      />
      {/* Deep background shimmer */}
      <Sparkles
        count={300}
        scale={85}
        size={1.8}
        speed={0.02}
        opacity={0.08}
        color="#aabbd4"
        noise={0.8}
      />
    </>
  )
}

function Scene({ mouse }) {
  return (
    <>
      {/* Physical env map — city gives clean neutral reflections on metals/glass */}
      <Environment preset="city" background={false} />

      {/* ── z = -92 sphere skybox ── */}
      <NebulaBackground />

      {/* ── z = -28 station ── */}
      <CosmicRing />

      {/* ── z = -16 research artifact ── */}
      <QuantumHelix position={[-7, 1, -16]} />

      {/* ── z = 0 hero ── */}
      <BlackHole mouse={mouse} />

      {/* ── Section 3-D objects (scroll-activated) ── */}
      <AstrophageOrbs />
      <ScifiModels mouse={mouse} />

      {/* ── Dust / particle field ── */}
      <DustField />

      {/* ── Mouse ripple distortion ── */}
      <MouseRipple mouse={mouse} />

      <ScrollCamera />

      {/* ── Physically-based lighting ──────────────────────────────────────
          Key:  1 dominant source (cyan from BH), 2 fills, 1 rim, 1 deep backlight.
          Low intensities — ACES tone mapping brightens naturally.          ─────────────────────────────────────────────────────────────── */}
      <ambientLight intensity={0.018} />

      {/* Primary: cyan emission around event horizon */}
      <pointLight position={[0, 0.5, 1.5]} intensity={3.5} color="#5ab4d4" distance={24} decay={2} />

      {/* Fill: warm amber from Astrophage cloud */}
      <pointLight position={[-5, 2, -5]}   intensity={1.2} color="#c88030" distance={18} decay={2} />

      {/* Rim: cold blue from deep behind — grazes metallic edges */}
      <pointLight position={[4, -2, -12]}  intensity={1.6} color="#2244aa" distance={22} decay={2} />

      {/* Deep: lights up the CosmicRing */}
      <pointLight position={[1, 0.5, -28]} intensity={12}  color="#eef4ff" distance={50} decay={2} />

      {/* ── Post-processing ─────────────────────────────────────────────── */}
      <EffectComposer multisampling={4}>
        {/* Cinematic DoF — focus band centred on the black hole */}
        <DepthOfField
          focusDistance={0.01}
          focalLength={0.016}
          bokehScale={2.2}
          height={720}
        />

        {/* Conservative bloom — just enough for hot plasma to bleed */}
        <Bloom
          intensity={1.4}
          luminanceThreshold={0.22}
          luminanceSmoothing={0.7}
          radius={0.85}
          mipmapBlur
        />

        {/* Minimal CA — 1px shift, cinematic feel without rainbow fringing */}
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[0.0008, 0.0008]}
        />

        {/* Very light grain — film stock feel */}
        <Noise opacity={0.016} blendFunction={BlendFunction.SOFT_LIGHT} />

        <Vignette eskil={false} offset={0.3} darkness={0.82} />
      </EffectComposer>
    </>
  )
}

export default function Experience() {
  const [dpr, setDpr] = useState(1.5)
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x =  (e.clientX / window.innerWidth)  * 2 - 1
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    let last = 0
    const onScroll = () => {
      const max = Math.max(1, document.body.scrollHeight - window.innerHeight)
      scrollState.velocity = window.scrollY - last
      last                 = window.scrollY
      scrollState.y        = window.scrollY
      scrollState.progress = window.scrollY / max
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="canvas-wrapper">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 62, near: 0.1, far: 200 }}
        gl={{
          antialias:          true,
          alpha:              false,
          powerPreference:    'high-performance',
          toneMapping:        THREE.ACESFilmicToneMapping,  // ← key upgrade
          toneMappingExposure: 0.72,   // slightly underexposed = cinematic
        }}
        onCreated={({ gl }) => gl.setClearColor('#00000a')}
        dpr={dpr}
      >
        <PerformanceMonitor
          onDecline={() => setDpr(1)}
          onIncline={() => setDpr(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1.5, 2))}
        />
        <Suspense fallback={null}>
          <Scene mouse={mouse} />
        </Suspense>
      </Canvas>
    </div>
  )
}
