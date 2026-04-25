'use client'
import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { scrollState } from '../../lib/scrollState'

// ─── Shared disk shader — Gargantua temperature profile + Doppler beaming ────
const DISK_VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const DISK_FRAG = /* glsl */`
uniform float uTime;
uniform float uSecondary;   // 0 = primary disk, 1 = secondary (lensed) arc
varying vec2  vUv;

// ── value noise ─────────────────────────────────────────────
float hash(vec2 p) {
  p = fract(p * vec2(234.34,435.345)); p += dot(p,p+34.23);
  return fract(p.x*p.y);
}
float vnoise(vec2 p) {
  vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p,int oct){
  float v=0.0,a=0.5;
  for(int i=0;i<8;i++){ if(i>=oct) break; v+=a*vnoise(p);p=p*2.1+vec2(1.7,9.2);a*=0.5; }
  return v;
}

// ── Planck blackbody → RGB (Tanner's approximation) ─────────
vec3 blackbody(float K) {
  K = clamp(K, 800.0, 40000.0);
  float t = K / 100.0;
  float r = t<=66.0 ? 1.0 : clamp(329.698727*pow(t-60.0,-0.1332048)/255.0,0.0,1.0);
  float g = t<=66.0 ? clamp((99.4708026*log(t)-161.1195681)/255.0,0.0,1.0)
                    : clamp(288.1221696*pow(t-60.0,-0.0755148)/255.0,0.0,1.0);
  float b = t>=66.0 ? 1.0 : (t<=19.0 ? 0.0 : clamp((138.5177312*log(t-10.0)-305.0447927)/255.0,0.0,1.0));
  return vec3(r,g,b);
}

void main() {
  vec2  delta = vUv - 0.5;
  float r     = length(delta) * 2.0;
  float angle = atan(delta.y, delta.x);

  // ── disk region ─────────────────────────────────────────────
  float rIn   = uSecondary > 0.5 ? 0.34 : 0.30;
  float rOut  = uSecondary > 0.5 ? 0.72 : 0.96;
  float mask  = smoothstep(rIn-0.025,rIn+0.02,r) * smoothstep(rOut+0.02,rOut-0.04,r);
  if(mask < 0.001) { gl_FragColor=vec4(0.0); return; }

  // ── temperature profile ─────────────────────────────────────
  float rNorm = clamp((r-rIn)/(rOut-rIn),0.0,1.0);
  float T_K   = mix(26000.0, 1400.0, pow(rNorm,0.72));

  // ── Doppler beaming ─────────────────────────────────────────
  float beta     = mix(0.52, 0.14, rNorm);             // orbital velocity / c
  float cosTheta = -sin(angle - uTime * (uSecondary>0.5?0.45:0.55));
  float gamma    = inversesqrt(max(1.0-beta*beta,0.001));
  float doppler  = 1.0 / (gamma*(1.0-beta*cosTheta));
  float beam     = pow(clamp(doppler,0.05,5.0), 3.5);

  // ── plasma turbulence ────────────────────────────────────────
  float swirl  = angle*0.5 - uTime*(uSecondary>0.5?0.42:0.48) - r*5.5;
  float n1     = vnoise(vec2(swirl*0.4, r*7.0  - uTime*0.9));
  float n2     = vnoise(vec2(swirl*1.1, r*14.0 - uTime*1.6))*0.4;
  float plasma  = fbm(vec2(swirl*0.22,r*3.2+uTime*0.18),5);
  float detail  = 0.52 + 0.48*(n1+n2+plasma*0.3);

  // ── photon ring (ultra-thin at rIn) ──────────────────────────
  float photon = exp(-pow((r-(rIn+0.016))/0.011,2.0));

  // ── final colour ─────────────────────────────────────────────
  float bright = mask * beam * detail * (1.0-rNorm);
  vec3  col    = blackbody(T_K) * bright * 1.55;
  col += vec3(1.0,0.95,0.88) * photon * 4.0 * mask;

  // Secondary image is dimmer (it's the lensed path — less flux)
  if(uSecondary > 0.5) col *= 0.28;

  float alpha = mask * clamp(bright*0.64 + photon*0.62, 0.0, 0.84);
  if(uSecondary > 0.5) alpha *= 0.55;

  gl_FragColor = vec4(col, alpha);
}
`

// ─── Component ───────────────────────────────────────────────────────────────
// Exposes worldPosition via ref so Experience can project it for the lensing Effect.

const BlackHole = forwardRef(function BlackHole({ mouse }, ref) {
  const { camera, size } = useThree()
  const { scene } = useGLTF('/models/black_hole.glb')
  const groupRef = useRef()
  const disk1    = useRef()
  const disk2    = useRef()
  const photonRing = useRef()
  const einsteinRing = useRef()
  const smoothX  = useRef(0)
  const smoothY  = useRef(0)
  const smoothP  = useRef(0)
  const worldPos = useRef(new THREE.Vector3())

  const diskUni  = useMemo(() => ({ uTime: { value: 0 }, uSecondary: { value: 0 } }), [])
  const secUni   = useMemo(() => ({ uTime: { value: 0 }, uSecondary: { value: 1 } }), [])
  const blackHoleModel = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse(child => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone()
        child.material.envMapIntensity = 1.35
        child.renderOrder = 3
      }
    })
    clone.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxAxis = Math.max(size.x, size.y, size.z, 0.001)
    clone.position.sub(center)
    return { object: clone, scale: 3.8 / maxAxis }
  }, [scene])

  // Expose the projected screen-space UV of the BH centre
  useImperativeHandle(ref, () => ({
    getScreenUV() {
      if (!groupRef.current) return new THREE.Vector2(0.5, 0.5)
      groupRef.current.getWorldPosition(worldPos.current)
      const ndc = worldPos.current.clone().project(camera)
      return new THREE.Vector2(ndc.x * 0.5 + 0.5, ndc.y * 0.5 + 0.5)
    },
  }))

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    diskUni.uTime.value = t
    secUni.uTime.value  = t

    smoothP.current += (scrollState.progress - smoothP.current) * Math.min(1, delta * 3)
    const mx = mouse?.current?.x ?? 0
    const my = mouse?.current?.y ?? 0
    smoothX.current += (mx - smoothX.current) * Math.min(1, delta * 4)
    smoothY.current += (my - smoothY.current) * Math.min(1, delta * 4)

    if (disk1.current) disk1.current.rotation.z =  t * 0.105
    if (disk2.current) disk2.current.rotation.z = -t * 0.068
    if (photonRing.current) photonRing.current.rotation.z = t * 0.18
    if (einsteinRing.current) einsteinRing.current.rotation.z = -t * 0.028

    if (groupRef.current) {
      groupRef.current.rotation.x = smoothY.current * 0.09
      groupRef.current.rotation.y = smoothX.current * 0.09
      groupRef.current.position.x = -smoothP.current * 3.0
      groupRef.current.position.y = -smoothP.current * 0.5
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={blackHoleModel.object} scale={blackHoleModel.scale} rotation={[0, -0.2, 0]} />

      {/* ── Event horizon ────────────────────────────────── */}
      <mesh renderOrder={2}>
        <sphereGeometry args={[0.96, 80, 80]} />
        <meshStandardMaterial
          color="#000000"
          roughness={1} metalness={0} envMapIntensity={0}
          colorWrite={true}
        />
      </mesh>

      {/* ── Primary accretion disk ────────────────────────── */}
      <mesh ref={photonRing} rotation={[Math.PI * 0.5, 0, 0]} renderOrder={4}>
        <torusGeometry args={[1.08, 0.018, 24, 240]} />
        <meshBasicMaterial
          color="#fff2cc"
          transparent
          opacity={0.54}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={einsteinRing} rotation={[Math.PI * 0.5, 0, 0]} renderOrder={0}>
        <torusGeometry args={[2.72, 0.012, 18, 260]} />
        <meshBasicMaterial
          color="#9edcff"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={disk1} rotation={[Math.PI * 0.042, 0, 0]} renderOrder={1}>
        <ringGeometry args={[1.18, 3.9, 240, 6]} />
        <shaderMaterial
          vertexShader={DISK_VERT}
          fragmentShader={DISK_FRAG}
          uniforms={diskUni}
          transparent
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={true}
        />
      </mesh>

      {/* ── Secondary (lensed back-disk arc) ─────────────── */}
      {/* This ring represents light from the back of the disk  */}
      {/* bent around the BH to appear as a slim arc above it. */}
      <mesh ref={disk2} rotation={[Math.PI * 0.5 - 0.042, 0, Math.PI]} renderOrder={1}>
        <ringGeometry args={[1.22, 2.5, 200, 4]} />
        <shaderMaterial
          vertexShader={DISK_VERT}
          fragmentShader={DISK_FRAG}
          uniforms={secUni}
          transparent
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={true}
        />
      </mesh>

      {/* ── Coronal plasma above/below BH ────────────────── */}
      <mesh renderOrder={0}>
        <sphereGeometry args={[1.06, 32, 32]} />
        <meshStandardMaterial
          color="#000000"
          emissive="#ff6600"
          emissiveIntensity={0.025}
          transparent opacity={0.045}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

    </group>
  )
})

export default BlackHole

useGLTF.preload('/models/black_hole.glb')
