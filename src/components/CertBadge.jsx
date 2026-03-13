import { colors } from "../styles/theme";
import FadeIn from "./FadeIn";

export default function CertBadge({ cert, index }) {
  return (
    <FadeIn delay={index * 80}>
      <div className="glass-panel flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-lg group">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300">
          <img
            src={cert.logo}
            alt={cert.org}
            width="22"
            height="22"
            loading="lazy"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-white">
            {cert.name}
          </p>
          <p className="text-xs text-white/40">
            {cert.org}
          </p>
        </div>
      </div>
    </FadeIn>
  );
}
