// src/ar/ARMiniHUD.jsx
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ARContext } from "./ARProvider";

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

export default function ARMiniHUD({
  showPreview = false, // ✅ default OFF (light)
  title = "AR • LOCAL",
}) {
  const ar = useContext(ARContext);

  // local UI snapshot (smooth + stable)
  const [snap, setSnap] = useState({ x: 0.5, y: 0.5, ts: 0 });

  // optional preview video element
  const previewRef = useRef(null);

  // pull from latestRef at ~60fps but with thresholded state updates
  useEffect(() => {
    let raf = 0;

    const loop = () => {
      const pkt = ar?.latestRef?.current;
      if (pkt) {
        const nx = typeof pkt.x === "number" ? pkt.x : 0.5;
        const ny = typeof pkt.y === "number" ? pkt.y : 0.5;
        const nts = typeof pkt.ts === "number" ? pkt.ts : 0;

        setSnap((prev) => {
          const dx = Math.abs(nx - prev.x);
          const dy = Math.abs(ny - prev.y);
          const dts = Math.abs(nts - prev.ts);

          // update only if meaningful (avoid rerender spam)
          if (dx > 0.008 || dy > 0.008 || dts > 250) {
            return { x: nx, y: ny, ts: nts };
          }
          return prev;
        });
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [ar]);

  // ✅ bind preview stream if enabled
  useEffect(() => {
    if (!showPreview) return;

    let raf = 0;
    let cancelled = false;

    const bind = () => {
      if (cancelled) return;

      const v = previewRef.current;
      const stream = ar?.streamRef?.current;

      if (!v) {
        raf = requestAnimationFrame(bind);
        return;
      }

      if (!stream) {
        // clear if stream not ready yet
        try {
          v.srcObject = null;
        } catch {}
        raf = requestAnimationFrame(bind);
        return;
      }

      // stream ready → bind once
      try {
        if (v.srcObject !== stream) v.srcObject = stream;
        v.muted = true;
        v.playsInline = true;
        v.play().catch(() => {}); // autoplay might be blocked; ok
      } catch {}

      // no more polling once attached
    };

    raf = requestAnimationFrame(bind);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [showPreview, ar?.enabled, ar?.status]); // ✅ no ar?.hasStream

  const pct = useMemo(() => {
    const c = Number(ar?.confidence ?? 0);
    return Math.round(clamp01(c) * 100);
  }, [ar?.confidence]);

  const statusRaw = ar?.status || "idle";
  const enabled = !!ar?.enabled;

  const statusLabel = !enabled ? "DISABLED" : String(statusRaw).toUpperCase();

  const statusColor =
    !enabled
      ? "rgba(148,163,184,.9)" // slate
      : statusRaw === "running"
      ? "rgba(34,197,94,.9)" // green
      : statusRaw === "requesting"
      ? "rgba(251,191,36,.9)" // amber
      : statusRaw === "denied"
      ? "rgba(239,68,68,.9)" // red
      : "rgba(148,163,184,.9)"; // slate

  const pillText = ar?.pinch
    ? "🤏 PINCH"
    : ar?.swipe
    ? `👉 ${String(ar.swipe).toUpperCase()}`
    : enabled
    ? "🖐 TRACKING"
    : "📴 OFF";

  return (
    <div style={wrapStyle}>
      <div style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ ...dotStyle, background: statusColor }} />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 900, letterSpacing: ".12em", fontSize: 11 }}>
              {title} • {statusLabel}
            </div>
            <div style={{ opacity: 0.78, fontSize: 11 }}>
              conf: <b>{pct}%</b>
            </div>
          </div>
        </div>

        <div style={pillStyle}>{pillText}</div>
      </div>

      {showPreview && (
        <div style={previewWrapStyle}>
          <video ref={previewRef} style={previewStyle} />
          <div style={previewGlassStyle} />
        </div>
      )}

      <div style={gridStyle}>
        <div style={cellStyle}>
          <div style={kStyle}>x</div>
          <div style={vStyle}>{snap.x.toFixed(3)}</div>
        </div>

        <div style={cellStyle}>
          <div style={kStyle}>y</div>
          <div style={vStyle}>{snap.y.toFixed(3)}</div>
        </div>

        <div style={cellStyle}>
          <div style={kStyle}>ts</div>
          <div style={vStyle}>{snap.ts ? String(Math.round(snap.ts)) : "-"}</div>
        </div>

        <div style={cellStyle}>
          <div style={kStyle}>mode</div>
          <div style={{ ...vStyle, fontSize: 12, wordBreak: "break-word" }}>
            mediapipe-local
          </div>
        </div>
      </div>

      {/* confidence bar */}
      <div style={barWrapStyle}>
        <div style={{ ...barFillStyle, width: `${pct}%` }} />
      </div>

      <div style={{ opacity: 0.6, fontSize: 11, marginTop: 8 }}>
        Frontend-only tracking • no backend required
      </div>
    </div>
  );
}

const wrapStyle = {
  position: "fixed",
  top: 14,
  right: 14,
  width: 320,
  zIndex: 999999,
  borderRadius: 18,
  padding: 14,
  background: "rgba(10,6,18,.55)",
  border: "1px solid rgba(255,255,255,.12)",
  boxShadow: "0 22px 90px rgba(0,0,0,.55)",
  backdropFilter: "blur(12px)",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  color: "rgba(255,255,255,.92)",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  alignItems: "center",
};

const dotStyle = {
  width: 10,
  height: 10,
  borderRadius: 999,
  boxShadow: "0 0 18px rgba(255,255,255,.25)",
};

const pillStyle = {
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,.14)",
  background: "rgba(255,255,255,.06)",
  fontWeight: 900,
  letterSpacing: ".06em",
  fontSize: 11,
  whiteSpace: "nowrap",
};

const previewWrapStyle = {
  position: "relative",
  marginTop: 12,
  width: "100%",
  aspectRatio: "16 / 10",
  borderRadius: 16,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,.10)",
  background: "rgba(255,255,255,.04)",
};

const previewStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transform: "scaleX(-1)",
  filter: "saturate(1.1) contrast(1.05) brightness(0.95)",
};

const previewGlassStyle = {
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(220px 140px at 30% 30%, rgba(124,58,237,.14), transparent 55%)," +
    "radial-gradient(220px 140px at 70% 70%, rgba(59,130,246,.10), transparent 60%)," +
    "linear-gradient(to bottom, rgba(0,0,0,.08), rgba(0,0,0,.22))",
  pointerEvents: "none",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginTop: 12,
};

const cellStyle = {
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.10)",
  background: "rgba(255,255,255,.05)",
  padding: 10,
};

const kStyle = { opacity: 0.65, fontSize: 10, letterSpacing: ".14em" };
const vStyle = { fontSize: 14, fontWeight: 900, marginTop: 4 };

const barWrapStyle = {
  height: 10,
  marginTop: 12,
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,.10)",
  background: "rgba(255,255,255,.06)",
  overflow: "hidden",
};

const barFillStyle = {
  height: "100%",
  borderRadius: 999,
  background: "linear-gradient(135deg, rgba(124,58,237,.95), rgba(59,130,246,.85))",
};
