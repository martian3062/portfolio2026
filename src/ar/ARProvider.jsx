import React, {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

export const ARContext = createContext(null);

export default function ARProvider({ children, defaultEnabled = true }) {
  // master AR toggle
  const [enabled, setEnabled] = useState(!!defaultEnabled);

  // idle | requesting | tracking | denied | disabled
  const [status, setStatus] = useState(
    defaultEnabled ? "idle" : "disabled"
  );

  // latest hand packet (authoritative, no rerenders)
  const latestRef = useRef({
    x: 0.5,
    y: 0.5,
    pinch: false,
    confidence: 0,
    ts: 0,
  });

  // reactive UI state
  const [pinch, setPinch] = useState(false);
  const [confidence, setConfidence] = useState(0);

  // gesture events (one–shot)
  const [events, setEvents] = useState({});

  // camera stream (optional preview usage)
  const streamRef = useRef(null);
  const [hasStream, setHasStream] = useState(false);

  const stopStream = useCallback(() => {
    try {
      const s = streamRef.current;
      if (s) s.getTracks().forEach((t) => t.stop());
    } catch {}
    streamRef.current = null;
    setHasStream(false);
  }, []);

  const setStream = useCallback((stream) => {
    streamRef.current = stream || null;
    setHasStream(!!stream);
  }, []);

  const setAR = useCallback(
    (on) => {
      const v = !!on;
      setEnabled(v);

      if (!v) {
        stopStream();
        latestRef.current = {
          x: 0.5,
          y: 0.5,
          pinch: false,
          confidence: 0,
          ts: 0,
        };
        setPinch(false);
        setConfidence(0);
        setEvents({});
        setStatus("disabled");
      } else {
        setStatus("idle");
      }
    },
    [stopStream]
  );

  const api = useMemo(
    () => ({
      // state
      enabled,
      status,
      pinch,
      confidence,
      events,

      // refs
      latestRef,
      streamRef,
      hasStream,

      // setters (used by useAR.js)
      setEnabled: setAR,
      setStatus,
      setPinch,
      setConfidence,
      setEvents,
      setStream,
      stopStream,
    }),
    [
      enabled,
      status,
      pinch,
      confidence,
      events,
      hasStream,
      setAR,
      setStatus,
      setStream,
      stopStream,
    ]
  );

  return (
    <ARContext.Provider value={api}>
      {children}
    </ARContext.Provider>
  );
}
