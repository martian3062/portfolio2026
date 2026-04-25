'use client'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
uniform float uTime;
uniform vec2  uMouse;
varying vec2  vUv;

// Hash & smooth noise
vec3 hash3(vec2 p) {
  vec3 q = vec3(dot(p, vec2(127.1, 311.7)),
                dot(p, vec2(269.5, 183.3)),
                dot(p, vec2(419.2, 371.9)));
  return fract(sin(q) * 43758.5453);
}

float smoothNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(dot(hash3(i + vec2(0,0)).xy, f - vec2(0,0)),
                 dot(hash3(i + vec2(1,0)).xy, f - vec2(1,0)), u.x),
             mix(dot(hash3(i + vec2(0,1)).xy, f - vec2(0,1)),
                 dot(hash3(i + vec2(1,1)).xy, f - vec2(1,1)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  vec2  shift = vec2(100.0);
  mat2  rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 5; i++) {
    v += a * smoothNoise(p);
    p  = rot * p * 2.1 + shift;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;

  // Slow base drift + mouse warp
  vec2 q = vec2(fbm(uv + uTime * 0.06),
                fbm(uv + vec2(1.0)));

  // Mouse ripple — subtle warp toward cursor
  vec2  m    = uMouse * 0.5 + 0.5;
  float dist = length(uv - m);
  float pull = smoothstep(0.6, 0.0, dist) * 0.18;
  q += (m - uv) * pull;

  vec2 r = vec2(fbm(uv + 1.0 * q + uTime * 0.04 + vec2(1.7, 9.2)),
                fbm(uv + 1.0 * q + uTime * 0.04 + vec2(8.3, 2.8)));

  float f = fbm(uv + r);

  // Color palette — deep navy → indigo → cyan → void
  vec3 col = mix(
    vec3(0.0,  0.0,  0.04),   // void black-blue
    vec3(0.04, 0.0,  0.18),   // deep indigo
    clamp(f * f * 4.0, 0.0, 1.0)
  );
  col = mix(col,
    vec3(0.0,  0.05, 0.28),   // rich blue
    clamp(length(q), 0.0, 1.0)
  );
  col = mix(col,
    vec3(0.0,  0.18, 0.45),   // electric blue
    clamp(length(r.x), 0.0, 1.0)
  );

  // Cyan accent bloom where noise peaks
  float accent = smoothstep(0.55, 0.85, f);
  col += vec3(0.0, 0.35, 0.55) * accent * 0.45;

  // Subtle purple thread
  float purple = smoothstep(0.4, 0.7, fbm(uv * 2.2 + uTime * 0.03));
  col += vec3(0.22, 0.0, 0.55) * purple * 0.2;

  // Vignette
  vec2  vig = vUv * (1.0 - vUv.yx);
  float v   = vig.x * vig.y * 14.0;
  col *= pow(v, 0.25);

  gl_FragColor = vec4(col, 1.0);
}
`

export default function FluidBackground() {
  const matRef = useRef(null)

  const uniforms = useMemo(() => ({
    uTime:  { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
  }), [])

  useFrame(({ clock, mouse }) => {
    if (!matRef.current) return
    matRef.current.uniforms.uTime.value  = clock.getElapsedTime()
    matRef.current.uniforms.uMouse.value.lerp(mouse, 0.04)
  })

  return (
    <mesh scale={[18, 10, 1]} position={[0, 0, -4]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  )
}
