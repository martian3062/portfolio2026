# Pardeep Singh — Portfolio 2026

Personal portfolio for **Pardeep Singh** — Full-Stack Developer & ML Automation Engineer.

Live: [portfoliov32026.vercel.app](https://portfoliov32026.vercel.app)

## Stack

- **Framework** — Next.js 16 (App Router)
- **3D / WebGL** — Three.js, React Three Fiber, GLSL fluid shader background
- **Animation** — Framer Motion (horizontal drag gallery, 3D card tilt), GSAP
- **Scroll** — Lenis smooth scroll, IntersectionObserver scroll reveals
- **Styling** — CSS custom properties, Space Grotesk + Share Tech Mono

## Sections

| Section | Description |
|---|---|
| Hero | Animated counting stats, tech marquee strip, live video badge |
| About | 4BaseCare internship, capabilities |
| Manifesto | Full-screen philosophy statement with scroll-triggered text reveal |
| Projects | Horizontal drag gallery — MedGenie 3.0, ML DeFi Agent, 4BaseCare, Research |
| Credentials | 5 IEEE papers, education, full stack, hackathons |
| Contact | Email, LinkedIn, GitHub |

## Run locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Build

```bash
npm run build
npm run start
```

## Key features

- Fluid GLSL background shader (FBM noise, mouse-reactive warp) replacing static 3D scene
- Horizontal drag-scroll project cards with per-card 3D perspective tilt on hover
- Scroll-triggered manifesto text animation (lines slide up on viewport entry)
- Animated stat counters (cubic-ease count-up on scroll into view)
- Infinite marquee tech strip
- Game mode (space exploration mini-game)
