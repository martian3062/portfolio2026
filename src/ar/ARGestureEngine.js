export function detectGesture(landmarks) {
  if (!landmarks) return null;

  const d = (a, b) =>
    Math.hypot(a.x - b.x, a.y - b.y);

  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const palm = landmarks[0];

  const pinch = d(thumb, index) < 0.05;
  const fist =
    d(index, palm) < 0.12 &&
    d(middle, palm) < 0.12;

  const openPalm =
    d(index, palm) > 0.2 &&
    d(middle, palm) > 0.2;

  if (pinch) return "PINCH";
  if (fist) return "FIST";
  if (openPalm) return "PALM";

  return "POINT";
}
