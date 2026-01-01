// src/ar/ARMediaPipeRunner.jsx
import { useEffect, useRef } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import useAR from "./useAR";

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

function dist(a, b) {
  const dx = (a.x - b.x);
  const dy = (a.y - b.y);
  return Math.sqrt(dx * dx + dy * dy);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * ✅ ARMediaPipeRunner
 * - owns camera + MediaPipe HandLandmarker
 * - writes into ARProvider via ar.setPacket(...)
 * - NO UI (headless)
 *
 * Output packet shape:
 * { x, y, confidence, pinch, swipe, ts }
 */
export default function ARMediaPipeRunner({
  active = true,

  // tuning
  minConfidence = 0.35,     // below this we hide cursor
  smooth = 0.28,            // cursor smoothing
  pinchCooldownMs = 260,    // avoid pinch spam
  swipeCooldownMs = 420,    // avoid swipe spam
  swipeThreshold = 0.16,    // accumulator threshold

  // camera
  facingMode = "user",
}) {
  const ar = useAR();

  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);

  const smoothRef = useRef({ x: 0.5, y: 0.5 });

  const pinchRef = useRef({ pinching: false, lastClickAt: 0 });
  const swipeRef = useRef({ lastX: 0.5, lastTs: 0, acc: 0, lastEmitAt: 0 });

  useEffect(() => {
    let alive = true;
    let raf = 0;
    let stream = null;

    async function init() {
      try {
        if (!active) return;
        if (!ar) return;

        // If disabled, keep status consistent
        if (ar.enabled === false) {
          ar.setStatus?.("disabled");
          ar.setPacket?.({ confidence: 0, pinch: false, swipe: null });
          return;
        }

        ar.setStatus?.("requesting");

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (!alive) return;

        ar.setStream?.(stream);

        const v = videoRef.current;
        if (!v) return;

        v.srcObject = stream;
        v.muted = true;
        v.playsInline = true;

        // autoplay might be blocked, but detectForVideo will still work once it can play
        v.play().catch(() => {});

        // MediaPipe WASM + model
        const wasm = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm"
        );

        if (!alive) return;

        const modelUrl =
          import.meta.env.VITE_MP_HAND_MODEL_URL ||
          "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

        const landmarker = await HandLandmarker.createFromOptions(wasm, {
          baseOptions: { modelAssetPath: modelUrl },
          runningMode: "VIDEO",
          numHands: 1,
        });

        if (!alive) return;

        landmarkerRef.current = landmarker;
        ar.setStatus?.("running");

        const tick = () => {
          raf = requestAnimationFrame(tick);
          if (!alive) return;

          // if app toggles AR off, stop emitting
          if (!active || ar.enabled === false) {
            ar.setPacket?.({ confidence: 0, pinch: false, swipe: null });
            return;
          }

          const video = videoRef.current;
          const lm = landmarkerRef.current;
          if (!video || !lm) return;

          if (video.readyState < 2) return;

          const t = performance.now();
          const res = lm.detectForVideo(video, t);
          const hand = res?.handLandmarks?.[0];

          if (!hand) {
            ar.setPacket?.({ confidence: 0, pinch: false, swipe: null });
            return;
          }

          // MediaPipe landmark indices:
          // 8: index tip, 4: thumb tip, 0: wrist, 9: middle MCP (for rough scale)
          const indexTip = hand[8];
          const thumbTip = hand[4];
          const wrist = hand[0];
          const midMcp = hand[9];

          // Cursor = index tip, mirror X for selfie
          const tx = clamp01(1 - indexTip.x);
          const ty = clamp01(indexTip.y);

          // Smooth cursor
          smoothRef.current.x = lerp(smoothRef.current.x, tx, smooth);
          smoothRef.current.y = lerp(smoothRef.current.y, ty, smooth);

          // Hand "confidence" proxy: if landmarks exist, set high.
          // You can make this smarter later if needed.
          const conf = 1;

          // Pinch detection (distance relative to hand size)
          const handScale = Math.max(0.08, dist(wrist, midMcp));
          const pinchD = dist(indexTip, thumbTip);
          const pinchingNow = pinchD < handScale * 0.35;

          // Swipe detection by X velocity accumulator
          const sw = swipeRef.current;
          const now = performance.now();
          const dx = smoothRef.current.x - sw.lastX;
          const dt = now - (sw.lastTs || now);
          sw.lastX = smoothRef.current.x;
          sw.lastTs = now;

          let swipe = null;

          if (dt > 0 && dt < 90) {
            sw.acc += dx;
            sw.acc *= 0.92; // decay

            const canEmit = now - sw.lastEmitAt > swipeCooldownMs;

            if (canEmit && sw.acc > swipeThreshold) {
              swipe = "right";
              sw.acc = 0;
              sw.lastEmitAt = now;
            } else if (canEmit && sw.acc < -swipeThreshold) {
              swipe = "left";
              sw.acc = 0;
              sw.lastEmitAt = now;
            }
          }

          // Optional: gate confidence
          const outConf = conf >= minConfidence ? conf : 0;

          // Emit packet (provider handles one-shot swipe and pinch state)
          ar.setPacket?.({
            x: smoothRef.current.x,
            y: smoothRef.current.y,
            confidence: outConf,
            pinch: pinchingNow,
            swipe,
            ts: Date.now(),
          });

          // (Optional) pinch click pulse event (not required for your current logic)
          const p = pinchRef.current;
          if (pinchingNow && !p.pinching) {
            const ok = performance.now() - p.lastClickAt > pinchCooldownMs;
            if (ok) {
              p.lastClickAt = performance.now();
              ar.emitPinchClick?.();
            }
          }
          p.pinching = pinchingNow;
        };

        raf = requestAnimationFrame(tick);
      } catch (e) {
        console.error("ARMediaPipeRunner error:", e);
        if (!alive) return;
        ar?.setStatus?.("denied");
        ar?.setPacket?.({ confidence: 0, pinch: false, swipe: null });
      }
    }

    init();
    if (!active) return;

// ✅ do NOT request camera unless enabled
if (ar.enabled === false) {
  ar.setStatus?.("disabled");
  ar.setPacket?.({ confidence: 0, pinch: false, swipe: null });
  return;
}

    return () => {
      alive = false;
      cancelAnimationFrame(raf);

      try {
        landmarkerRef.current?.close?.();
      } catch {}
      landmarkerRef.current = null;

      try {
        if (stream) {
          stream.getTracks().forEach((t) => t.stop());
        }
      } catch {}

      // tell provider stream is gone
      ar?.stopStream?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ar?.enabled]);

  // Hidden inference video (no UI)
  return (
    <video
      ref={videoRef}
      style={{ display: "none" }}
      muted
      playsInline
      preload="auto"
    />
  );
}
