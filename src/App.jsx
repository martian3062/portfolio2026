// src/App.jsx
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

export default function App() {
  const kRef = useRef(null);
  const pRef = useRef(null);
  const navigate = useNavigate();

  const { latestRef, pinch, confidence, status, enabled, setEnabled } = useAR();

  // ✅ if provider already has enabled state, we mirror it locally for button UI
  const [arEnabled, setArEnabled] = useState(!!enabled);

  // ✅ keep provider enabled in sync with button
  useEffect(() => {
    setEnabled?.(arEnabled);
  }, [arEnabled, setEnabled]);

  // 🎈 Floating animation
  useEffect(() => {
    const floatify = (el, dir) => {
      if (!el) return;

      gsap.to(el, {
        y: 18 * dir,
        x: 12 * dir,
        rotation: 3 * dir,
        duration: 3.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      gsap.to(el, {
        boxShadow:
          "0 24px 90px rgba(124,58,237,.28), inset 0 1px 0 rgba(255,255,255,.28)",
        duration: 2.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    };

    floatify(kRef.current, 1);
    floatify(pRef.current, -1);
  }, []);

  // 💥 Bubble pop + route change
  const popAndGo = (el, route) => {
    if (!el) return;

    document
      .querySelectorAll("button[data-bubble]")
      .forEach((b) => (b.disabled = true));

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

  // ✅ Compute which bubble is nearest to the AR cursor
  const getNearestChoice = () => {
    const pkt = latestRef?.current || {};
    const x = typeof pkt.x === "number" ? pkt.x : 0.5;
    const y = typeof pkt.y === "number" ? pkt.y : 0.5;

    const px = clamp(x, 0, 1) * window.innerWidth;
    const py = clamp(y, 0, 1) * window.innerHeight;

    const kc = getCenter(kRef.current);
    const pc = getCenter(pRef.current);
    if (!kc || !pc) return "pardeep";

    const dk = (kc.cx - px) ** 2 + (kc.cy - py) ** 2;
    const dp = (pc.cx - px) ** 2 + (pc.cy - py) ** 2;

    return dk <= dp ? "karanvir" : "pardeep";
  };

  // ✅ Highlight nearest bubble while AR is ON
  useEffect(() => {
    if (!arEnabled) {
      // clear outlines when off
      const kEl = kRef.current;
      const pEl = pRef.current;
      if (kEl) kEl.style.outline = "none";
      if (pEl) pEl.style.outline = "none";
      return;
    }

    let raf = 0;
    const loop = () => {
      const choice = getNearestChoice();
      const kEl = kRef.current;
      const pEl = pRef.current;

      if (kEl && pEl) {
        kEl.style.outline =
          choice === "karanvir" ? "2px solid rgba(157,220,255,0.55)" : "none";
        pEl.style.outline =
          choice === "pardeep" ? "2px solid rgba(157,220,255,0.55)" : "none";
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arEnabled]);

  // ✅ Pinch rising-edge => select nearest bubble
  const pinchPrevRef = useRef(false);
  useEffect(() => {
    if (!arEnabled) {
      pinchPrevRef.current = pinch;
      return;
    }

    const strongHand = confidence >= 0.55;
    const prev = pinchPrevRef.current;
    const rising = !prev && pinch;

    if (strongHand && rising) {
      const choice = getNearestChoice();
      if (choice === "karanvir") popAndGo(kRef.current, "/karanvir");
      else popAndGo(pRef.current, "/pardeep");
    }

    pinchPrevRef.current = pinch;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinch, confidence, arEnabled]);

  const arHint =
    arEnabled
      ? `• aim with hand + pinch to select • ${String(status || "idle").toLowerCase()}`
      : "";

  return (
    <div className="page">
      {/* ✅ ONLY AR TOGGLE (no HUD boxes) */}
      <button
        className={`ar-toggle ${arEnabled ? "on" : ""}`}
        onClick={() => setArEnabled((v) => !v)}
        title={`AR: ${String(status)} • conf: ${Number(confidence || 0).toFixed(2)}`}
      >
        {arEnabled ? "🖐 AR ON" : "📴 AR OFF"}
      </button>

      <header className="top">
        <div className="brand">Portfolio Hub</div>
        <div className="hint">Click bubbles or use AR pinch {arHint}</div>
      </header>

      <main className="stage">
        <motion.button
          ref={kRef}
          data-bubble
          className="bubble"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => popAndGo(kRef.current, "/karanvir")}
        >
          <span className="label">Karanvir</span>
        </motion.button>

        <motion.button
          ref={pRef}
          data-bubble
          className="bubble alt"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => popAndGo(pRef.current, "/pardeep")}
        >
          <span className="label">Pardeep</span>
        </motion.button>
      </main>

      <footer className="bottom">GSAP • Framer Motion • MediaPipe AR</footer>
    </div>
  );
}
