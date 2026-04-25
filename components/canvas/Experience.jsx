'use client'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor, Environment, Sparkles, useFBO, useGLTF, useTexture } from '@react-three/drei'
import {
  EffectComposer, Bloom, ChromaticAberration, Noise, Vignette, DepthOfField,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { Suspense, useState, useEffect, useRef, useMemo } from 'react'

import NebulaBackground from './NebulaBackground'
import CosmicRing       from './CosmicRing'
import QuantumHelix     from './QuantumHelix'
import BlackHole        from './BlackHole'
import AstrophageOrbs   from './AstrophageOrbs'
import ScifiModels      from './ScifiModels'
import MouseRipple      from './MouseRipple'
import ScrollCamera     from './ScrollCamera'
import { scrollState }  from '../../lib/scrollState'

// ─── Screen-space gravitational lensing via FBO + fullscreen quad ─────────────
// This avoids wrapEffect's Turbopack circular-ref issues entirely.

const LENS_VERT = /* glsl */`
varying vec2 vUv;
void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }
`
const LENS_FRAG = /* glsl */`
uniform sampler2D uScene;
uniform vec2      uCenter;
uniform float     uRadius;
uniform float     uAspect;
uniform float     uStrength;
varying vec2      vUv;

void main(){
  vec2  d   = vUv - uCenter;
  d.x      *= uAspect;
  float r   = length(d);
  float r_s = uRadius;

  // ── event horizon ──────────────────────────
  if(r < r_s * 0.96){
    gl_FragColor = vec4(0.0,0.0,0.0,1.0);
    return;
  }

  // ── gravitational lensing ──────────────────
  float alpha = uStrength * r_s * r_s * 2.0 / (r*r + 0.0001);
  alpha = min(alpha, 0.6);
  d.x /= uAspect;
  vec2 lensedUV = clamp(vUv - normalize(d)*alpha, 0.001, 0.999);

  float mu = 1.0 + uStrength * r_s * r_s / (r * r * 1.4);
  mu = clamp(mu, 1.0, 5.0);

  // ── photon ring ────────────────────────────
  float pWidth  = r_s * 0.10;
  float photon  = exp(-pow((r - r_s*1.50)/pWidth, 2.0));
  vec3  pCol    = mix(vec3(1.0,0.85,0.65), vec3(1.0), photon) * photon * 3.5;

  // ── Einstein ring glow ─────────────────────
  float eW      = r_s * 0.24;
  float einstein= exp(-pow((r - r_s*2.55)/eW, 2.0)) * 0.4;

  vec4 col      = texture2D(uScene, lensedUV);
  col.rgb      *= mu * smoothstep(r_s, r_s*1.35, r);
  col.rgb      += pCol + vec3(0.9,0.85,0.8)*einstein;
  gl_FragColor  = col;
}
`

// Renders the scene to an FBO, then draws a fullscreen quad with lensing.
// bhRef exposes getScreenUV() so we know where to centre the lens.
function GravLensPass({ bhRef }) {
  const { gl, scene, camera, size } = useThree()
  const matRef = useRef()

  const fbo = useFBO({ stencilBuffer: false })

  const uniforms = useMemo(() => ({
    uScene:    { value: fbo.texture },
    uCenter:   { value: new THREE.Vector2(0.5, 0.5) },
    uRadius:   { value: 0.075 },
    uAspect:   { value: 16 / 9 },
    uStrength: { value: 1.75 },
  }), [fbo])

  // Priority -1 = capture scene to FBO BEFORE R3F's main render
  useFrame(() => {
    // Capture scene on layer 0 (lensing quad itself is on layer 5)
    camera.layers.set(0)
    gl.setRenderTarget(fbo)
    gl.clear()
    gl.render(scene, camera)
    gl.setRenderTarget(null)
    camera.layers.enableAll()

    if (!matRef.current) return

    // Update BH screen UV
    if (bhRef?.current) {
      const uv = bhRef.current.getScreenUV()
      matRef.current.uniforms.uCenter.value.copy(uv)
    }

    // Update aspect + radius
    const aspect   = size.width / size.height
    const camDist  = camera.position.length()
    const fovRad   = (camera.fov * Math.PI) / 180
    const angFrac  = 1.0 / (camDist * Math.tan(fovRad / 2))

    matRef.current.uniforms.uAspect.value = aspect
    matRef.current.uniforms.uRadius.value = angFrac * 0.72
  }, -1)

  return (
    // NDC fullscreen quad, placed on layer 5 so it's excluded from the FBO capture
    <mesh layers={5} renderOrder={999}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={LENS_VERT}
        fragmentShader={LENS_FRAG}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── Dust / ISM ──────────────────────────────────────────────────────────────
function DustField() {
  return (
    <>
      <Sparkles count={1050} scale={24} size={0.5}  speed={0.08} opacity={0.18} color="#ccd8ee" noise={0.4}/>
      <Sparkles count={520}  scale={50} size={0.95} speed={0.045} opacity={0.1} color="#e0cc98" noise={0.6}/>
      <Sparkles count={260}  scale={78} size={1.5}  speed={0.02} opacity={0.07} color="#a8b8cc" noise={0.8}/>
    </>
  )
}

// ─── Scene ───────────────────────────────────────────────────────────────────
function PhotoNeRFMesh({ position, rotation, scale = 1, opacity = 0.74 }) {
  const texture = useTexture('/pardeep-space.jpg')
  const matRef = useRef()

  const uniforms = useMemo(() => ({
    uMap: { value: texture },
    uTime: { value: 0 },
    uOpacity: { value: opacity },
  }), [texture, opacity])

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.elapsedTime
  })

  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[3.4, 5.7, 96, 144]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        vertexShader={/* glsl */`
          uniform sampler2D uMap;
          uniform float uTime;
          varying vec2 vUv;
          varying float vDepth;

          void main() {
            vUv = uv;
            vec3 pos = position;
            vec3 photo = texture2D(uMap, uv).rgb;
            float lum = dot(photo, vec3(0.299, 0.587, 0.114));
            float edge = smoothstep(0.0, 0.18, uv.x) * smoothstep(1.0, 0.82, uv.x)
                       * smoothstep(0.0, 0.18, uv.y) * smoothstep(1.0, 0.82, uv.y);
            vDepth = lum;
            pos.z += (lum - 0.42) * 1.15 * edge;
            pos.x += sin(uv.y * 18.0 + uTime * 0.25) * 0.018 * edge;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={/* glsl */`
          uniform sampler2D uMap;
          uniform float uOpacity;
          varying vec2 vUv;
          varying float vDepth;

          void main() {
            vec4 tex = texture2D(uMap, vUv);
            float edge = smoothstep(0.02, 0.16, vUv.x) * smoothstep(0.98, 0.84, vUv.x)
                       * smoothstep(0.02, 0.16, vUv.y) * smoothstep(0.98, 0.84, vUv.y);
            vec3 scan = vec3(0.08, 0.45, 1.0) * smoothstep(0.42, 0.95, vDepth) * 0.32;
            gl_FragColor = vec4(tex.rgb + scan, tex.a * edge * uOpacity);
          }
        `}
      />
    </mesh>
  )
}

function LocalSpacecraftModels() {
  const endurance = useGLTF('/models/interstellar__endurance.glb')
  const hailMary = useGLTF('/models/project_hail_mary_ship.glb')

  const models = useMemo(() => {
    const makeModel = (source, targetSize) => {
      const clone = source.scene.clone(true)
      clone.traverse(child => {
        if (child.isMesh) {
          child.castShadow = false
          child.receiveShadow = false
          if (child.material) {
            child.material = child.material.clone()
            child.material.envMapIntensity = 1.8
          }
        }
      })
      clone.updateMatrixWorld(true)
      const box = new THREE.Box3().setFromObject(clone)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())
      const maxAxis = Math.max(size.x, size.y, size.z, 0.001)
      clone.position.sub(center)
      return { object: clone, scale: targetSize / maxAxis }
    }

    return {
      endurance: makeModel(endurance, 4.6),
      hailMary: makeModel(hailMary, 4.9),
    }
  }, [endurance, hailMary])

  return (
    <group>
      <group position={[-4.9, -1.8, -8.4]} rotation={[0.18, 0.62, -0.08]} scale={models.endurance.scale}>
        <primitive object={models.endurance.object} />
        <pointLight color="#b8e8ff" intensity={1.9} distance={9} decay={2} />
      </group>
      <group position={[4.8, -1.1, -12.2]} rotation={[-0.12, -0.78, 0.1]} scale={models.hailMary.scale}>
        <primitive object={models.hailMary.object} />
        <pointLight color="#ffb800" intensity={1.6} distance={8} decay={2} />
      </group>
    </group>
  )
}

function RelativisticJets() {
  const top = useRef()
  const bottom = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (top.current) top.current.rotation.z = t * 0.06
    if (bottom.current) bottom.current.rotation.z = -t * 0.06
  })

  return (
    <group>
      <mesh ref={top} position={[0, 3.9, -0.15]}>
        <coneGeometry args={[0.4, 8.6, 64, 1, true]} />
        <meshBasicMaterial color="#82f7ff" transparent opacity={0.28} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={bottom} position={[0, -3.9, -0.15]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.4, 8.6, 64, 1, true]} />
        <meshBasicMaterial color="#ff8a2f" transparent opacity={0.2} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <Sparkles count={240} scale={[5.4, 11.5, 5.4]} size={1.25} speed={0.3} opacity={0.22} color="#dffbff" noise={0.72} />
    </group>
  )
}

function Scene({ mouse, bhRef, quality }) {
  return (
    <>
      <Environment preset="warehouse" background={false} />

      <NebulaBackground />
      <CosmicRing />
      <QuantumHelix position={[-7, 1, -16]} />

      <BlackHole ref={bhRef} mouse={mouse} />
      <RelativisticJets />
      <PhotoNeRFMesh position={[-5.8, 0.1, -7.6]} rotation={[0.08, 0.76, 0.02]} scale={1.05} />
      <PhotoNeRFMesh position={[5.7, -0.2, -10.8]} rotation={[-0.04, -0.7, -0.03]} scale={0.92} opacity={0.58} />
      <LocalSpacecraftModels />
      <AstrophageOrbs />
      <ScifiModels mouse={mouse} />
      <DustField />
      <MouseRipple mouse={mouse} />

      {/* FBO lensing quad */}
      <GravLensPass bhRef={bhRef} />

      <ScrollCamera />

      {/* Lighting */}
      <ambientLight intensity={0.016} />
      <pointLight position={[0, 0.4, 1.2]}  intensity={3.2} color="#5ab4cc" distance={22} decay={2}/>
      <pointLight position={[-5, 2, -5]}     intensity={1.0} color="#c07820" distance={18} decay={2}/>
      <pointLight position={[4, -2, -12]}    intensity={1.4} color="#2244aa" distance={20} decay={2}/>
      <pointLight position={[1.5, 0.5, -28]} intensity={10}  color="#eef4ff" distance={55} decay={2}/>

      {/* Post-processing — no custom Effect, no wrapEffect */}
      <EffectComposer multisampling={0}>
        {quality > 0 && (
          <DepthOfField focusDistance={0.012} focalLength={0.015}
            bokehScale={quality > 1 ? 2.0 : 1.2} height={quality > 1 ? 700 : 400} />
        )}
        <Bloom
          intensity={1.45}
          luminanceThreshold={0.34}
          luminanceSmoothing={0.65}
          radius={0.75}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[0.0006, 0.0006]}
        />
        <Noise   opacity={0.013} blendFunction={BlendFunction.SOFT_LIGHT}/>
        <Vignette eskil={false}  offset={0.28} darkness={0.80}/>
      </EffectComposer>
    </>
  )
}

// ─── Canvas root ─────────────────────────────────────────────────────────────
export default function Experience() {
  const [quality, setQuality] = useState(1)
  const mouse  = useRef({ x: 0, y: 0 })
  const bhRef  = useRef()

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
      last = window.scrollY
      scrollState.y = window.scrollY
      scrollState.progress = window.scrollY / max
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="canvas-wrapper">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 62, near: 0.1, far: 200 }}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.setClearColor('#00000a')
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 0.68
        }}
        dpr={quality > 1 ? 2 : 1.5}
      >
        <PerformanceMonitor
          iterations={5}
          threshold={0.75}
          onDecline={() => setQuality(q => Math.max(0, q - 1))}
          onIncline={() => setQuality(q => Math.min(2, q + 1))}
        />
        <Suspense fallback={null}>
          <Scene mouse={mouse} bhRef={bhRef} quality={quality} />
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload('/models/interstellar__endurance.glb')
useGLTF.preload('/models/project_hail_mary_ship.glb')
useTexture.preload('/pardeep-space.jpg')
