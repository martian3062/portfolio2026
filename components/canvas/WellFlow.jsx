'use client'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
uniform float uTime;
varying float vHeight;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.1 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec3 pos = position;
  float t = uTime * 0.35;
  float x = pos.x * 0.2;
  float y = pos.y * 0.2;

  float z  = sin(x * 1.6 + t)       * cos(y * 1.2 + t * 0.8)  * 1.8;
        z += sin(x * 3.2 - t * 0.5) * sin(y * 2.1 + t * 0.6)  * 0.7;
        z += cos(x * 0.8 + y * 1.0 + t * 0.4)                  * 0.9;
        z += (fbm(vec2(x, y) * 1.2 + t * 0.1) - 0.5)           * 1.4;

  pos.z = z;
  vHeight = clamp((z + 3.5) / 7.0, 0.0, 1.0);

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = max(1.0, (1.8 + vHeight * 2.8) * (520.0 / -mvPos.z));
  gl_Position  = projectionMatrix * mvPos;
}
`

const fragmentShader = `
varying float vHeight;

void main() {
  vec2  c = gl_PointCoord - 0.5;
  float r = dot(c, c);
  if (r > 0.25) discard;

  float soft = 1.0 - smoothstep(0.0, 0.25, r);

  vec3 col = mix(
    vec3(0.0,  0.05, 0.22),
    vec3(0.0,  0.72, 1.0),
    smoothstep(0.25, 0.75, vHeight)
  );
  col = mix(col, vec3(0.5, 0.0, 1.0), smoothstep(0.78, 1.0, vHeight));

  float alpha = soft * (0.22 + vHeight * 0.78);
  gl_FragColor = vec4(col, alpha);
}
`

export default function WellFlow() {
  const matRef = useRef()

  const { geo, uniforms } = useMemo(() => {
    const geo      = new THREE.PlaneGeometry(32, 26, 109, 89)
    const uniforms = { uTime: { value: 0 } }
    return { geo, uniforms }
  }, [])

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <points geometry={geo} rotation={[-Math.PI * 0.24, 0, 0]} position={[0, -0.6, 0]}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
