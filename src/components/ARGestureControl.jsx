import { useEffect, useRef, useState } from "react";
import useAR from "../ar/useAR";

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

// Small hysteresis to avoid flicker around threshold
function useStrongHand(confidence, on = 0.58, off = 0.48) {
  const ref = useRef(false);
  if (ref.current) {
    if (confidence < off) ref.current = false;
  } else {
    if (confidence > on) ref.current = true;
  }
  return ref.current;
}

export default function ARGestureControl({
  active = true,
  getTargets,
  onSelectNearest,
  onSwipeNext,
  onSwipePrev,
}) {
  const ar = useAR();

  const status = ar?.status ?? "idle";
  const latestRef = ar?.latestRef;
  const pinch = !!ar?.pinch; // mapped in useAR.js
  const confidence = Number(ar?.confidence ?? 0);

  // Prefer events.swipe (new) but keep old field support
  const swipe = ar?.events?.swipe ?? ar?.swipe ?? null;

  const strongHand = useStrongHand(confidence);

  // pinch rising-edge guard
  const prevPinchRef = useRef(false);

  // swipe cooldown
  const lastSwipeRef = useRef(0);

  // HUD state (so UI updates even if latestRef.current changes without rerender)
  const [hud, setHud] = useState({ x: 0.5, y: 0.5, ts: 0 });

  // Keep HUD updated (cheap)
  useEffect(() => {
    if (!active) return;

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);

      const pkt = latestRef?.current;
      if (!pkt) return;

      // only update if meaningful change to avoid rerender spam
      setHud((p) => {
        const x = typeof pkt.x === "number" ? pkt.x : p.x;
        const y = typeof pkt.y === "number" ? pkt.y : p.y;
        const ts = typeof pkt.ts === "number" ? pkt.ts : p.ts;

        const dx = Math.abs(x - p.x);
        const dy = Math.abs(y - p.y);
        const dts = Math.abs(ts - p.ts);

        if (dx > 0.008 || dy > 0.008 || dts > 200) return { x, y, ts };
        return p;
      });
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, latestRef]);

  const getNearestChoice = () => {
    const pkt = latestRef?.current;
    if (!pkt) return null;

    const x = clamp01(typeof pkt.x === "number" ? pkt.x : 0.5);
    const y = clamp01(typeof pkt.y === "number" ? pkt.y : 0.5);

    const px = x * window.innerWidth;
    const py = y * window.innerHeight;

    const { karanvirEl, pardeepEl } = getTargets?.() || {};
    if (!karanvirEl || !pardeepEl) return null;

    const k = karanvirEl.getBoundingClientRect();
    const p = pardeepEl.getBoundingClientRect();

    const kc = { cx: k.left + k.width / 2, cy: k.top + k.height / 2 };
    const pc = { cx: p.left + p.width / 2, cy: p.top + p.height / 2 };

    const dk = (kc.cx - px) ** 2 + (kc.cy - py) ** 2;
    const dp = (pc.cx - px) ** 2 + (pc.cy - py) ** 2;

    return dk <= dp ? "karanvir" : "pardeep";
  };

  // ✅ Pinch -> select nearest (rising edge)
  useEffect(() => {
    if (!active) {
      prevPinchRef.current = pinch;
      return;
    }
    if (!strongHand) {
      prevPinchRef.current = pinch;
      return;
    }

    const prev = prevPinchRef.current;
    const rising = !prev && pinch;

    if (rising) {
      const chosen = getNearestChoice();
      if (chosen) onSelectNearest?.(chosen);
    }

    prevPinchRef.current = pinch;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinch, active, strongHand]);

  // ✅ Swipe -> next/prev (cooldown)
  useEffect(() => {
    if (!active) return;
    if (!strongHand) return;
    if (!swipe) return;

    const now = Date.now();
    if (now - lastSwipeRef.current < 450) return;
    lastSwipeRef.current = now;

    // Keep your old mapping
    if (swipe === "left" || swipe === "down") onSwipeNext?.();
    if (swipe === "right" || swipe === "up") onSwipePrev?.();
  }, [swipe, active, strongHand, onSwipeNext, onSwipePrev]);

  // UI-only HUD (no camera)
  if (!active) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "70px",
        right: "16px",
        width: "220px",
        borderRadius: "14px",
        overflow: "hidden",
        zIndex: 9999,
        border: "1px solid rgba(255,255,255,.18)",
        background: "rgba(5,4,10,0.55)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 20px 60px rgba(0,0,0,.65)",
        fontFamily: "monospace",
      }}
    >
      <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,.10)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <strong style={{ color: "#9ddcff" }}>AR HUD</strong>
          <span style={{ color: "rgba(255,255,255,.7)" }}>{status}</span>
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,.75)" }}>
          {strongHand ? "Hand: OK" : "Hand: weak/none"}
        </div>
      </div>

      <div style={{ padding: "10px 12px", fontSize: 12, color: "rgba(255,255,255,.82)" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>x</span>
          <span>{Number(hud.x ?? 0).toFixed(3)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>y</span>
          <span>{Number(hud.y ?? 0).toFixed(3)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>pinch</span>
          <span>{pinch ? "true" : "false"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>swipe</span>
          <span>{swipe ?? "-"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>conf</span>
          <span>{confidence.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
