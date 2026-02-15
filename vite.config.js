import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  plugins: [
    react(),
    mkcert(), // 🔥 enables trusted HTTPS certificates
  ],
  server: {
    https: true,  // 🔒 REQUIRED for camera access
    host: true,   // allows LAN / mobile testing
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});
