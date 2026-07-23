import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import gsap from "gsap";

import useAR from "../ar/useAR";

// 🔹 UI-only AR HUD (no camera/scripts inside)
// (Use the updated ARGestureControl I gave you)
const ARHUD = React.lazy(() => import("../components/ARGestureControl"));

export default function PardeepInterstellar() {
  const cardRef = useRef(null);
  const railRef = useRef(null);

  // ✅ only ONE video (top-right HUD)
  const miniVidTopRef = useRef(null);

  // ✅ Global AR data from backend WS
  const { pinch, swipe, confidence } = useAR();

  const [arEnabled, setArEnabled] = useState(true);

  const slides = useMemo(
    () => [
      {
        key: "experience",
        title: "EXPERIENCE",
        subtitle: "VECTRA International • 4BaseCare",
        body: [
          "VECTRA International BV — Zoho Systems Intern (Jun 2026 – Present), Remote (Brussels, Belgium). Building custom Zoho modules, Deluge scripts, and cross-app integrations to automate internal operations, reporting, and process workflows across the Zoho suite.",
          "4BaseCare Precision Health Pvt. Ltd. — Data Science Intern (Feb 2026 – Present), Remote (Bengaluru). Automated ML pipelines for cancer analysis: MSI on colorectal & endometrial and HER2/ER/PR on breast-cancer H&E whole-slide images; plus EHR / clinical-document OCR with structured field extraction.",
          "Vector-DB clinical AI for report extraction, summarization, and clinical suggestions — integrating Guardrails, A2A/MCP, and GCP.",
        ],
      },
      {
        key: "education",
        title: "EDUCATION",
        subtitle: "Chandigarh University • IGNOU",
        body: [
          "Chandigarh University — B.E. Computer Science & Engineering (Sep 2022 – Jun 2026) • CGPA: 7.7/10. Final-year patent (filed) — Evolet: Patient First, a patient-sovereign digital twin with hardware-attested federated learning & ZK consent. Certifications: AI Agents for Beginners (Microsoft), Fundamentals of Deep Learning for CV (NVIDIA).",
          "IGNOU — B.Sc General, Distance Mode (Jul 2022 – Jun 2026) • CGPA: 6.3/10. Exposure: Biology, Microbiology, Physics, Chemistry, Bioinformatics. Completed Genomic Data Science & Cancer Biology Specializations (Johns Hopkins University, Coursera).",
        ],
      },
      {
        key: "projects",
        title: "PROJECTS",
        subtitle: "eraya • Nemesis • MedGenie 3.0",
        body: [
          "eraya (Jun 2026) — Self-Healing Agentic Swarm Framework. Multi-agent swarm where agents autonomously detect failures and self-recover without central control, via fault-tolerant orchestration, task re-allocation, and resilient messaging. Live dashboard for real-time swarm health, telemetry, and automatic recovery.",
          "Nemesis — ML DeFi Agent (Mar 2026) — Implementation of IEEE DELCON 2025 research on AI Agents in Web3. LLM-powered system converting natural language to on-chain transactions, with payment gating, validation, and privacy-preserving execution on Monad Testnet.",
          "MedGenie 3.0 (Nov 2025) — Finalist, IDEA-ONE National One-Health Hackathon by Govt of India. Full-stack One Health platform: React, Tailwind, Django REST, JWT. AI-assisted report interaction, dashboards, and real-time telemedicine using WebRTC.",
        ],
      },
      {
        key: "skills",
        title: "SKILLS",
        subtitle: "Full-Stack • AI/ML • Clinical AI • Web3",
        body: [
          "Programming: Python, SQL, JavaScript, Kotlin, Go, C++ • Frameworks: Django, Flask, FastAPI, React, Next.js, Node.js, GraphQL",
          "Clinical AI: Slideflow, H-Optimus, DINOv2, Macenko, SNOMED-CT • Data & ML: PyTorch, XGBoost, OpenCV, timm, PySpark, Polars",
          "LLM & Agents: LangGraph, n8n, Ollama, Zoho, Claude Code, Codex • Web3: Solidity, Web3.py, IPFS, MetaMask, QuickNode, Dune, Truffle",
          "Tools: Docker, Kubernetes, AWS, GCP, Git, Power BI, Obsidian, Unreal Engine",
        ],
      },
      {
        key: "research",
        title: "RESEARCH",
        subtitle: "5 IEEE Publications",
        body: [
          "Machine Learning Approaches in DNA Analysis — IEEE ICWITE 2025",
          "Adaptive Local LLM Compression under Dynamic Edge Constraints — IEEE ICPC2T 2026",
          "Large Language Models in Multilingual and Low-Resource Language Contexts — IEEE PuneCon 2025",
          "Wavelet-Based Terrain Generation: Optimizing Ray Tracing Performance in AAA Games — IEEE DELCON 2025",
          "Epigenetic Modifications in MC1R, SLC24A5, and FOXL2 Genes for Phenotypic Trait Engineering — IEEE DELCON 2025",
        ],
      },
      {
        key: "hackathons",
        title: "HACKATHONS",
        subtitle: "Activities & Competitions",
        body: [
          "AMTZ MedTech Hackathon 2026 (Visakhapatnam, Apr 2026) • Monad Blitz New Delhi (Mar 2026) — Web3 showcase",
          "IDEA-ONE One-Health Hackathon 2025 — National Finalist (Bharat Mandapam)",
          "TrackShift (Plaksha) • Byteverse 1.0 (CT University) • Innovate-a-thon 3.0 (BIT Mesra) • SAP Hackfest • IIIT Delhi E-Summit 2025",
          "Bootcamps: AI Builders Bootcamp (Plaksha, Jan 2026) • IIT Guwahati Summer Analytica 2026",
        ],
      },
    ],
    []
  );

  const [idx, setIdx] = useState(0);

  const go = (nextIdx) => {
    setIdx((prev) => (nextIdx + slides.length) % slides.length);
  };

  const goBy = (delta) => {
    setIdx((prev) => (prev + delta + slides.length) % slides.length);
  };

  const strongHand = confidence >= 0.55;

  // ---- GSAP slide enter + idle float
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    gsap.killTweensOf(card);

    gsap.fromTo(
      card,
      { opacity: 0, x: 130, y: 35, rotateY: -38, rotateZ: -12, transformOrigin: "0% 50%" },
      { opacity: 1, x: 0, y: 0, rotateY: 0, rotateZ: 0, duration: 0.7, ease: "power3.out" }
    );

    gsap.to(card, {
      y: -10,
      duration: 2.8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    return () => gsap.killTweensOf(card);
  }, [idx]);

  // ---- Mouse wheel slide
  useEffect(() => {
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) < 20) return;
      if (e.deltaY > 0) goBy(1);
      else goBy(-1);
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  // ---- Keyboard slide
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") goBy(1);
      if (e.key === "ArrowLeft") goBy(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ---- Swipe slide (mouse + touch)
  const swipeLocal = useRef({ x: 0, y: 0, down: false });
  const onPointerDown = (e) => (swipeLocal.current = { x: e.clientX, y: e.clientY, down: true });
  const onPointerUp = (e) => {
    if (!swipeLocal.current.down) return;
    swipeLocal.current.down = false;
    const dx = e.clientX - swipeLocal.current.x;
    const dy = e.clientY - swipeLocal.current.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) goBy(1);
    else goBy(-1);
  };
  const onTouchStart = (e) => {
    const t = e.touches?.[0];
    if (!t) return;
    swipeLocal.current = { x: t.clientX, y: t.clientY, down: true };
  };
  const onTouchEnd = (e) => {
    if (!swipeLocal.current.down) return;
    swipeLocal.current.down = false;
    const t = e.changedTouches?.[0];
    if (!t) return;
    const dx = t.clientX - swipeLocal.current.x;
    const dy = t.clientY - swipeLocal.current.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) goBy(1);
    else goBy(-1);
  };

  // ✅ HUD Parallax Roam (left rail)
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    gsap.set(rail, { transformPerspective: 900, transformOrigin: "50% 50%" });

    const onMove = (ev) => {
      const r = rail.getBoundingClientRect();
      const mx = ev.clientX ?? (ev.touches?.[0]?.clientX || r.left + r.width / 2);
      const my = ev.clientY ?? (ev.touches?.[0]?.clientY || r.top + r.height / 2);

      const px = (mx - (r.left + r.width / 2)) / (r.width / 2);
      const py = (my - (r.top + r.height / 2)) / (r.height / 2);

      const cx = Math.max(-1, Math.min(1, px));
      const cy = Math.max(-1, Math.min(1, py));

      gsap.to(rail, {
        rotateY: cx * 7,
        rotateX: -cy * 6,
        x: cx * 10,
        y: cy * 8,
        duration: 0.35,
        ease: "power3.out",
      });
    };

    const reset = () => {
      gsap.to(rail, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.6, ease: "power3.out" });
    };

    const drift = gsap.to(rail, {
      y: "-=6",
      duration: 2.8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    rail.addEventListener("mouseleave", reset);

    return () => {
      drift.kill();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      rail.removeEventListener("mouseleave", reset);
    };
  }, []);

  // ✅ play-once then pause; hover/tap replays (ONE video only)
  useEffect(() => {
    const v = miniVidTopRef.current;
    if (!v) return;

    let cancelled = false;

    const tryPlay = async () => {
      try {
        v.muted = true;
        v.playsInline = true;
        v.currentTime = 0;
        await v.play();
      } catch {
        // autoplay might be blocked; user hover/tap will play later
      }
    };

    const onEnded = () => {
      if (cancelled) return;
      v.pause();
    };

    v.addEventListener("ended", onEnded);
    tryPlay();

    return () => {
      cancelled = true;
      v.removeEventListener("ended", onEnded);
    };
  }, []);

  const replayVideo = (ref) => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  };

  // ✅ AR: Pinch rising-edge => Next slide
  const prevPinchRef = useRef(false);
  useEffect(() => {
    if (!arEnabled) {
      prevPinchRef.current = pinch;
      return;
    }
    if (!strongHand) {
      prevPinchRef.current = pinch;
      return;
    }

    const prev = prevPinchRef.current;
    const rising = !prev && pinch;

    if (rising) goBy(1);

    prevPinchRef.current = pinch;
  }, [pinch, arEnabled, strongHand]);

  // ✅ AR: Swipe event => Next / Prev (cooldown)
  const lastSwipeRef = useRef(0);
  useEffect(() => {
    if (!arEnabled) return;
    if (!strongHand) return;
    if (!swipe) return;

    const now = Date.now();
    if (now - lastSwipeRef.current < 420) return;
    lastSwipeRef.current = now;

    if (swipe === "left" || swipe === "down") goBy(1);
    if (swipe === "right" || swipe === "up") goBy(-1);
  }, [swipe, arEnabled, strongHand]);

  const s = slides[idx];

  return (
    <div
      className="is-page"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* 🔘 AR TOGGLE — BOTTOM CENTER */}
      <button
        className={`ar-toggle ${arEnabled ? "on" : ""}`}
        onClick={() => setArEnabled((v) => !v)}
        aria-label="Toggle AR gestures"
      >
        {arEnabled ? "🖐 AR ON" : "📴 AR OFF"}
      </button>

      {/* 🧠 AR HUD (UI only) */}
      {arEnabled && (
        <Suspense fallback={null}>
          <ARHUD active={true} />
        </Suspense>
      )}

      {/* 🌌 Background GIF */}
      <div className="wormhole-bg" aria-hidden="true" />

      <header className="is-top">
        <div className="is-title">PARDEEP SINGH • FULL STACK DEVELOPER • ML AUTOMATION</div>

        {/* HUD video (aesthetic only) */}
        <div
          className="mini-vid-wrap"
          onMouseEnter={() => replayVideo(miniVidTopRef)}
          onTouchStart={() => replayVideo(miniVidTopRef)}
          title="Hover / tap to replay"
        >
          <video
            ref={miniVidTopRef}
            className="mini-vid"
            src="/vidpardeep.mp4"
            muted
            playsInline
            preload="auto"
          />
          <div className="mini-vid-glass" />
        </div>
      </header>

      <div className="is-layout">
        {/* LEFT rail */}
        <aside ref={railRef} className="rail">
          <div className="profile">
            <div className="avatar">
              <img
                src="/pardeep.jpg"
                alt="Pardeep"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement?.classList.add("fallback");
                }}
              />
              <span className="initials">PS</span>
            </div>

            <div className="pmeta">
              <div className="pname">Pardeep Singh</div>
              <div className="prole">Full Stack • AI • Automation</div>
            </div>
          </div>

          <div className="thumbs">
            {slides.map((x, i) => (
              <button
                key={x.key}
                className={`thumb ${i === idx ? "active" : ""}`}
                onClick={() => go(i)}
                aria-label={x.title}
              >
                <div className="thumbTop">
                  <span className="thumbDot" />
                  <span className="thumbTitle">{x.title}</span>
                </div>
                <div className="thumbSub">{x.subtitle}</div>
              </button>
            ))}
          </div>

          <div className="railHint">
            Tip: <b>pinch</b> to go <b>Next</b> • swipe in air for <b>Prev/Next</b>
          </div>
        </aside>

        {/* RIGHT slide card */}
        <main className="is-right">
          <div ref={cardRef} className="card">
            <div className="card-head">
              <div className="chip">
                SECTION {idx + 1}/{slides.length}
              </div>
              <h1>{s.title}</h1>
              <p className="subtitle">{s.subtitle}</p>
            </div>

            <div className="card-body">
              {s.body.map((t, i) => (
                <div key={i} className="bullet">
                  <span className="b-dot" />
                  <p>{t}</p>
                </div>
              ))}
            </div>

            <div className="card-actions">
              <button className="btn" onClick={() => goBy(-1)}>
                ← Prev
              </button>
              <button className="btn primary" onClick={() => goBy(1)}>
                Next →
              </button>
            </div>
          </div>
        </main>
      </div>

      <style>{css}</style>
    </div>
  );
}

const css = `
.is-page{
  min-height:100vh;
  color:#fff;
  position:relative;
  overflow:hidden;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto;
  background:#06040b;
  user-select:none;
}

/* ✅ AR Toggle */
.ar-toggle{
  position:fixed;
  left:50%;
  bottom:18px;
  transform:translateX(-50%);
  z-index:999999;
  padding:10px 14px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
  color:#fff;
  font-weight:1000;
  letter-spacing:.06em;
  cursor:pointer;
  backdrop-filter: blur(10px);
}
.ar-toggle.on{
  background: linear-gradient(135deg, rgba(124,58,237,.75), rgba(59,130,246,.55));
  border-color: rgba(167,139,250,.35);
  box-shadow: 0 18px 70px rgba(124,58,237,.22);
}

/* Background GIF */
.wormhole-bg{
  position:fixed;
  inset:0;
  z-index:0;
  background-image: url("/wormhole.gif");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transform: scale(1.06);
  filter: saturate(1.18) contrast(1.12) brightness(0.55);
}
.wormhole-bg::after{
  content:"";
  position:absolute;
  inset:0;
  background:
    radial-gradient(1200px 900px at 35% 35%, rgba(124,58,237,0.20), transparent 55%),
    radial-gradient(900px 700px at 70% 55%, rgba(59,130,246,0.14), transparent 60%),
    linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.82));
}

/* Top bar */
.is-top{
  position:relative;
  z-index:2;
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
  padding:18px 26px;
}
.is-title{font-weight:900; letter-spacing:.12em; font-size:14px; opacity:.92;}

/* ✅ SINGLE top-right HUD video */
.mini-vid-wrap{
  position: relative;
  width: 320px;
  height: 140px;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.10);
  box-shadow: 0 22px 110px rgba(0,0,0,.55);
  cursor: pointer;
  opacity: 1;
  backdrop-filter: blur(10px);
}

.mini-vid{
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.08);
  filter: blur(2.2px) saturate(1.25) contrast(1.15) brightness(.95);
}

.mini-vid-glass{
  position:absolute;
  inset:0;
  background:
    radial-gradient(220px 120px at 30% 30%, rgba(124,58,237,.18), transparent 55%),
    radial-gradient(220px 120px at 70% 70%, rgba(59,130,246,.12), transparent 60%),
    linear-gradient(to bottom, rgba(0,0,0,.10), rgba(0,0,0,.25));
  pointer-events:none;
}

.mini-vid-wrap:hover{ opacity: 1; }

@media (max-width: 700px){
  .mini-vid-wrap{ display:none; }
}

/* Layout */
.is-layout{
  position:relative;
  z-index:2;
  display:grid;
  grid-template-columns: 320px 1fr;
  gap: 22px;
  padding: 8px 26px 32px;
  align-items:start;
}
@media (max-width: 980px){
  .is-layout{grid-template-columns:1fr; gap:14px;}
  .rail{order:2}
}

/* Left roaming rail */
.rail{
  border-radius:22px;
  border:1px solid rgba(255,255,255,.12);
  background: rgba(10,6,18,.45);
  backdrop-filter: blur(12px);
  box-shadow: 0 24px 90px rgba(0,0,0,.45);
  padding: 14px;
  max-height: calc(100vh - 120px);
  overflow:auto;
  will-change: transform;
}
.homeBtn{
  display:inline-flex;
  align-items:center;
  gap:8px;
  padding:10px 12px;
  border-radius:14px;
  border:1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
  color:#fff;
  font-weight:900;
  cursor:pointer;
}
.homeBtn:hover{ background: rgba(255,255,255,.10); }

.profile{
  display:flex;
  gap:12px;
  align-items:center;
  margin-top:14px;
  padding:12px;
  border-radius:18px;
  border:1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.05);
}
.avatar{
  width:54px;
  height:54px;
  border-radius:999px;
  overflow:hidden;
  position:relative;
  border:1px solid rgba(255,255,255,.18);
  box-shadow: 0 0 22px rgba(124,58,237,.30);
  background: radial-gradient(circle at 30% 30%, rgba(124,58,237,.55), rgba(59,130,246,.28));
}
.avatar img{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
}
.avatar .initials{
  position:absolute;
  inset:0;
  display:grid;
  place-items:center;
  font-weight:1000;
  letter-spacing:.08em;
  opacity:.92;
}
.avatar:not(.fallback) .initials{ display:none; }

.pname{ font-weight:1000; letter-spacing:.02em; }
.prole{ opacity:.72; font-size:12px; margin-top:2px; }

.thumbs{
  display:flex;
  flex-direction:column;
  gap:10px;
  margin-top:12px;
}

.thumb{
  text-align:left;
  padding:12px;
  border-radius:18px;
  border:1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.06);
  cursor:pointer;
  color: rgba(255,255,255,.92);
}
.thumb:hover{
  background: rgba(255,255,255,.10);
}
.thumb.active{
  border-color: rgba(167,139,250,.55);
  background: rgba(124,58,237,.18);
  box-shadow:
    0 0 0 1px rgba(124,58,237,.14),
    0 14px 60px rgba(124,58,237,.14);
  color: #fff;
}
.thumbTop{
  display:flex;
  align-items:center;
  gap:10px;
}
.thumbDot{
  width:10px;
  height:10px;
  border-radius:999px;
  background: rgba(167,139,250,.95);
  box-shadow: 0 0 14px rgba(124,58,237,.65);
  flex:0 0 10px;
}
.thumbTitle{
  font-weight:1000;
  letter-spacing:.08em;
  font-size:12px;
  color: rgba(255,255,255,.96);
}
.thumbSub{
  font-size:12px;
  margin-top:6px;
  line-height:1.35;
  color: rgba(255,255,255,.78);
  opacity: 1;
}
.thumb.active .thumbSub{
  color: rgba(255,255,255,.86);
}

.railHint{
  margin-top:12px;
  padding:10px 12px;
  border-radius:16px;
  border:1px dashed rgba(255,255,255,.18);
  background: rgba(255,255,255,.04);
  opacity:.78;
  font-size:12px;
}

/* Right card */
.is-right{display:flex; justify-content:center;}
.card{
  width:min(900px, 100%);
  border-radius:24px;
  border:1px solid rgba(255,255,255,.12);
  background: rgba(10,6,18,.55);
  box-shadow: 0 30px 120px rgba(0,0,0,.55);
  backdrop-filter: blur(12px);
  padding: 22px;
}
.card-head h1{
  margin:10px 0 2px;
  font-size:44px;
  letter-spacing:.02em;
  line-height:1.02;
}
.subtitle{opacity:.75; margin:0; font-size:14px;}
.chip{
  display:inline-flex; padding:6px 10px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
  font-weight:1000; font-size:12px; letter-spacing:.08em;
}
.card-body{margin-top:18px; display:flex; flex-direction:column; gap:12px;}
.bullet{display:flex; gap:10px; align-items:flex-start;}
.b-dot{
  width:10px; height:10px; border-radius:999px; margin-top:6px;
  background: rgba(167,139,250,.9);
  box-shadow: 0 0 14px rgba(124,58,237,.6);
  flex:0 0 10px;
}
.bullet p{margin:0; opacity:.92; line-height:1.55; font-size:15px;}

.card-actions{
  display:flex; justify-content:space-between; gap:12px;
  margin-top:18px;
}
.btn{
  padding:10px 14px; border-radius:14px;
  border:1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
  color:#fff; cursor:pointer; font-weight:1000;
}
.btn.primary{
  background: linear-gradient(135deg, rgba(124,58,237,.85), rgba(59,130,246,.65));
  border-color: rgba(167,139,250,.35);
  box-shadow: 0 16px 60px rgba(124,58,237,.25);
}
`;
