import React, { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useAR from "./ar/useAR";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function getCenter(el) {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
}

const SECTIONS = [
  {
    key: "pardeep",
    name: "Pardeep",
    route: "/pardeep",
    video: "/mars_pardeep.mp4",
    subtitle: "Full Stack • AI • Automation",
    align: "right", // requested
  },
  {
    key: "karanvir",
    name: "Karanvir",
    route: "/karanvir",
    video: "/introkaran_blurred.mp4",
    subtitle: "Data Engineering • Gen AI • Cloud",
    align: "left", // requested
  },
  {
    key: "deepanshu",
    name: "Deepanshu",
    route: "/deepanshu",
    video: "/batman.mp4",
    subtitle: "Engineering • Product • Web3",
    align: "center",
  },
];

export default function App() {
  const navigate = useNavigate();

  // bubble refs
  const pRef = useRef(null);
  const kRef = useRef(null);
  const dRef = useRef(null);

  // section refs
  const sectionRefs = useRef([]);

  const bubbleRefs = useMemo(
    () => ({
      pardeep: pRef,
      karanvir: kRef,
      deepanshu: dRef,
    }),
    []
  );

  const routes = useMemo(
    () => ({
      pardeep: "/pardeep",
      karanvir: "/karanvir",
      deepanshu: "/deepanshu",
    }),
    []
  );

  const { latestRef, pinch, confidence, status, enabled, setEnabled } = useAR();

  // mirror provider state for toggle UI
  const [arEnabled, setArEnabled] = useState(!!enabled);
  const [activeSection, setActiveSection] = useState("pardeep");
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    setEnabled?.(arEnabled);
  }, [arEnabled, setEnabled]);

  // Floating animation for all bubbles
  useEffect(() => {
    const anims = [];

    const floatify = (el, cfg) => {
      if (!el) return;
      const a1 = gsap.to(el, {
        y: cfg.y,
        x: cfg.x,
        rotation: cfg.r,
        duration: cfg.d1,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      const a2 = gsap.to(el, {
        boxShadow:
          "0 22px 86px rgba(124,58,237,.26), inset 0 1px 0 rgba(255,255,255,.36)",
        duration: cfg.d2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      anims.push(a1, a2);
    };

    floatify(pRef.current, { y: -12, x: -7, r: -2.2, d1: 3.1, d2: 2.7 });
    floatify(kRef.current, { y: 14, x: 10, r: 2.6, d1: 3.4, d2: 2.6 });
    floatify(dRef.current, { y: -10, x: 8, r: -2.0, d1: 3.0, d2: 2.9 });

    return () => anims.forEach((a) => a?.kill?.());
  }, []);

  const popAndGo = (el, route) => {
    if (!el || !route || isNavigatingRef.current) return;
    isNavigatingRef.current = true;

    document.querySelectorAll("button[data-bubble]").forEach((b) => {
      b.disabled = true;
    });

    gsap
      .timeline({
        onComplete: () => navigate(route),
      })
      .to(el, { scale: 1.08, duration: 0.12, ease: "power2.out" })
      .to(
        el,
        {
          scale: 1.55,
          opacity: 0,
          filter: "blur(10px)",
          duration: 0.32,
          ease: "power3.in",
        },
        "<"
      );
  };

  // Stable active section tracking (better than scroll midpoint math)
  useEffect(() => {
    const els = sectionRefs.current.filter(Boolean);
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        let winner = null;
        for (const e of entries) {
          if (!winner || e.intersectionRatio > winner.intersectionRatio) {
            winner = e;
          }
        }
        if (winner?.isIntersecting) {
          const key = winner.target.getAttribute("data-key");
          if (key) setActiveSection(key);
        }
      },
      { threshold: [0.4, 0.6, 0.8] }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Find nearest bubble to AR cursor among all 3
  const getNearestChoice = () => {
    const pkt = latestRef?.current || {};
    const x = typeof pkt.x === "number" ? pkt.x : 0.5;
    const y = typeof pkt.y === "number" ? pkt.y : 0.5;

    const px = clamp(x, 0, 1) * window.innerWidth;
    const py = clamp(y, 0, 1) * window.innerHeight;

    const entries = [
      { key: "pardeep", c: getCenter(pRef.current) },
      { key: "karanvir", c: getCenter(kRef.current) },
      { key: "deepanshu", c: getCenter(dRef.current) },
    ].filter((e) => !!e.c);

    if (!entries.length) return activeSection || "pardeep";

    let best = entries[0].key;
    let bestD = Number.POSITIVE_INFINITY;

    for (const e of entries) {
      const dx = e.c.cx - px;
      const dy = e.c.cy - py;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestD) {
        bestD = d2;
        best = e.key;
      }
    }

    return best;
  };

  // AR highlight nearest bubble
  useEffect(() => {
    const setOutline = (name, on) => {
      const el = bubbleRefs[name]?.current;
      if (!el) return;
      el.style.outline = on ? "2px solid rgba(157,220,255,0.62)" : "none";
    };

    if (!arEnabled) {
      setOutline("pardeep", false);
      setOutline("karanvir", false);
      setOutline("deepanshu", false);
      return;
    }

    let raf = 0;
    const loop = () => {
      const choice = getNearestChoice();
      setOutline("pardeep", choice === "pardeep");
      setOutline("karanvir", choice === "karanvir");
      setOutline("deepanshu", choice === "deepanshu");
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arEnabled, bubbleRefs, activeSection]);

  // Pinch rising-edge => navigate nearest
  const pinchPrevRef = useRef(false);
  useEffect(() => {
    if (!arEnabled || isNavigatingRef.current) {
      pinchPrevRef.current = pinch;
      return;
    }

    const strongHand = confidence >= 0.55;
    const rising = !pinchPrevRef.current && pinch;

    if (strongHand && rising) {
      const choice = getNearestChoice();
      const ref = bubbleRefs[choice]?.current;
      const route = routes[choice];
      if (ref && route) popAndGo(ref, route);
    }

    pinchPrevRef.current = pinch;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinch, confidence, arEnabled, activeSection, bubbleRefs, routes]);

  const arHint = arEnabled
    ? `• aim with hand + pinch to select • ${String(status || "idle").toLowerCase()}`
    : "";

  return (
    <div className="hub3-root">
      <button
        className={`ar-toggle ${arEnabled ? "on" : ""}`}
        onClick={() => setArEnabled((v) => !v)}
        title={`AR: ${String(status)} • conf: ${Number(confidence || 0).toFixed(2)}`}
      >
        {arEnabled ? "🖐 AR ON" : "📴 AR OFF"}
      </button>

      <header className="top">
        <div className="brand">Portfolio Hub</div>
        <div className="hint">Click bubble or use AR pinch {arHint}</div>
      </header>

      <aside className="hub-dots" aria-label="Section navigation">
        {SECTIONS.map((s) => (
          <a key={s.key} href={`#${s.key}`} className="dot-link" aria-label={s.name}>
            <span className={`dot ${activeSection === s.key ? "active" : ""}`} />
          </a>
        ))}
      </aside>

      {SECTIONS.map((s, idx) => {
        const ref =
          s.key === "pardeep" ? pRef : s.key === "karanvir" ? kRef : dRef;

        return (
          <section
            key={s.key}
            id={s.key}
            data-key={s.key}
            className="hub3-section"
            ref={(el) => {
              sectionRefs.current[idx] = el;
            }}
          >
            <video
              className="hub3-video"
              src={s.video}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
            <div className="hub3-overlay" />

            <div className={`hub3-content hub3-content--${s.align || "center"}`}>
              <div className="hub3-subtitle">{s.subtitle}</div>

              <motion.button
                ref={ref}
                data-bubble
                className="bubble bubble--transparent"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => popAndGo(ref.current, s.route)}
              >
                <span className="label">{s.name}</span>
              </motion.button>

              <div className="hub3-meta">
                <span>{`Section ${idx + 1}/3`}</span>
                <span>↓ Scroll</span>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
