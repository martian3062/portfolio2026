'use client'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

const surfVert = `
  varying vec3 vNormal;
  varying vec3 vPos;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPos    = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const surfFrag = `
  uniform float uTime;
  uniform vec3  uColor;
  uniform vec3  uAtmoColor;
  varying vec3  vNormal;
  varying vec3  vPos;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + .1); p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(
      mix(mix(hash(i),          hash(i+vec3(1,0,0)),f.x),
          mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
      mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
          mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y), f.z);
  }
  float fbm(vec3 p) {
    float v=0.,a=.5;
    for(int i=0;i<5;i++){v+=a*noise(p);p*=2.1;a*=.5;}
    return v;
  }

  void main() {
    float f1 = fbm(vPos * 2.8 + vec3(uTime*0.016, 0., 0.));
    float f2 = fbm(vPos * 6.5 + vec3(0., uTime*0.011, 0.));

    vec3 col = mix(uColor*0.14, uColor*0.78, smoothstep(0.2, 0.65, f1));
    col = mix(col, uColor*1.6, smoothstep(0.72, 0.94, f1+f2*0.25) * 0.38);
    col = mix(col, vec3(0.88, 0.94, 1.0)*0.32, smoothstep(0.60, 0.78, f2) * 0.22);

    float fresnel = 1.0 - max(dot(normalize(vNormal), vec3(0.,0.,1.)), 0.0);
    fresnel = pow(fresnel, 2.5);
    col = mix(col, uAtmoColor * 3.2, fresnel * 0.68);

    gl_FragColor = vec4(col, 1.0);
  }
`

const atmoVert = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const atmoFrag = `
  uniform vec3 uAtmoColor;
  varying vec3 vNormal;
  void main() {
    float i = pow(0.54 - dot(normalize(vNormal), vec3(0.,0.,1.)), 2.1);
    gl_FragColor = vec4(uAtmoColor, clamp(i*1.15, 0.0, 1.0));
  }
`

export default function Planet({ position, radius, color, atmosphereColor, name, subtitle, rings }) {
  const planet = useRef()
  const ring   = useRef()

  const u = useMemo(() => ({
    uTime:      { value: 0 },
    uColor:     { value: new THREE.Color(color) },
    uAtmoColor: { value: new THREE.Color(atmosphereColor) },
  }), [color, atmosphereColor])

  const au = useMemo(() => ({
    uAtmoColor: { value: new THREE.Color(atmosphereColor) },
  }), [atmosphereColor])

  useFrame(({ clock }) => {
    u.uTime.value = clock.getElapsedTime()
    if (planet.current) planet.current.rotation.y = clock.getElapsedTime() * 0.038
    if (ring.current)   ring.current.rotation.z   = clock.getElapsedTime() * 0.011
  })

  return (
    <group position={position}>
      {/* Surface */}
      <mesh ref={planet}>
        <sphereGeometry args={[radius, 72, 72]} />
        <shaderMaterial vertexShader={surfVert} fragmentShader={surfFrag} uniforms={u} />
      </mesh>

      {/* Atmosphere shell */}
      <mesh>
        <sphereGeometry args={[radius * 1.11, 36, 36]} />
        <shaderMaterial
          vertexShader={atmoVert}
          fragmentShader={atmoFrag}
          uniforms={au}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Planet ambient light */}
      <pointLight color={color} intensity={2.5} distance={radius * 8} decay={2} />

      {/* Saturn-style rings */}
      {rings && (
        <mesh ref={ring} rotation={[Math.PI * 0.25, 0, 0]}>
          <ringGeometry args={[radius * 1.45, radius * 2.4, 128]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.65}
            transparent
            opacity={0.48}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* HTML label — positioned above planet */}
      <Html
        position={[0, radius + 2, 0]}
        center
        distanceFactor={radius * 5}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div className="planet-label">
          <p className="planet-label-name" style={{ color }}>{name}</p>
          <p className="planet-label-sub">{subtitle}</p>
        </div>
      </Html>
    </group>
  )
}
