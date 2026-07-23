'use client'
import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../../lib/scrollState'

const N = 28

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
uniform vec3  uRipples[28];
varying vec2  vUv;

void main() {
  vec2 st = vec2((vUv.x - 0.5) * uAspect + 0.5 * uAspect, vUv.y);

  float totalWave  = 0.0;
  float totalSharp = 0.0;
  float totalWake  = 0.0;

  for (int i = 0; i < 28; i++) {
    float startT = uRipples[i].z;
    if (startT < 0.0) continue;

    float age = uTime - startT;
    if (age < 0.0 || age > 4.2) continue;

    vec2 cUv = vec2(
      (uRipples[i].x - 0.5) * uAspect + 0.5 * uAspect,
       uRipples[i].y
    );

    float dist = length(st - cUv);
    float fade = pow(1.0 - age / 4.2, 1.45);

    float wake = exp(-(dist * dist) / (0.035 + age * 0.012));
    float wobble = sin(dist * 72.0 - age * 9.0 + vUv.x * 8.0) * 0.5 + 0.5;
    totalWake += wake * fade * (0.46 + wobble * 0.32);

    for (int k = 0; k < 4; k++) {
      float radius = (age - float(k) * 0.14) * 0.42;
      if (radius < 0.0) continue;
      float rWidth = 0.013 + float(k) * 0.005 + age * 0.002;
      float d = abs(dist - radius);
      float ring = exp(-d * d / (rWidth * rWidth));
      ring *= (1.0 - float(k) * 0.2) * fade;
      totalWave += ring;
      totalSharp += ring * step(d, rWidth * 0.35);
    }
  }

  totalWave  = clamp(totalWave,  0.0, 1.0);
  totalSharp = clamp(totalSharp, 0.0, 1.0);
  totalWake  = clamp(totalWake,  0.0, 1.0);

  vec3 col = mix(vec3(0.0, 0.82, 1.0), vec3(0.55, 0.08, 1.0), (totalWave + totalWake) * 0.42);
  col = mix(col, vec3(1.0), totalSharp * 0.55);
  col = mix(col, vec3(0.02, 0.9, 0.72), totalWake * 0.22);

  float tex = sin((totalWave + totalWake) * 24.0 - uTime * 6.0 + vUv.y * 16.0) * 0.5 + 0.5;
  col += vec3(0.0, 0.6, 1.0) * tex * (totalWave * 0.12 + totalWake * 0.2);

  float alpha = totalWave * 0.46 + totalSharp * 0.2 + totalWake * 0.28;
  gl_FragColor = vec4(col, alpha);
}
`

export default function MouseRipple({ mouse, clickPulse }) {
  const matRef = useRef()
  const { size } = useThree()
  const lastSample = useRef(0)
  const lastScroll = useRef(0)
  const lastClickSeq = useRef(-1)
  const slots = useRef(Array.from({ length: N }, () => ({ x: 0.5, y: 0.5, t: -999 })))
  const writeHead = useRef(0)
  const prevMouse = useRef({ x: -999, y: -999 })

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uRipples: { value: Array.from({ length: N }, () => new THREE.Vector3(0.5, 0.5, -999)) },
  }), [])

  useFrame(({ clock }) => {
    if (!matRef.current) return
    const t = clock.getElapsedTime()

    uniforms.uTime.value = t
    uniforms.uAspect.value = size.width / size.height

    const mx = mouse.current.x * 0.5 + 0.5
    const my = mouse.current.y * 0.5 + 0.5
    const dx = mx - prevMouse.current.x
    const dy = my - prevMouse.current.y
    const moved = Math.sqrt(dx * dx + dy * dy) > 0.003

    const writeRipple = (x, y, offset = 0) => {
      const slot = slots.current[writeHead.current]
      slot.x = THREE.MathUtils.clamp(x, 0.02, 0.98)
      slot.y = THREE.MathUtils.clamp(y, 0.02, 0.98)
      slot.t = t + offset
      writeHead.current = (writeHead.current + 1) % N
    }

    if (moved && t - lastSample.current > 0.035) {
      lastSample.current = t
      prevMouse.current = { x: mx, y: my }
      writeRipple(mx, my)
      writeRipple(mx - dx * 2.6, my - dy * 2.6, -0.045)
    }

    const click = clickPulse?.current
    if (click && click.seq !== lastClickSeq.current) {
      lastClickSeq.current = click.seq
      writeRipple(click.x, click.y, 0)
      writeRipple(click.x + 0.035, click.y - 0.025, -0.08)
      writeRipple(click.x - 0.03, click.y + 0.03, -0.14)
      writeRipple(click.x + 0.02, click.y + 0.04, -0.22)
    }

    const scrollKick = Math.min(1, Math.abs(scrollState.velocity / 280))
    if (scrollKick > 0.08 && t - lastScroll.current > 0.12) {
      lastScroll.current = t
      writeRipple(0.5 + mouse.current.x * 0.14, 0.52 + Math.sign(scrollState.velocity) * 0.16)
      writeRipple(0.5 - mouse.current.x * 0.08, 0.48 - Math.sign(scrollState.velocity) * 0.12, -0.08)
    }

    for (let i = 0; i < N; i++) {
      const s = slots.current[i]
      uniforms.uRipples.value[i].set(s.x, s.y, s.t)
    }
  })

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
