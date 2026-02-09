import { colors } from "../styles/theme";
import useInView from "../hooks/useInView";

export default function SkillBar({ name, level, delay = 0 }) {
  const { ref, isVisible } = useInView(0.3);

  return (
    <div ref={ref} className="mb-4">
      <div className="mb-1.5">
        <span className="text-sm font-medium" style={{ color: colors.white }}>
          {name}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#1E2A35" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: isVisible ? `${level}%` : "0%",
            background: `linear-gradient(90deg, ${colors.teal}, #2DD4BF)`,
            transition: `width 1.2s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
            boxShadow: isVisible ? `0 0 12px ${colors.tealGlow}` : "none",
          }}
        />
      </div>
    </div>
  );
}
