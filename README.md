# Pardeep Singh Portfolio 2026

Personal portfolio for **Pardeep Singh**, built as a cinematic sci-fi interface for full-stack, ML automation, Web3, research, and real-time product work.

Live: [portfoliov32026.vercel.app](https://portfoliov32026.vercel.app)

## What This Is

This is not a flat resume page. The site is a Next.js portfolio wrapped in a real-time Three.js space scene:

- a black-hole hero environment with gravitational lensing, photon rings, jets, dust, bloom, and local GLB models
- a loading sequence that announces the local 3D payload instead of relying on external embeds
- a GTA-style game mode where the visitor walks through a neon portfolio city
- portfolio sections for work, projects, research, credentials, and contact

## Stack

| Layer | Tech |
|---|---|
| App | Next.js 16 App Router, React 19 |
| 3D | Three.js, React Three Fiber, Drei |
| Post FX | React Three Postprocessing, bloom, DOF, vignette, chromatic aberration |
| Motion | Framer Motion, GSAP |
| Scroll | Lenis, IntersectionObserver |
| Styling | CSS custom properties, Space Grotesk, Share Tech Mono |

## 3D Experience

The main canvas lives in `components/canvas/Experience.jsx`.

Key pieces:

- `BlackHole.jsx` loads `/models/black_hole.glb` and layers custom accretion-disk, photon-ring, Einstein-ring, and lensing effects around it.
- `Experience.jsx` loads `/models/interstellar__endurance.glb` and `/models/project_hail_mary_ship.glb` into the hero space scene.
- `LoadingScreen.jsx` shows the local GLB payload while the 3D assets load.
- `NebulaBackground.jsx`, `CosmicRing.jsx`, `QuantumHelix.jsx`, and `ScifiModels.jsx` provide the surrounding sci-fi atmosphere.

Local model assets:

```text
public/models/
  black_hole.glb
  interstellar__endurance.glb
  project_hail_mary_ship.glb
```

No Sketchfab iframe/embed is used in the current build.

## Game Mode

The app includes a full-screen game mode from the nav button.

Files:

```text
components/game/GameLoader.jsx
components/game/SpaceGame.jsx
components/game/GameHUD.jsx
```

Controls:

- `W/A/S/D` or arrow keys: move
- mouse: turn
- `Shift`: sprint
- `Esc`: release pointer lock / pause

The game mode is styled like a neon space-city: education, work, projects, research, skills, and contact appear as explorable portfolio districts.

## Sections

| Section | Purpose |
|---|---|
| Hero | Name, role, live video badge, counters, tech marquee |
| About | 4BaseCare internship and capability areas |
| Manifesto | Scroll-triggered philosophy statement |
| Projects | Product/research gallery |
| Credentials | IEEE papers, education, stack, hackathons |
| Reel | Video/media showcase |
| Contact | Email, LinkedIn, GitHub |
| Game Mode | Interactive portfolio city |

## Run Locally

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Build

```bash
npm run build
npm run start
```

## Notes

- The GLB files are large, so the loader intentionally stays visible long enough for the local payload state to read.
- The black-hole brightness is tuned lower than the surrounding VFX so the scene keeps detail without washing out the UI.
- If a model is replaced, keep the same path or update the corresponding `useGLTF` preload call.
