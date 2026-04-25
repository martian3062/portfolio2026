import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";

import App from "./App.jsx";
import PardeepInterstellar from "./pages/PardeepInterstellar.jsx";

import ARProvider from "./ar/ARProvider.jsx";
import ARCursor from "./ar/ARCursor.jsx";
import ARPreviewBubble from "./ar/ARPreviewBubble.jsx";

function PardeepPage() {
  return <PardeepInterstellar />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <ARProvider defaultEnabled={true}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/pardeep" element={<PardeepPage />} />
      </Routes>
    </BrowserRouter>

    {/* ONLY DOT CURSOR + CAMERA HUD */}
    <ARCursor />
    <ARPreviewBubble />
  </ARProvider>
);
