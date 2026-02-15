import { useEffect, useRef } from "react";
import useAR from "./useAR";

const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
];

export default function ARHandSkeleton() {
  const ar = useAR();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf = 0;

    const draw = () => {
      const lm = ar?.latestRef?.current?.rawLandmarks;
      const conf = ar?.confidence ?? 0;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!lm || conf < 0.35) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const W = canvas.width;
      const H = canvas.height;

      // ---- draw bones ----
      ctx.strokeStyle = "rgba(124,58,237,.9)";
      ctx.lineWidth = 2;

      for (const [a, b] of CONNECTIONS) {
        const p1 = lm[a];
        const p2 = lm[b];
        if (!p1 || !p2) continue;

        const x1 = (1 - p1.x) * W; // 🔥 mirror
        const y1 = p1.y * H;
        const x2 = (1 - p2.x) * W;
        const y2 = p2.y * H;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // ---- draw joints ----
      ctx.fillStyle = "rgba(59,130,246,.95)";
      for (const p of lm) {
        const x = (1 - p.x) * W;
        const y = p.y * H;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [ar]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 999997,
      }}
    />
  );
}

