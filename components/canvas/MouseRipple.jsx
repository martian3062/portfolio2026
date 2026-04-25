'use client'
import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const N = 14  // ripple slots

const vert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const frag = `
uniform float uTime;
uniform float uAspect;
uniform vec3  uRipples[14];
varying vec2  vUv;

void main() {
  // aspect-correct space: x in [0, aspect], y in [0, 1]
  vec2 st = vec2((vUv.x - 0.5) * uAspect + 0.5 * uAspect, vUv.y);

  float totalWave  = 0.0;
  float totalSharp = 0.0;

  for (int i = 0; i < 14; i++) {
    float startT = uRipples[i].z;
    if (startT < 0.0) continue;

    float age = uTime - startT;
    if (age < 0.0 || age > 3.2) continue;

    vec2 cUv = vec2(
      (uRipples[i].x - 0.5) * uAspect + 0.5 * uAspect,
       uRipples[i].y
    );

    float dist   = length(st - cUv);
    float fade   = pow(1.0 - age / 3.2, 1.6);
    float iSpeed = 0.48;

    // Three expanding ring waves per sample
    for (int k = 0; k < 3; k++) {
      float radius = (age - float(k) * 0.18) * iSpeed;
      if (radius < 0.0) continue;
      float rWidth = 0.009 + float(k) * 0.004;
      float d      = abs(dist - radius);
      float ring   = exp(-d * d / (rWidth * rWidth));
      ring *= (1.0 - float(k) * 0.28) * fade;
      totalWave  += ring;
      totalSharp += ring * step(d, rWidth * 0.35);
    }
  }

  totalWave  = clamp(totalWave,  0.0, 1.0);
  totalSharp = clamp(totalSharp, 0.0, 1.0);

  // Colour: electric cyan core → wormhole purple → void
  vec3 col = mix(vec3(0.0, 0.82, 1.0), vec3(0.55, 0.08, 1.0), totalWave * 0.55);
  col      = mix(col, vec3(1.0, 1.0, 1.0), totalSharp * 0.55);

  // Faint interference texture along the wavefront
  float tex = sin(totalWave * 24.0 - uTime * 6.0) * 0.5 + 0.5;
  col += vec3(0.0, 0.6, 1.0) * tex * totalWave * 0.12;

  float alpha = totalWave * 0.55 + totalSharp * 0.22;
  gl_FragColor = vec4(col, alpha);
}
`

export default function MouseRipple({ mouse }) {
  const matRef      = useRef()
  const { size }    = useThree()
  const lastSample  = useRef(0)
  const slots       = useRef(Array.from({ length: N }, () => ({ x: 0.5, y: 0.5, t: -999 })))
  const writeHead   = useRef(0)
  const prevMouse   = useRef({ x: -999, y: -999 })

  const uniforms = useMemo(() => ({
    uTime:    { value: 0 },
    uAspect:  { value: 1 },
    uRipples: { value: Array.from({ length: N }, () => new THREE.Vector3(0.5, 0.5, -999)) },
  }), [])

  useFrame(({ clock }) => {
    if (!matRef.current) return
    const t      = clock.getElapsedTime()
    const aspect = size.width / size.height

    uniforms.uTime.value   = t
    uniforms.uAspect.value = aspect

    // Sample every 80ms — only if mouse actually moved
    const mx = mouse.current.x * 0.5 + 0.5
    const my = mouse.current.y * 0.5 + 0.5
    const dx = mx - prevMouse.current.x
    const dy = my - prevMouse.current.y
    const moved = Math.sqrt(dx * dx + dy * dy) > 0.004

    if (moved && t - lastSample.current > 0.08) {
      lastSample.current = t
      prevMouse.current  = { x: mx, y: my }
      const slot = slots.current[writeHead.current]
      slot.x = mx
      slot.y = my
      slot.t = t
      writeHead.current = (writeHead.current + 1) % N
    }

    // Upload to GPU
    for (let i = 0; i < N; i++) {
      const s = slots.current[i]
      uniforms.uRipples.value[i].set(s.x, s.y, s.t)
    }
  })

  // Large plane at z=6 (between camera and scene) — sized to always fill screen
  return (
    <mesh position={[0, 0, 6]} renderOrder={5}>
      <planeGeometry args={[120, 120]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}
