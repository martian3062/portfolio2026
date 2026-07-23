import { useEffect } from "react";
import useAR from "./useAR";

/**
 * ✅ ARRunner
 * - Mount ONCE
 * - Starts camera + MediaPipe
 */
export default function ARRunner() {
  useAR(); // 👈 this starts the camera loop
  return null;
}
