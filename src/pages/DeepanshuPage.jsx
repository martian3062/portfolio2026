import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    title: "Deepanshu",
    subtitle: "Computer Science Engineer • AI + Full-Stack Builder",
    bullets: [
      "B.E. CSE, Chandigarh University (2022–2026) • GPA: 7.3",
      "Focused on AI systems, web engineering, and practical deployments",
      "Portfolio: https://portfoliov32026.vercel.app",
    ],
  },
  {
    title: "Education",
    subtitle: "Academic Background",
    bullets: [
      "Chandigarh University — B.E. Computer Science Engineering (Sept 2022 – June 2026)",
      "Little Angel Public School — 10+2 PCM (91%), H.P. Board (2021)",
      "Him Heritage Public School — 10th (88.29%), H.P. Board (2019)",
    ],
  },
  {
    title: "Projects",
    subtitle: "Applied AI + Product Builds",
    bullets: [
      "CV2X AI-Driven Smart Traffic Control: privacy-preserving multi-agent optimization with YOLO/OpenCV + RL",
      "Built zero-knowledge C-V2X overlay with ambulance green corridor pre-emption",
      "LearnEasy Personalized Learning Bot: Groq LLaMA 3.1, Flask API, Supabase, Ipyvizzu, n8n",
    ],
  },
  {
    title: "Research Papers",
    subtitle: "Publications (2025)",
    bullets: [
      "Wavelet-Based Terrain Generation (IEEE DELCON 2025)",
      "Performance-Oriented Study of Fake News Detection (ICCCA 2025)",
    ],
  },
  {
    title: "Skills & Contact",
    subtitle: "Tech Stack Snapshot",
    bullets: [
      "Programming: Python, JavaScript, Go, C++",
      "AI/ML: PyTorch, LightGBM, ARIMA, OpenCV, AirLLM, ComfyUI",
      "Web/Backend: Flask, Django, Echo, Gin, MERN, WebRTC",
      "Phone: +91 9115142618 • Email: deeps3062t@gmail.com",
    ],
  },
];

export default function DeepanshuPage() {
  const [index, setIndex] = useState(0);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const navigate = useNavigate();

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  const handleMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setPos({ x, y });
  };

  return (
    <div className="dp-wrap">
      <div className="dp-bg" />

      {/* NEW: Home button */}
      <button className="dp-home-btn" onClick={() => navigate("/")}>
        ⌂ Home
      </button>

      <div className="dp-topbar">
        <button onClick={prev} className="dp-btn">← Prev</button>
        <div className="dp-counter">Slide {index + 1} / {slides.length}</div>
        <button onClick={next} className="dp-btn">Next →</button>
      </div>

      <div className="dp-stage">
        <AnimatePresence mode="wait">
          <motion.section
            key={index}
            className="dp-slide glow-reactive"
            style={{
              "--mx": `${pos.x}%`,
              "--my": `${pos.y}%`,
            }}
            onMouseMove={handleMove}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.28 }}
          >
            <h1>{slides[index].title}</h1>
            <p className="dp-sub">{slides[index].subtitle}</p>
            <ul>
              {slides[index].bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </motion.section>
        </AnimatePresence>
      </div>

      <div className="dp-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`dp-dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
