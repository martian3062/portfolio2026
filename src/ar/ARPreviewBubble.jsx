// src/ar/ARPreviewBubble.jsx
import { useEffect, useRef } from "react";
import useAR from "./useAR";

export default function ARPreviewBubble({
  size = 118,
  position = { right: 18, bottom: 18 },
}) {
  const ar = useAR();
  const vRef = useRef(null);

  // bind stream when available
  useEffect(() => {
    const v = vRef.current;
    const s = ar?.streamRef?.current;

    if (!v) return;

    if (!ar.enabled || !s) {
      try { v.srcObject = null; } catch {}
      return;
    }

    try {
      v.srcObject = s;
      v.muted = true;
      v.playsInline = true;
      v.play().catch(() => {});
    } catch {}
  }, [ar.enabled, ar.hasStream, ar]);

  const dotColor =
    !ar.enabled ? "rgba(148,163,184,.9)" :
    ar.status === "running" ? "rgba(34,197,94,.9)" :
    ar.status === "requesting" ? "rgba(251,191,36,.9)" :
    ar.status === "denied" ? "rgba(239,68,68,.9)" :
    "rgba(148,163,184,.9)";

  const label =
    !ar.enabled ? "AR OFF" :
    ar.status === "running" ? "AR ON" :
    ar.status === "requesting" ? "Starting..." :
    ar.status === "denied" ? "Denied" :
    "AR ON";

  return (
    <div
      style={{
        position: "fixed",
        ...position,
        zIndex: 999999,
        width: size,
        height: size,
        borderRadius: 999,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,.16)",
        background: "rgba(10,6,18,.55)",
        boxShadow: "0 22px 80px rgba(0,0,0,.55)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* video preview */}
      {ar.enabled && ar.hasStream ? (
        <video
          ref={vRef}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scaleX(-1)",
            filter: "saturate(1.1) contrast(1.05) brightness(0.95)",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "grid",
            placeItems: "center",
            color: "rgba(255,255,255,.75)",
            fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: 11,
            letterSpacing: ".12em",
            textTransform: "uppercase",
          }}
        >
          camera
        </div>
      )}

      {/* glass */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120px 80px at 30% 30%, rgba(124,58,237,.18), transparent 55%)," +
            "radial-gradient(120px 80px at 70% 70%, rgba(59,130,246,.12), transparent 60%)," +
            "linear-gradient(to bottom, rgba(0,0,0,.10), rgba(0,0,0,.35))",
          pointerEvents: "none",
        }}
      />

      {/* button overlay */}
      <button
        onClick={() => ar.setEnabled?.(!ar.enabled)}
        style={{
          position: "absolute",
          left: "50%",
          bottom: 10,
          transform: "translateX(-50%)",
          padding: "8px 10px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,.18)",
          background: ar.enabled
            ? "linear-gradient(135deg, rgba(124,58,237,.85), rgba(59,130,246,.65))"
            : "rgba(255,255,255,.08)",
          color: "#fff",
          fontWeight: 900,
          fontSize: 11,
          letterSpacing: ".10em",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
        title={`status: ${ar.status} • conf: ${Number(ar.confidence || 0).toFixed(2)}`}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: dotColor,
            boxShadow: "0 0 16px rgba(255,255,255,.22)",
          }}
        />
        {label}
      </button>
    </div>
  );
}
