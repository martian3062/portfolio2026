import { useEffect, useRef } from "react";
import useAR from "../ar/useAR";

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

  /* ---------------- NEAREST TARGET ---------------- */
  const getNearestChoice = () => {
    const { pardeepEl } = getTargets?.() || {};
    if (!pardeepEl) return null;
    return "pardeep";
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
