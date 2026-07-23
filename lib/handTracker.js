/**
 * MediaPipe Hands tracker — runs GestureRecognizer in the main thread
 * via @mediapipe/tasks-vision (WASM + GPU delegate).
 *
 * Usage:
 *   const tracker = await createHandTracker()
 *   const result  = tracker.detect(videoElement)   // call each frame
 *   tracker.close()
 */

import {
  GestureRecognizer,
  FilesetResolver,
} from '@mediapipe/tasks-vision'

let _recognizer    = null
let _initPromise   = null
let _lastDetectTs  = -1   // tracks last floored ms passed to MediaPipe

export async function createHandTracker() {
  if (_initPromise) return _initPromise

  _initPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm'
    )

    _recognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
        delegate: 'GPU',
      },
      runningMode:        'VIDEO',
      numHands:           2,
      minHandDetectionConfidence: 0.55,
      minHandPresenceConfidence:  0.55,
      minTrackingConfidence:      0.50,
    })

    return {
      /**
       * Detect hands in a video frame.
       * Returns { landmarks, handednesses, gestures } arrays (one entry per hand).
       */
      detect(video, timestampMs) {
        if (!_recognizer || video.readyState < 2 || video.videoWidth === 0) return null
        // MediaPipe converts ms→μs internally; floor to int to prevent
        // sub-ms jitter from producing identical μs timestamps → monotonic error
        const ts = Math.floor(timestampMs)
        if (ts <= _lastDetectTs) return null
        _lastDetectTs = ts
        try {
          return _recognizer.recognizeForVideo(video, ts)
        } catch {
          return null
        }
      },
      close() {
        _recognizer?.close()
        _recognizer   = null
        _initPromise  = null
        _lastDetectTs = -1
      },
    }
  })()

  return _initPromise
}

// ─── Landmark indices (MediaPipe 21-point hand model) ────────────────────────
export const LM = {
  WRIST: 0,
  THUMB_CMC: 1, THUMB_MCP: 2, THUMB_IP: 3, THUMB_TIP: 4,
  INDEX_MCP: 5, INDEX_PIP: 6, INDEX_DIP: 7, INDEX_TIP: 8,
  MIDDLE_MCP: 9, MIDDLE_PIP: 10, MIDDLE_DIP: 11, MIDDLE_TIP: 12,
  RING_MCP: 13, RING_PIP: 14, RING_DIP: 15, RING_TIP: 16,
  PINKY_MCP: 17, PINKY_PIP: 18, PINKY_DIP: 19, PINKY_TIP: 20,
}

export const HAND_CONNECTIONS = [
  [LM.WRIST, LM.THUMB_CMC], [LM.THUMB_CMC, LM.THUMB_MCP],
  [LM.THUMB_MCP, LM.THUMB_IP], [LM.THUMB_IP, LM.THUMB_TIP],
  [LM.WRIST, LM.INDEX_MCP], [LM.INDEX_MCP, LM.INDEX_PIP],
  [LM.INDEX_PIP, LM.INDEX_DIP], [LM.INDEX_DIP, LM.INDEX_TIP],
  [LM.WRIST, LM.MIDDLE_MCP], [LM.MIDDLE_MCP, LM.MIDDLE_PIP],
  [LM.MIDDLE_PIP, LM.MIDDLE_DIP], [LM.MIDDLE_DIP, LM.MIDDLE_TIP],
  [LM.WRIST, LM.RING_MCP], [LM.RING_MCP, LM.RING_PIP],
  [LM.RING_PIP, LM.RING_DIP], [LM.RING_DIP, LM.RING_TIP],
  [LM.WRIST, LM.PINKY_MCP], [LM.PINKY_MCP, LM.PINKY_PIP],
  [LM.PINKY_PIP, LM.PINKY_DIP], [LM.PINKY_DIP, LM.PINKY_TIP],
  [LM.INDEX_MCP, LM.MIDDLE_MCP], [LM.MIDDLE_MCP, LM.RING_MCP],
  [LM.RING_MCP, LM.PINKY_MCP],
]

// ─── Gesture helpers ─────────────────────────────────────────────────────────

/** Returns wrist position {x,y} normalised 0-1 (x flipped for mirror mode). */
export function getWristNorm(landmarks) {
  const w = landmarks[LM.WRIST]
  return { x: 1 - w.x, y: w.y }
}

/**
 * Returns the pinch distance (index-tip ↔ thumb-tip), normalised by hand size.
 * <0.07 = tight pinch, >0.2 = open.
 */
export function getPinchStrength(landmarks) {
  const it = landmarks[LM.INDEX_TIP]
  const tt = landmarks[LM.THUMB_TIP]
  const wrist = landmarks[LM.WRIST]
  const mid   = landmarks[LM.MIDDLE_MCP]
  const handSize = Math.hypot(wrist.x - mid.x, wrist.y - mid.y) + 0.0001
  return Math.hypot(it.x - tt.x, it.y - tt.y) / handSize
}

/**
 * Returns "string pull" value 0-1 based on how closed the fist is.
 * 1 = fist (strong pull), 0 = open hand (slack string).
 */
export function getStringPull(landmarks) {
  const tips  = [LM.INDEX_TIP, LM.MIDDLE_TIP, LM.RING_TIP, LM.PINKY_TIP]
  const mcps  = [LM.INDEX_MCP, LM.MIDDLE_MCP, LM.RING_MCP, LM.PINKY_MCP]
  let curl = 0
  for (let i = 0; i < 4; i++) {
    const tip = landmarks[tips[i]]
    const mcp = landmarks[mcps[i]]
    const wrist = landmarks[LM.WRIST]
    // Tip closer to wrist than MCP = curled
    const d_tip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y)
    const d_mcp = Math.hypot(mcp.x - wrist.x, mcp.y - wrist.y)
    curl += d_tip < d_mcp ? 1 : 0
  }
  return curl / 4
}
