import { useState } from "react";

// Option 1: Wave dots
function WaveDots() {
  return (
    <div className="flex items-center gap-1.5">
      <svg width="40" height="16" viewBox="0 0 40 16">
        {[0, 1, 2, 3].map((i) => (
          <circle
            key={i}
            cx={5 + i * 10}
            cy="8"
            r="3"
            fill="currentColor"
            opacity="0.7"
            style={{
              animation: `waveDot 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </svg>
      <span className="text-xs text-gray-400">Se actualizează știrile</span>
      <style>{`
        @keyframes waveDot {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Option 2: Scanning lines (news loading feel)
function ScanningLines() {
  return (
    <div className="flex items-center gap-3">
      <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x="0"
            y={i * 5}
            height="3"
            rx="1.5"
            fill="currentColor"
            style={{
              animation: `scanLine 1.6s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
              width: i === 3 ? "14" : "24",
            }}
          />
        ))}
        <style>{`
          @keyframes scanLine {
            0%, 100% { opacity: 0.15; }
            50% { opacity: 0.9; }
          }
        `}</style>
      </svg>
      <span className="text-xs text-gray-400">Se actualizează știrile</span>
    </div>
  );
}

// Option 3: Radar sweep
function RadarSweep() {
  return (
    <div className="flex items-center gap-3">
      <svg width="20" height="20" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.2" />
        <circle cx="10" cy="10" r="5" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.15" />
        <line
          x1="10" y1="10" x2="10" y2="1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{ transformOrigin: "10px 10px", animation: "radarSpin 1.5s linear infinite" }}
        />
        <circle cx="10" cy="10" r="1.5" fill="currentColor" opacity="0.6" />
        <style>{`
          @keyframes radarSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </svg>
      <span className="text-xs text-gray-400">Se actualizează știrile</span>
    </div>
  );
}

// Option 4: Morphing newspaper icon
function NewspaperMorph() {
  return (
    <div className="flex items-center gap-3">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
        {[0,1,2].map((i) => (
          <rect
            key={i}
            x="5"
            y={5 + i * 4}
            height="2"
            rx="1"
            fill="currentColor"
            style={{
              animation: `lineGrow 1.8s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
              width: i === 2 ? 6 : 10,
            }}
          />
        ))}
        <style>{`
          @keyframes lineGrow {
            0%, 100% { opacity: 0.2; transform: scaleX(0.4); transform-origin: left; }
            50% { opacity: 0.9; transform: scaleX(1); transform-origin: left; }
          }
        `}</style>
      </svg>
      <span className="text-xs text-gray-400">Se actualizează știrile</span>
    </div>
  );
}

// Option 5: Typewriter cursor blink on text
function TypewriterPulse() {
  return (
    <div className="flex items-center gap-1 text-xs text-gray-400">
      <span>Se actualizează știrile</span>
      <span style={{ animation: "cursorBlink 1s step-end infinite", opacity: 1 }}>|</span>
      <style>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const options = [
  { id: 1, label: "Wave dots", Component: WaveDots },
  { id: 2, label: "Scanning lines", Component: ScanningLines },
  { id: 3, label: "Radar sweep", Component: RadarSweep },
  { id: 4, label: "Newspaper morph", Component: NewspaperMorph },
  { id: 5, label: "Typewriter cursor", Component: TypewriterPulse },
];

export default function Preview() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ background: "#0f0f0f", minHeight: "100vh", padding: "40px", fontFamily: "system-ui" }}>
      <p style={{ color: "#666", fontSize: "11px", marginBottom: "32px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Loading animation options — thesite.ro
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {options.map(({ id, label, Component }) => (
          <div
            key={id}
            onClick={() => setSelected(id)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderRadius: "999px",
              border: `1px solid ${selected === id ? "#4ade80" : "#222"}`,
              background: selected === id ? "#0a1f0e" : "#111",
              cursor: "pointer",
              transition: "all 0.2s",
              color: "#aaa",
            }}
          >
            <Component />
            <span style={{ fontSize: "10px", color: "#444", letterSpacing: "0.08em" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
      {selected && (
        <p style={{ color: "#4ade80", fontSize: "12px", marginTop: "24px" }}>
          Selectat: opțiunea {selected} — spune-mi și implementez în codebase
        </p>
      )}
    </div>
  );
}
