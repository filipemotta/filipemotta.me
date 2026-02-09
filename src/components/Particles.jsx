import { useMemo } from "react";

export default function Particles({ count = 20 }) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 2 + Math.random() * 3,
        dur: 15 + Math.random() * 25,
        delay: Math.random() * 10,
      })),
    [count]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: "#3FBDB6",
            opacity: 0.15,
            animation: `particleFloat ${p.dur}s ease-in-out ${p.delay}s infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes particleFloat {
          0%   { transform: translateY(0) translateX(0); }
          100% { transform: translateY(-80px) translateX(40px); }
        }
      `}</style>
    </div>
  );
}
