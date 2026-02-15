import React, { useContext, useEffect, useRef } from "react";
import { ARContext } from "./ARProvider";

/**
 * ✅ ARCursor
 * - Mirrored finger cursor (index finger)
 * - Stable pinch feedback (hysteresis-aware)
 * - Two-hand zoom visual feedback
 * - Confidence + status gated
 * - RAF-driven (zero rerenders)
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
      const running = ar?.status === "tracking" || ar?.status === "running";

      // hard hide conditions
      if (
        document.hidden ||
        !dot ||
        !ring ||
        !enabled ||
        !running ||
        !pkt
      ) {
        if (dot) dot.style.opacity = "0";
        if (ring) ring.style.opacity = "0";
        raf = requestAnimationFrame(loop);
        return;
      }

      const x = typeof pkt.x === "number" ? pkt.x : 0.5;
      const y = typeof pkt.y === "number" ? pkt.y : 0.5;

      const conf =
        typeof pkt.confidence === "number"
          ? pkt.confidence
          : typeof ar?.confidence === "number"
          ? ar.confidence
          : 0;

      if (conf < 0.35) {
        dot.style.opacity = "0";
        ring.style.opacity = "0";
        raf = requestAnimationFrame(loop);
        return;
      }

      /* ---------- MIRRORED SCREEN COORDS ---------- */
      let px = x * window.innerWidth;
      let py = y * window.innerHeight;

      px = Math.max(0, Math.min(window.innerWidth - 1, px));
      py = Math.max(0, Math.min(window.innerHeight - 1, py));

      const mx = window.innerWidth - px;

      /* ---------- GESTURE STATE ---------- */
      const pinch =
        !!pkt.pinch ||
        !!pkt.pinching ||
        !!ar?.pinch ||
        !!ar?.pinching;

      const zooming = !!ar?.events?.zoom;

      /* ---------- TRANSFORMS ---------- */
      const base = `translate(${mx}px, ${py}px) translate(-50%, -50%)`;

      let scale = 1;
      if (pinch) scale = 1.35;
      if (zooming) scale = 1.6;

      ring.style.transform = `${base} scale(${scale})`;
      dot.style.transform = base;

      ring.style.opacity = "1";
      dot.style.opacity = "1";

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [ar]);

  return (
    <>
      {/* Outer Ring */}
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 36,
          height: 36,
          borderRadius: 999,
          zIndex: 999998,
          pointerEvents: "none",
          border: "1px solid rgba(124,58,237,.6)",
          boxShadow:
            "0 0 28px rgba(124,58,237,.45), inset 0 0 12px rgba(59,130,246,.25)",
          background: "rgba(255,255,255,.03)",
          transition: "transform 90ms ease, opacity 160ms ease",
          opacity: 0,
        }}
        aria-hidden="true"
      />

      {/* Core Dot */}
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
          boxShadow: "0 0 30px rgba(96,165,250,.95)",
          background:
            "linear-gradient(135deg, rgba(124,58,237,.95), rgba(59,130,246,.95))",
          transition: "opacity 160ms ease",
          opacity: 0,
        }}
        aria-hidden="true"
      />
    </>
  );
}
