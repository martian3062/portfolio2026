import { useContext, useEffect, useRef } from "react";
import { ARContext } from "./ARProvider.jsx";
import {
  HandLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

const clamp01 = (n) => Math.max(0, Math.min(1, n));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Pinch hysteresis (stable)
const PINCH_ON = 0.065;
const PINCH_OFF = 0.085;

/* 🔥 GLOBAL SINGLETON GUARD */
let AR_STARTED = false;

export default function useAR() {
  const ctx = useContext(ARContext);
  if (!ctx) throw new Error("useAR must be used inside <ARProvider>.");

  const {
    enabled,
    latestRef,
    setPinch,
    setConfidence,
    setEvents,
    setStatus,
    setStream,
  } = ctx;

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const landmarkerRef = useRef(null);
  const rafRef = useRef(0);

  const lastPosRef = useRef(null);
  const lastSwipeTs = useRef(0);
  const lastZoomDist = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    if (AR_STARTED) return;
    AR_STARTED = true;

    let stopped = false;
    setStatus("requesting");

    /* ---------------- VIDEO ELEMENT ---------------- */
    const video = document.createElement("video");
    video.playsInline = true;
    video.muted = true;
    video.autoplay = true;
    video.style.display = "none";
    document.body.appendChild(video);
    videoRef.current = video;

    async function init() {
      /* ---------------- CAMERA SAFETY CHECK ---------------- */
      const mediaDevices =
        (typeof window !== "undefined" &&
          window.navigator &&
          window.navigator.mediaDevices) ||
        null;

      if (!mediaDevices?.getUserMedia) {
        console.error(
          "❌ Camera API not available. Use HTTPS or localhost."
        );
        setStatus("denied");
        return;
      }

      /* ---------------- TASKS VISION ---------------- */
      const fileset = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      landmarkerRef.current =
        await HandLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
        });

      /* ---------------- CAMERA STREAM ---------------- */
      const stream = await mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      if (stopped) return;

      streamRef.current = stream;
      video.srcObject = stream;
      setStream(stream);

      await video.play();
      setStatus("tracking");

      /* ---------------- MAIN LOOP ---------------- */
      const loop = () => {
        if (stopped) return;

        const now = performance.now();
        const res =
          landmarkerRef.current.detectForVideo(video, now);

        const hands = res?.landmarks;

        if (!hands || hands.length === 0) {
          setConfidence(0);
          setPinch(false);
          rafRef.current = requestAnimationFrame(loop);
          return;
        }

        /* ---------- PRIMARY HAND ---------- */
        const lm = hands[0];
        const index = lm[8];
        const thumb = lm[4];

        const x = clamp01(index.x);
        const y = clamp01(index.y);
        const ts = Date.now();

        /* ---------- PINCH (STABLE) ---------- */
        const prevPinch = latestRef.current?.pinch ?? false;
        const d = dist(index, thumb);

        let isPinch = prevPinch;
        if (!prevPinch && d < PINCH_ON) isPinch = true;
        if (prevPinch && d > PINCH_OFF) isPinch = false;

        latestRef.current = {
          x,
          y,
          ts,
          pinch: isPinch,
          confidence: 1,
          rawLandmarks: lm, // 👈 for skeleton if needed
        };

        setConfidence(1);
        setPinch(isPinch);

        /* ---------- SWIPE ---------- */
        if (lastPosRef.current) {
          const dx = x - lastPosRef.current.x;
          const dy = y - lastPosRef.current.y;
          const dt = ts - lastPosRef.current.ts;

          if (dt < 220 && Math.hypot(dx, dy) > 0.12) {
            const nowT = Date.now();
            if (nowT - lastSwipeTs.current > 450) {
              lastSwipeTs.current = nowT;
              setEvents({
                swipe:
                  Math.abs(dx) > Math.abs(dy)
                    ? dx > 0
                      ? "right"
                      : "left"
                    : dy > 0
                    ? "down"
                    : "up",
              });
            }
          }
        }

        lastPosRef.current = { x, y, ts };

        /* ---------- TWO-HAND ZOOM ---------- */
        if (hands.length === 2) {
          const a = hands[0][8];
          const b = hands[1][8];
          const dz = dist(a, b);

          if (lastZoomDist.current == null) {
            lastZoomDist.current = dz;
          } else {
            const delta = dz - lastZoomDist.current;
            if (Math.abs(delta) > 0.015) {
              setEvents({ zoom: delta > 0 ? "out" : "in" });
              lastZoomDist.current = dz;
            }
          }
        } else {
          lastZoomDist.current = null;
        }

        rafRef.current = requestAnimationFrame(loop);
      };

      loop();
    }

    init().catch((err) => {
      console.error("AR init failed:", err);
      setStatus("denied");
    });

    /* ---------------- CLEANUP ---------------- */
    return () => {
      stopped = true;
      AR_STARTED = false;

      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      landmarkerRef.current?.close();
      video.remove();

      setStream(null);
      setStatus("idle");
    };
  }, [
    enabled,
    latestRef,
    setPinch,
    setConfidence,
    setEvents,
    setStatus,
    setStream,
  ]);

  return ctx;
}
