import { colors } from "../styles/theme";
import FadeIn from "./FadeIn";

export default function TimelineItem({ job, index }) {
  return (
    <FadeIn delay={index * 120}>
      <div
        className="rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col"
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-bold" style={{ color: colors.white }}>
            {job.title}
          </h3>
          <span className="text-sm font-semibold" style={{ color: colors.teal }}>
            {job.category}
          </span>
        </div>

        {/* Bullets */}
        <ul className="space-y-2 mt-2 flex-1">
          {job.bullets.map((b, i) => (
            <li
              key={i}
              className="flex gap-2.5 text-sm leading-relaxed"
              style={{ color: colors.gray }}
            >
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: colors.teal }}
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-1.5 mt-5">
          {job.tech.map((t) => (
            <span
              key={t}
              className="text-xs px-2 py-0.5 rounded"
              style={{
                background: "#0F1C24",
                color: colors.teal,
                border: `1px solid ${colors.teal}20`,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}
