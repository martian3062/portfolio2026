// src/ar/ARSocket.js
// ✅ Frontend-only (MediaPipe mode) ARSocket stub
// Keeps the same API so legacy imports don’t break,
// but DOES NOT open WebSocket connections.

export class ARSocket {
  constructor({
    getUrl,
    onMessage,
    onStatus,
    heartbeatMs = 0,
    parseJson = true,
    maxRetryDelay = 8000,
    baseRetryDelay = 500,
  } = {}) {
    this.getUrl = getUrl;
    this.onMessage = onMessage;
    this.onStatus = onStatus;

    // kept only for signature compatibility
    this.heartbeatMs = heartbeatMs;
    this.parseJson = parseJson;
    this.maxRetryDelay = maxRetryDelay;
    this.baseRetryDelay = baseRetryDelay;

    this.closedByUser = false;
    this._lastUrl = "local-mediapipe";
  }

  connect() {
    this.closedByUser = false;
    const url = this.getUrl?.() || "local-mediapipe";
    this._lastUrl = url;

    // Immediately report local "connected"
    this.onStatus?.({ status: "local", url });
  }

  // no-op
  send(_obj) {
    return false;
  }

  close() {
    this.closedByUser = true;
    this.onStatus?.({ status: "closed", url: this._lastUrl });
  }
}
