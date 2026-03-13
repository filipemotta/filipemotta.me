import { colors } from "../styles/theme";
import useInView from "../hooks/useInView";

export default function SkillBar({ name, level, delay = 0 }) {
  const { ref, isVisible } = useInView(0.3);

  return (
    <div ref={ref} className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="text-sm font-medium text-white/80">
          {name}
        </span>
        <span className="text-xs font-mono text-white/30">
          {isVisible ? level : 0}%
        </span>
      </div>
      <div className="h-1 rounded-full overflow-hidden bg-white/5">
        <div
          className="h-full rounded-full relative overflow-hidden"
          style={{
            width: isVisible ? `${level}%` : "0%",
            background: `linear-gradient(90deg, rgba(14,165,233,0.5), ${colors.accent})`,
            transition: `width 1.2s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
            boxShadow: isVisible ? `0 0 12px ${colors.accentGlow}` : "none",
          }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{ animation: isVisible ? "shimmer 2s infinite" : "none" }}
          />
        </div>
      </div>
    </div>
  );
}
