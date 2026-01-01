// src/ar/ARCursor.jsx
import React, { useContext, useEffect, useRef } from "react";
import { ARContext } from "./ARProvider";

/**
 * ✅ ARCursor (MediaPipe frontend-only)
 * - reads x/y/confidence from latestRef.current
 * - hides when disabled / not running / low confidence
 * - pinch “pulse” feedback
 * - keeps inside viewport bounds
 */
export default function ARCursor() {
  const ar = useContext(ARContext);
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    let raf = 0;

    const loop = () => {
      const dot = dotRef.current;
      const ring = ringRef.current;

      const pkt = ar?.latestRef?.current;
      const enabled = ar?.enabled !== false;

      // ✅ MediaPipe running status
      const running = ar?.status === "running";

      // If page is hidden, hide cursor + stop doing heavy work
      if (document.hidden) {
        if (dot) dot.style.opacity = "0";
        if (ring) ring.style.opacity = "0";
        raf = requestAnimationFrame(loop);
        return;
      }

      if (!dot || !ring || !enabled || !pkt) {
        if (dot) dot.style.opacity = "0";
        if (ring) ring.style.opacity = "0";
        raf = requestAnimationFrame(loop);
        return;
      }

      const x = typeof pkt.x === "number" ? pkt.x : 0.5;
      const y = typeof pkt.y === "number" ? pkt.y : 0.5;

      // confidence can come from packet or provider state
      const conf =
        typeof pkt.confidence === "number"
          ? pkt.confidence
          : typeof ar?.confidence === "number"
          ? ar.confidence
          : 0;

      // normalized -> viewport pixels
      let px = x * window.innerWidth;
      let py = y * window.innerHeight;

      // keep in bounds (avoid edge jitter)
      px = Math.max(0, Math.min(window.innerWidth - 1, px));
      py = Math.max(0, Math.min(window.innerHeight - 1, py));

      const pinch =
        !!pkt.pinch ||
        !!pkt.pinching ||
        !!ar?.pinch ||
        !!ar?.pinching;

      const base = `translate(${px}px, ${py}px) translate(-50%, -50%)`;
      ring.style.transform = `${base} scale(${pinch ? 1.35 : 1})`;
      dot.style.transform = base;

      // visibility rules
      const visible = running && conf >= 0.35;
      const op = visible ? "1" : "0";
      dot.style.opacity = op;
      ring.style.opacity = op;

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [ar]);

  return (
    <>
      {/* outer ring */}
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 34,
          height: 34,
          borderRadius: 999,
          zIndex: 999998,
          pointerEvents: "none",
          border: "1px solid rgba(124,58,237,.55)",
          boxShadow: "0 0 22px rgba(59,130,246,.35)",
          background: "rgba(255,255,255,.03)",
          transition: "transform 90ms ease, opacity 160ms ease",
          opacity: 0,
        }}
        aria-hidden="true"
      />

      {/* core dot */}
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 14,
          height: 14,
          borderRadius: 999,
          zIndex: 999999,
          pointerEvents: "none",
          boxShadow: "0 0 26px rgba(96,165,250,.85)",
          background:
            "linear-gradient(135deg, rgba(124,58,237,.95), rgba(59,130,246,.9))",
          transition: "opacity 160ms ease",
          opacity: 0,
        }}
        aria-hidden="true"
      />
    </>
  );
}
