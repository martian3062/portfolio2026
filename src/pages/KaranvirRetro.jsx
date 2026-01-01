// src/pages/KaranvirBook.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";

function safeImg(src) {
  return src || "";
}
function isVideo(src) {
  return /\.(mp4|webm|ogg)$/i.test(src || "");
}

/**
 * ✅ PolaroidMedia
 * - If mp4/webm/ogg: plays ONCE on mount, then pauses at end
 * - Hover (mouse) or touch => restart from 0 and play
 * - If image/gif: normal <img>
 * - On error: shows PHOTO fallback
 */
function PolaroidMedia({ src, note }) {
  const vidRef = useRef(null);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    if (!isVideo(src)) return;
    const v = vidRef.current;
    if (!v) return;

    let cancelled = false;

    const playOnce = async () => {
      try {
        v.muted = true;
        v.playsInline = true;
        v.currentTime = 0;
        await v.play();
      } catch {
        // autoplay might be blocked; hover/tap will trigger
      }
    };

    const onEnded = () => {
      if (cancelled) return;
      v.pause();
    };

    v.addEventListener("ended", onEnded);
    playOnce();

    return () => {
      cancelled = true;
      v.removeEventListener("ended", onEnded);
    };
  }, [src]);

  const replay = () => {
    if (!isVideo(src)) return;
    const v = vidRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  };

  if (!src || broken) {
    return (
      <div className="kb-photoFallback">
        PHOTO
        <div style={{ fontSize: 10, opacity: 0.6, marginTop: 6 }}>
          {note || ""}
        </div>
      </div>
    );
  }

  if (isVideo(src)) {
    return (
      <div
        className="kb-mediaWrap"
        onMouseEnter={replay}
        onTouchStart={replay}
        title="Hover / tap to replay"
      >
        <video
          ref={vidRef}
          className="kb-media"
          src={src}
          muted
          playsInline
          preload="auto"
          onError={() => setBroken(true)}
        />
        <div className="kb-mediaGlass" />
        <div className="kb-mediaHint">HOVER / TAP</div>
      </div>
    );
  }

  return (
    <>
      <img
        src={safeImg(src)}
        alt={note || "polaroid"}
        onError={() => setBroken(true)}
      />
      <div className="kb-photoFallback">PHOTO</div>
    </>
  );
}

export default function KaranvirBook() {
  const nav = useNavigate();

  const bookRef = useRef(null);
  const flipRef = useRef(null);

  const [idx, setIdx] = useState(0);
  const [nextIdx, setNextIdx] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  const sections = useMemo(
    () => [
      {
        key: "summary",
        label: "Summary",
        left: {
          title: "POLAROID • RESUME",
          caption: "Snapshot",
          images: [
            // ✅ Put this file in: /public/introkaran.mp4
            { src: "/introkaran.mp4", note: "Intro reel (hover to replay)" },

            // ✅ Put this file in: /public/karanvir_resume.png
            
          ],
        },
        right: {
          title: "KARANVIR SINGH",
          subtitle: "DATA ENGINEER",
          blocks: [
            {
              h: "SUMMARY",
              p: [
                "Outcome-driven Data Engineer with strong CS fundamentals who builds reliable, scalable data platforms.",
                "Architects batch + streaming pipelines, models data for analytics/ML, and enforces quality with tests, lineage, and observability.",
                "Skilled in Python and SQL; experienced with Spark, orchestration/ELT, and containerized deployments.",
              ],
            },
          ],
        },
      },
      {
        key: "education",
        label: "Education",
        left: {
          title: "POLAROID • CAMPUS",
          caption: "Learning",
          images: [
            { src: "/educu.mp4", note: "University" },
            { src: "/retro/edu2.jpg", note: "Notes" },
          ],
        },
        right: {
          title: "EDUCATION",
          subtitle: "Academic timeline",
          blocks: [
            {
              h: "CHANDIGARH UNIVERSITY",
              p: [
                "Bachelor of Engineering — Computer Science & Engineering (Sep 2022 – Jun 2026)",
                "CGPA: 8.3/10 • Focus: GenAI, automation, ML algorithms, data pipelines",
              ],
            },
            {
              h: "SCHOOLING",
              p: ["12th (Non-Medical): 84.6% • 10th: 89.6%"],
            },
          ],
        },
      },
      {
        key: "projects",
        label: "Projects",
        left: {
          title: "POLAROID • BUILDS",
          caption: "Ship logs",
          images: [
            { src: "/retro/proj1.jpg", note: "Dashboards" },
            { src: "/retro/proj2.jpg", note: "Deployments" },
          ],
        },
        right: {
          title: "PROJECTS",
          subtitle: "Products shipped",
          blocks: [
            {
              h: "Gen3 — AI DeFi Agent",
              p: [
                "Full-stack Web3 app (Next.js 14 + Django REST) with secure wallet onboarding (MetaMask/Coinbase/WalletConnect).",
                "QuickNode pre-tx simulation and real-time WebSocket dashboards.",
              ],
            },
            {
              h: "MedGenie — ML assistant agent",
              p: [
                "Offline-first integrated health platform; voice + IVR triage, automations, resilient reporting.",
                "Added forecasting modules and workflow reliability for low-network zones.",
              ],
            },
          ],
        },
      },
      {
        key: "research",
        label: "Research",
        left: {
          title: "POLAROID • PAPERS",
          caption: "Drafts",
          images: [
            { src: "/retro/research1.jpg", note: "Conference notes" },
            { src: "/retro/research2.jpg", note: "Reading" },
          ],
        },
        right: {
          title: "RESEARCH",
          subtitle: "Conference tracks",
          blocks: [
            {
              h: "PAPERS",
              p: [
                "TinyML & Embedded Systems in IoT — ITIDS 2024",
                "Machine Learning Approaches in DNA Analysis — IEEE ICWITE 2025",
                "Wavelet-Based Terrain Generation — IEEE DELCON 2025",
                "Architecture of AI Agents in Web3 — IEEE DELCON 2025",
              ],
            },
          ],
        },
      },
      {
        key: "skills",
        label: "Skills",
        left: {
          title: "POLAROID • STACK",
          caption: "Tools",
          images: [
            { src: "/retro/skills1.jpg", note: "Python/SQL" },
            { src: "/retro/skills2.jpg", note: "Spark/ETL" },
          ],
        },
        right: {
          title: "SKILLS",
          subtitle: "What he uses daily",
          blocks: [
            {
              h: "CORE",
              p: [
                "Python • SQL • Spark • ETL/ELT • Data modeling",
                "Docker/Kubernetes • GitOps • Tests + observability",
                "Documentation • systems thinking • rapid prototyping",
              ],
            },
          ],
        },
      },
    ],
    []
  );

  const current = sections[idx];
  const upcoming = sections[nextIdx];

  const flipTo = (toIdx) => {
    if (isFlipping) return;
    if (toIdx === idx) return;

    setNextIdx(toIdx);
    setIsFlipping(true);

    const flip = flipRef.current;
    if (!flip) {
      setIdx(toIdx);
      setIsFlipping(false);
      return;
    }

    gsap.set(flip, {
      transformOrigin: "0% 50%",
      rotateY: 0,
      opacity: 1,
    });

    gsap
      .timeline({
        onComplete: () => {
          setIdx(toIdx);
          gsap.set(flip, { opacity: 0, rotateY: 0 });
          setIsFlipping(false);
        },
      })
      .to(flip, { rotateY: -180, duration: 0.7, ease: "power2.inOut" });
  };

  useEffect(() => {
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) < 20) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      const to = (idx + dir + sections.length) % sections.length;
      flipTo(to);
    };
    const onKey = (e) => {
      if (e.key === "ArrowRight") flipTo((idx + 1) % sections.length);
      if (e.key === "ArrowLeft")
        flipTo((idx - 1 + sections.length) % sections.length);
      if (e.key === "Escape") nav("/");
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, sections.length]);

  return (
    <div className="kb-page">
      <div className="kb-bg" style={{ backgroundImage: `url(/karanvir_resume.png)` }} />

      <header className="kb-top">
        <button className="kb-back" onClick={() => nav("/")}>
          ← Home
        </button>
        <div className="kb-brand">
          <div className="kb-title">KARANVIR • BOOK</div>
          <div className="kb-sub">Arrow keys / scroll = flip page</div>
        </div>
        <div className="kb-chip">{current.label}</div>
      </header>

      <div ref={bookRef} className="kb-book">
        {/* LEFT */}
        <section className="kb-pageLeft">
          <div className="kb-leftHead">
            <div className="kb-leftTitle">{current.left.title}</div>
            <div className="kb-leftCap">{current.left.caption}</div>
          </div>

          <div className="kb-polaroids">
            {current.left.images.map((img, i) => (
              <div
                key={i}
                className={`kb-polaroid ${i % 2 ? "tiltR" : "tiltL"}`}
              >
                <div className="kb-photo">
                  <PolaroidMedia src={img.src} note={img.note} />
                </div>
                <div className="kb-note">{img.note}</div>
              </div>
            ))}
          </div>

          <div className="kb-toc">
            {sections.map((s, i) => (
              <button
                key={s.key}
                className={`kb-tocItem ${i === idx ? "active" : ""}`}
                onClick={() => flipTo(i)}
                disabled={isFlipping}
              >
                <span className="dot" />
                {s.label}
              </button>
            ))}
          </div>
        </section>

        {/* SPINE */}
        <div className="kb-spine" aria-hidden="true" />

        {/* RIGHT */}
        <section className="kb-pageRight">
          <div className="kb-rTitle">{current.right.title}</div>
          <div className="kb-rSub">{current.right.subtitle}</div>
          <div className="kb-rule" />

          <div className="kb-content">
            {current.right.blocks.map((b, i) => (
              <div key={i} className="kb-block">
                <div className="kb-h">{b.h}</div>
                <ul className="kb-ul">
                  {b.p.map((t, j) => (
                    <li key={j}>{t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="kb-actions">
            <button
              className="kb-btn"
              onClick={() =>
                flipTo((idx - 1 + sections.length) % sections.length)
              }
              disabled={isFlipping}
            >
              ← Prev
            </button>
            <button
              className="kb-btn primary"
              onClick={() => flipTo((idx + 1) % sections.length)}
              disabled={isFlipping}
            >
              Next →
            </button>
          </div>
        </section>

        {/* FLIP OVERLAY */}
        <div ref={flipRef} className="kb-flipSheet" aria-hidden="true">
          <div className="kb-flipFront">
            <div className="kb-rTitle">{current.right.title}</div>
            <div className="kb-rSub">{current.right.subtitle}</div>
            <div className="kb-rule" />
          </div>

          <div className="kb-flipBack">
            <div className="kb-rTitle">{upcoming?.right?.title}</div>
            <div className="kb-rSub">{upcoming?.right?.subtitle}</div>
            <div className="kb-rule" />
          </div>
        </div>
      </div>

      <style>{css}</style>
    </div>
  );
}

const css = `
.kb-page{
  min-height:100vh;
  background:#120b06;
  position:relative;
  overflow:hidden;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto;
}

/* resume background */
.kb-bg{
  position:fixed;
  inset:0;
  z-index:0;
  background-size: cover;
  background-position: center;
  filter: sepia(0.85) contrast(1.1) brightness(0.38) blur(1.2px);
  opacity: 0.26;
  transform: scale(1.06);
}
.kb-bg::after{
  content:"";
  position:absolute;
  inset:0;
  background:
    radial-gradient(1200px 900px at 30% 35%, rgba(255,235,205,0.12), transparent 55%),
    radial-gradient(900px 700px at 70% 55%, rgba(190,120,60,0.10), transparent 60%),
    linear-gradient(to bottom, rgba(18,11,6,0.74), rgba(10,6,3,0.88));
}

/* top bar */
.kb-top{
  position:relative;
  z-index:2;
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:12px;
  padding: 18px 22px;
}
.kb-back{
  border-radius:14px;
  padding:10px 12px;
  border:1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
  color: rgba(255,255,255,.92);
  font-weight:900;
  cursor:pointer;
  backdrop-filter: blur(10px);
}
.kb-brand{ color: rgba(255,255,255,.92); }
.kb-title{ font-weight:1000; letter-spacing:.14em; font-size:12px; opacity:.92; }
.kb-sub{ opacity:.70; font-size:12px; margin-top:4px; }
.kb-chip{
  display:inline-flex;
  padding:8px 10px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
  color:#fff;
  font-weight:1000;
  letter-spacing:.10em;
  font-size:11px;
}

/* BOOK */
.kb-book{
  position:relative;
  z-index:2;
  width: min(1100px, calc(100% - 44px));
  margin: 10px auto 26px;
  height: min(720px, calc(100vh - 140px));
  border-radius: 26px;
  display:grid;
  grid-template-columns: 1fr 18px 1fr;
  box-shadow: 0 30px 140px rgba(0,0,0,.65);
}

.kb-pageLeft, .kb-pageRight{
  background: #f3e6c9;
  border: 1px solid rgba(70,40,20,.22);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.65);
  padding: 22px;
  overflow:auto;
}
.kb-pageLeft{
  border-top-left-radius: 26px;
  border-bottom-left-radius: 26px;
}
.kb-pageRight{
  border-top-right-radius: 26px;
  border-bottom-right-radius: 26px;
}

.kb-spine{
  background: linear-gradient(to bottom, rgba(40,22,10,.72), rgba(20,10,5,.92));
  border-top: 1px solid rgba(255,255,255,.08);
  border-bottom: 1px solid rgba(0,0,0,.35);
  border-left: 1px solid rgba(0,0,0,.35);
  border-right: 1px solid rgba(255,255,255,.08);
  box-shadow: inset 0 0 12px rgba(0,0,0,.5);
}

/* left page details */
.kb-leftHead{ display:flex; justify-content:space-between; gap:10px; }
.kb-leftTitle{
  font-weight:1000;
  letter-spacing:.10em;
  color:#2b1a10;
  font-size:12px;
}
.kb-leftCap{ opacity:.75; color:#2b1a10; font-weight:900; font-size:12px; }

.kb-polaroids{
  margin-top: 14px;
  display:grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
.kb-polaroid{
  background: rgba(255,255,255,.55);
  border: 1px solid rgba(70,40,20,.18);
  border-radius: 18px;
  padding: 12px;
  box-shadow: 0 18px 70px rgba(0,0,0,.25);
}
.kb-polaroid.tiltL{ transform: rotate(-1.5deg); }
.kb-polaroid.tiltR{ transform: rotate(1.2deg); }

.kb-photo{
  height: 210px;
  border-radius: 14px;
  overflow:hidden;
  border: 1px solid rgba(70,40,20,.18);
  background: rgba(255,255,255,.30);
  display:grid;
  place-items:center;
  position:relative;
}

/* IMAGE polaroid */
.kb-photo img{
  width:100%;
  height:100%;
  object-fit: cover;
  filter: sepia(0.55) contrast(1.05) brightness(0.98);
  position:absolute;
  inset:0;
}

/* VIDEO polaroid */
.kb-mediaWrap{
  width:100%;
  height:100%;
  position:relative;
  overflow:hidden;
  border-radius: 12px;
}
.kb-media{
  width:100%;
  height:100%;
  object-fit: cover;
  filter: sepia(0.55) contrast(1.05) brightness(0.98);
  transform: scale(1.02);
}
.kb-mediaGlass{
  position:absolute;
  inset:0;
  background:
    radial-gradient(220px 160px at 30% 30%, rgba(255,255,255,.12), transparent 60%),
    linear-gradient(to bottom, rgba(0,0,0,.06), rgba(0,0,0,.16));
  pointer-events:none;
}
.kb-mediaHint{
  position:absolute;
  right:10px;
  bottom:10px;
  font-size:10px;
  font-weight:1000;
  letter-spacing:.16em;
  padding:6px 8px;
  border-radius:999px;
  color: rgba(43,26,16,.88);
  background: rgba(243,230,201,.72);
  border: 1px solid rgba(70,40,20,.18);
  pointer-events:none;
}

.kb-photo.fallback{ background: rgba(0,0,0,.06); }
.kb-photoFallback{
  position:absolute;
  inset:0;
  display:grid;
  place-items:center;
  font-weight:1000;
  letter-spacing:.22em;
  opacity:.62;
  font-family: ui-monospace, Menlo, monospace;
  color:#2b1a10;
  text-align:center;
  padding: 10px;
}
.kb-note{
  margin-top:10px;
  font-weight:900;
  letter-spacing:.08em;
  font-size:11px;
  opacity:.82;
  color:#2b1a10;
}

.kb-toc{
  margin-top: 16px;
  display:flex;
  flex-wrap:wrap;
  gap: 10px;
}
.kb-tocItem{
  border-radius: 999px;
  padding: 8px 10px;
  border: 1px solid rgba(70,40,20,.22);
  background: rgba(255,255,255,.35);
  cursor:pointer;
  font-weight:1000;
  letter-spacing:.08em;
  font-size:11px;
  color:#2b1a10;
  display:flex;
  align-items:center;
  gap:8px;
}
.kb-tocItem .dot{
  width:8px; height:8px; border-radius:999px;
  background: rgba(120,60,25,.85);
  box-shadow: 0 0 12px rgba(120,60,25,.18);
}
.kb-tocItem.active{
  background: rgba(190,120,60,.22);
  border-color: rgba(120,60,25,.25);
}
.kb-tocItem:disabled{ opacity:.6; cursor:not-allowed; }

/* right page */
.kb-rTitle{
  font-weight: 1000;
  letter-spacing: .06em;
  font-size: 30px;
  color:#26160c;
}
.kb-rSub{
  margin-top: 6px;
  opacity:.80;
  font-weight: 900;
  letter-spacing: .10em;
  text-transform: uppercase;
  font-size: 12px;
  color:#3a2415;
}
.kb-rule{
  margin-top: 14px;
  height: 1px;
  background: rgba(60,35,18,.22);
}
.kb-content{ margin-top: 14px; display:flex; flex-direction:column; gap: 14px; }
.kb-h{
  font-weight: 1000;
  letter-spacing: .10em;
  font-size: 12px;
  color:#2b1a10;
}
.kb-ul{
  margin: 8px 0 0;
  padding-left: 18px;
  color:#2b1a10;
  line-height: 1.6;
}
.kb-ul li{ margin: 6px 0; }

.kb-actions{
  margin-top: 14px;
  display:flex;
  justify-content:space-between;
  gap: 12px;
}
.kb-btn{
  border-radius: 14px;
  padding: 10px 14px;
  border: 1px solid rgba(70,40,20,.25);
  background: rgba(255,255,255,.35);
  cursor:pointer;
  font-weight:1000;
  letter-spacing:.06em;
  color:#2b1a10;
}
.kb-btn.primary{
  background: linear-gradient(135deg, rgba(190,120,60,.55), rgba(120,60,25,.45));
  border-color: rgba(90,45,18,.35);
}

/* FLIP SHEET overlay sits on RIGHT page */
.kb-flipSheet{
  position:absolute;
  right:0;
  top:0;
  width: calc((100% - 18px) / 2);
  height: 100%;
  border-top-right-radius: 26px;
  border-bottom-right-radius: 26px;
  background:#f3e6c9;
  border: 1px solid rgba(70,40,20,.22);
  box-shadow: 0 28px 120px rgba(0,0,0,.28);
  transform-style: preserve-3d;
  opacity: 0;
  pointer-events:none;
}
.kb-flipFront, .kb-flipBack{
  position:absolute;
  inset:0;
  padding: 22px;
  backface-visibility: hidden;
}
.kb-flipBack{ transform: rotateY(180deg); }

@media (max-width: 980px){
  .kb-book{ grid-template-columns: 1fr; height: auto; }
  .kb-spine{ display:none; }
  .kb-pageLeft, .kb-pageRight{ border-radius: 26px; }
  .kb-flipSheet{ display:none; }
}
`;
