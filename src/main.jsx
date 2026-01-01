// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import KaranvirRetro from "./pages/KaranvirRetro.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import App from "./App.jsx";
import PardeepInterstellar from "./pages/PardeepInterstellar.jsx";

import ARProvider from "./ar/ARProvider.jsx";
import ARMediaPipeRunner from "./ar/ARMediaPipeRunner.jsx";
import ARCursor from "./ar/ARCursor.jsx";
import ARPreviewBubble from "./ar/ARPreviewBubble.jsx";
<Route path="/karanvir" element={<KaranvirRetro />} />
function KaranvirPage() {
  <Route path="/karanvir" element={<KaranvirRetro />} />
  return <KaranvirRetro />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ARProvider defaultEnabled={false}>
      <ARMediaPipeRunner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/pardeep" element={<PardeepInterstellar />} />
          <Route path="/karanvir" element={<KaranvirPage />} />
        </Routes>
      </BrowserRouter>

      <ARCursor />
      <ARPreviewBubble />
    </ARProvider>
  </React.StrictMode>
);
