import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";

import PardeepInterstellar from "./pages/PardeepInterstellar.jsx";

import ARProvider from "./ar/ARProvider.jsx";
import ARCursor from "./ar/ARCursor.jsx";
import ARPreviewBubble from "./ar/ARPreviewBubble.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ARProvider defaultEnabled={true}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PardeepInterstellar />} />
        <Route path="/pardeep" element={<PardeepInterstellar />} />
      </Routes>
    </BrowserRouter>

    {/* ONLY DOT CURSOR + CAMERA HUD */}
    <ARCursor />
    <ARPreviewBubble />
  </ARProvider>
);
