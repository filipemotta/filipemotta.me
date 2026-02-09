import { colors } from "../styles/theme";
import FadeIn from "./FadeIn";

export default function CertBadge({ cert, index }) {
  return (
    <FadeIn delay={index * 80}>
      <div
        className="flex items-center gap-3 p-4 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
        }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: colors.tealDim }}
        >
          <img
            src={cert.logo}
            alt={cert.org}
            width="22"
            height="22"
            loading="lazy"
          />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: colors.white }}>
            {cert.name}
          </p>
          <p className="text-xs" style={{ color: colors.gray }}>
            {cert.org}
          </p>
        </div>
      </div>
    </FadeIn>
  );
}
