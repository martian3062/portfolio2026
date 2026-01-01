import React from "react";
import { Outlet, Link } from "react-router-dom";
import ARCursor from "../ar/ARCursor";

export default function Layout() {
  return (
    <div style={{ minHeight: "100vh", background: "#05040a", color: "#e6f6ff" }}>
      {/* Simple nav (swap with your Navbar later) */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          padding: "14px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(5,4,10,0.65)",
          backdropFilter: "blur(10px)",
          display: "flex",
          gap: 14,
        }}
      >
        <Link style={{ color: "#9ddcff", textDecoration: "none" }} to="/">
          Home
        </Link>
        <Link style={{ color: "#9ddcff", textDecoration: "none" }} to="/pardeep">
          Pardeep
        </Link>
        <Link style={{ color: "#9ddcff", textDecoration: "none" }} to="/karanvir">
          Karanvir
        </Link>
      </div>

      {/* Page content */}
      <div>
        <Outlet />
      </div>

      {/* ✅ GLOBAL AR cursor overlay (all pages) */}
      <ARCursor />
    </div>
  );
}
