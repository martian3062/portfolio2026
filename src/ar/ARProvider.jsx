// src/ar/ARProvider.jsx
import React, { createContext, useCallback, useMemo, useRef, useState } from "react";

export const ARContext = createContext(null);

export default function ARProvider({ children, defaultEnabled = false }) {
  // ✅ master toggle for AR + camera
  const [enabled, _setEnabled] = useState(!!defaultEnabled);

  // ✅ runner status: idle | requesting | running | denied | disabled
  const [status, setStatus] = useState(defaultEnabled ? "idle" : "disabled");

  // ✅ stream for preview bubble
  const streamRef = useRef(null);
  const [hasStream, setHasStream] = useState(false);

  // ✅ latest packet (fast read)
  const latestRef = useRef({
    x: 0.5,
    y: 0.5,
    pinch: false,
    swipe: null,
    confidence: 0,
    ts: 0,
  });

  // ✅ reactive bits (for UI helpers)
  const [pinch, setPinch] = useState(false);
  const [swipe, setSwipe] = useState(null);
  const [confidence, setConfidence] = useState(0);

  const lastPinchRef = useRef(false);

  const stopStream = useCallback(() => {
    try {
      const s = streamRef.current;
      if (s) s.getTracks().forEach((t) => t.stop());
    } catch {}
    streamRef.current = null;
    setHasStream(false);
  }, []);

  const setStream = useCallback(
    (stream) => {
      streamRef.current = stream || null;
      setHasStream(!!stream);
    },
    [setHasStream]
  );

  const setEnabled = useCallback(
    (next) => {
      const v = !!next;
      _setEnabled(v);

      if (!v) {
        // turn everything off
        stopStream();
        latestRef.current = { x: 0.5, y: 0.5, pinch: false, swipe: null, confidence: 0, ts: 0 };
        setPinch(false);
        setSwipe(null);
        setConfidence(0);
        lastPinchRef.current = false;
        setStatus("disabled");
      } else {
        setStatus("idle"); // runner will move -> requesting/running
      }
    },
    [stopStream]
  );

  const setPacket = useCallback((pkt) => {
    const prev = latestRef.current;

    const next = {
      x: typeof pkt?.x === "number" ? pkt.x : prev.x,
      y: typeof pkt?.y === "number" ? pkt.y : prev.y,
      pinch: !!(pkt?.pinch ?? pkt?.pinching),
      swipe: pkt?.swipe ?? null,
      confidence: typeof pkt?.confidence === "number" ? pkt.confidence : prev.confidence,
      ts: typeof pkt?.ts === "number" ? pkt.ts : Date.now(),
    };

    latestRef.current = next;

    // minimal reactive updates
    if (next.confidence !== confidence) setConfidence(next.confidence);

    if (next.pinch !== lastPinchRef.current) {
      lastPinchRef.current = next.pinch;
      setPinch(next.pinch);
    }

    if (next.swipe) {
      setSwipe(next.swipe);
      setTimeout(() => setSwipe(null), 0); // one-shot
    }
  }, [confidence]);

  const api = useMemo(
    () => ({
      // state
      enabled,
      status,
      pinch,
      swipe,
      confidence,

      // refs
      latestRef,
      streamRef,
      hasStream,

      // setters (runner uses these)
      setEnabled,
      setStatus,
      setStream,
      stopStream,
      setPacket,
    }),
    [enabled, status, pinch, swipe, confidence, hasStream, setEnabled, setStatus, setStream, stopStream, setPacket]
  );

  return <ARContext.Provider value={api}>{children}</ARContext.Provider>;
}
