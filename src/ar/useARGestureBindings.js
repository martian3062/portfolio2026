import { useContext, useEffect, useRef } from "react";
import { ARContext } from "./ARProvider";

export function useARGestureBindings({
  enabled,
  getTargets,          // () => [{ key, el }]
  onSelect,            // (key) => void
  onNext,              // () => void
  onPrev,              // () => void
}) {
  const ar = useContext(ARContext);

  const lastPinch = useRef(false);
  const lastSwipeTs = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    // ✅ pinch rising-edge = click/select
    if (ar?.pinch && !lastPinch.current) {
      lastPinch.current = true;

      const targets = (getTargets?.() || []).filter(t => t?.el);
      if (targets.length) {
        const px = (ar?.x ?? 0.5) * window.innerWidth;
        const py = (ar?.y ?? 0.5) * window.innerHeight;

        let best = null;
        let bestD = Infinity;

        for (const t of targets) {
          const r = t.el.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const d = Math.hypot(px - cx, py - cy);
          if (d < bestD) {
            bestD = d;
            best = t;
          }
        }

        if (best) onSelect?.(best.key);
      }
    }

    if (!ar?.pinch) lastPinch.current = false;

    // ✅ swipe cooldown
    const now = Date.now();
    if (ar?.swipe && now - lastSwipeTs.current > 700) {
      lastSwipeTs.current = now;

      // match your frontend meaning:
      // backend swipe "left" = next, "right" = prev (common UX)
      if (ar.swipe === "left") onNext?.();
      if (ar.swipe === "right") onPrev?.();
    }
  }, [enabled, ar?.pinch, ar?.swipe, ar?.x, ar?.y, getTargets, onSelect, onNext, onPrev]);
}
