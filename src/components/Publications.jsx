import { colors } from "../styles/theme";
import FadeIn from "./FadeIn";
import publications from "../data/publications";

export default function Publications() {
  const pub = publications[0];

  return (
    <section id="guide" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn>
          <p
            className="text-sm font-semibold tracking-widest uppercase mb-3 text-center"
            style={{ color: colors.teal }}
          >
            Author
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold mb-16 text-center"
            style={{ color: colors.white }}
          >
            DevOps with AI Guide
          </h2>
        </FadeIn>

        <FadeIn delay={150}>
          <div
            className="max-w-4xl mx-auto rounded-xl p-8 md:p-10"
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}
          >
            <h3
              className="text-2xl font-bold mb-1"
              style={{ color: colors.white }}
            >
              {pub.title}
            </h3>
            <p
              className="text-sm font-semibold mb-4"
              style={{ color: colors.teal }}
            >
              {pub.subtitle}
            </p>

            <p
              className="leading-relaxed mb-6"
              style={{ color: colors.gray }}
            >
              {pub.description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {pub.stats.map((s) => (
                <div
                  key={s.label}
                  className="text-center p-3 rounded-lg"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${colors.cardBorder}`,
                  }}
                >
                  <div
                    className="text-xl font-bold"
                    style={{ color: colors.teal }}
                  >
                    {s.value}
                  </div>
                  <div
                    className="text-xs mt-1"
                    style={{ color: colors.gray }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Topic tags */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {pub.topics.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    background: "#0F1C24",
                    color: colors.teal,
                    border: `1px solid rgba(63,189,182,0.12)`,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>

            {/* CTA */}
            <a
              href={pub.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: colors.teal, color: colors.dark }}
            >
              {pub.linkLabel}
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
