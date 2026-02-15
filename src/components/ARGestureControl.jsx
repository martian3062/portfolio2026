import { useEffect, useRef } from "react";
import useAR from "../ar/useAR";

const clamp01 = (n) => Math.max(0, Math.min(1, n));

/**
 * ✅ ARGestureControl (FINAL – SIMPLE & RELIABLE)
 * - Pinch = click
 * - Swipe = next / prev
 * - No sensitivity
 * - No confidence
 * - Mirror-safe
 */
export default function ARGestureControl({
  active = true,
  getTargets,
  onSelectNearest,
  onSwipeNext,
  onSwipePrev,
}) {
  const ar = useAR();

  const latestRef = ar?.latestRef;
  const pinch = !!ar?.pinch;
  const swipe = ar?.events?.swipe ?? null;

  const prevPinchRef = useRef(false);
  const lastSwipeRef = useRef(0);

  /* ---------------- NEAREST TARGET (MIRROR SAFE) ---------------- */
  const getNearestChoice = () => {
    const pkt = latestRef?.current;
    if (!pkt) return null;

    const x = clamp01(pkt.x ?? 0.5);
    const y = clamp01(pkt.y ?? 0.5);

    // 🔥 mirror X because camera + cursor are mirrored
    const px = (1 - x) * window.innerWidth;
    const py = y * window.innerHeight;

    const { karanvirEl, pardeepEl } = getTargets?.() || {};
    if (!karanvirEl || !pardeepEl) return null;

    const distSq = (el) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      return (cx - px) ** 2 + (cy - py) ** 2;
    };

    return distSq(karanvirEl) <= distSq(pardeepEl)
      ? "karanvir"
      : "pardeep";
  };

  /* ---------------- PINCH = CLICK ---------------- */
  useEffect(() => {
    if (!active) {
      prevPinchRef.current = pinch;
      return;
    }

    const rising = !prevPinchRef.current && pinch;

    if (rising) {
      const chosen = getNearestChoice();
      if (chosen) {
        onSelectNearest?.(chosen);
      }
    }

    prevPinchRef.current = pinch;
  }, [pinch, active, onSelectNearest]);

  /* ---------------- SWIPE ---------------- */
  useEffect(() => {
    if (!active || !swipe) return;

    const now = Date.now();
    if (now - lastSwipeRef.current < 350) return;
    lastSwipeRef.current = now;

    if (swipe === "left" || swipe === "down") onSwipeNext?.();
    if (swipe === "right" || swipe === "up") onSwipePrev?.();
  }, [swipe, active, onSwipeNext, onSwipePrev]);

  return null; // 🔥 no HUD, no clutter
}
