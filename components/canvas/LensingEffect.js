import { Effect } from 'postprocessing'
import { Uniform, Vector2 } from 'three'

// Screen-space Schwarzschild gravitational lensing.
// Bends background pixels toward the black hole position,
// masks the event horizon perfectly black, and adds a photon ring.

const FRAGMENT = /* glsl */`
uniform vec2  uCenter;   // BH projected position in UV (0..1)
uniform float uRadius;   // event horizon radius in UV units
uniform float uAspect;   // viewport width / height
uniform float uStrength; // lensing strength multiplier

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

  // ── aspect-correct distance from BH centre ──────────────────
  vec2  d  = uv - uCenter;
  d.x     *= uAspect;
  float r  = length(d);

  float r_s  = uRadius;          // Schwarzschild / event-horizon radius
  float r_ph = r_s * 1.50;       // photon sphere
  float r_E  = r_s * 2.60;       // Einstein ring (peak secondary brightness)

  // ── 1. Event horizon — perfectly black ──────────────────────
  if (r < r_s * 0.97) {
    outputColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  // ── 2. Lensing deflection ────────────────────────────────────
  // Approximate deflection angle: α ≈ 2*r_s² / r   (natural units)
  // Displacement in screen space: Δ = α * (r_s / r) * direction
  float alpha       = uStrength * r_s * r_s * 2.0 / (r * r + 0.0001);
  alpha             = min(alpha, 0.55);   // hard clamp to avoid black-hole wrap-around

  d.x /= uAspect;
  vec2  lensedUV    = uv - normalize(d) * alpha;
  lensedUV          = clamp(lensedUV, 0.001, 0.999);
  vec4  lensedColor = texture2D(inputBuffer, lensedUV);

  // ── 3. Magnification (gravitational focusing) ────────────────
  float mu = 1.0 + uStrength * r_s * r_s / (r * r * 1.5);
  mu = clamp(mu, 1.0, 4.5);

  // ── 4. Photon ring — thin bright ring at r_ph ───────────────
  float photonWidth = r_s * 0.09;
  float photon      = exp(-pow((r - r_ph) / photonWidth, 2.0));
  // photon ring is white-hot: very bright, nearly white with faint orange
  vec3  photonCol   = mix(vec3(1.0, 0.88, 0.72), vec3(1.0, 1.0, 1.0), photon) * photon * 3.2;

  // ── 5. Einstein ring glow (secondary image peak) ─────────────
  float einsteinW   = r_s * 0.22;
  float einstein    = exp(-pow((r - r_E) / einsteinW, 2.0)) * 0.35;
  vec3  einsteinCol = vec3(0.9, 0.85, 0.8) * einstein;

  // ── 6. Shadow edge darkening (coronal glow suppressed) ───────
  float shadowEdge  = smoothstep(r_s, r_s * 1.3, r);

  // ── Assemble ─────────────────────────────────────────────────
  outputColor.rgb  = lensedColor.rgb * mu * shadowEdge;
  outputColor.rgb += photonCol + einsteinCol;
  outputColor.a    = 1.0;
}
`

export class GravitationalLensEffect extends Effect {
  constructor({ strength = 1.1 } = {}) {
    super('GravitationalLensEffect', FRAGMENT, {
      uniforms: new Map([
        ['uCenter',   new Uniform(new Vector2(0.5, 0.5))],
        ['uRadius',   new Uniform(0.075)],
        ['uAspect',   new Uniform(16 / 9)],
        ['uStrength', new Uniform(strength)],
      ]),
    })
  }

  /** Called by the EffectComposer every frame */
  update(_renderer, _inputBuffer, _deltaTime) {}
}
