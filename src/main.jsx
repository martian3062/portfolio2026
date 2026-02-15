import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";

import App from "./App.jsx";
import KaranvirRetro from "./pages/KaranvirRetro.jsx";
import PardeepInterstellar from "./pages/PardeepInterstellar.jsx";
import DeepanshuPage from "./pages/DeepanshuPage.jsx";

import ARProvider from "./ar/ARProvider.jsx";
import ARCursor from "./ar/ARCursor.jsx";
import ARPreviewBubble from "./ar/ARPreviewBubble.jsx";

function KaranvirPage() {
  return <KaranvirRetro />;
}

function PardeepPage() {
  return <PardeepInterstellar />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <ARProvider defaultEnabled={true}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/pardeep" element={<PardeepPage />} />
        <Route path="/karanvir" element={<KaranvirPage />} />
        <Route path="/deepanshu" element={<DeepanshuPage />} />
      </Routes>
    </BrowserRouter>

    {/* ONLY DOT CURSOR + CAMERA HUD */}
    <ARCursor />
    <ARPreviewBubble />
  </ARProvider>
);
