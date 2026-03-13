import { colors } from "../styles/theme";
import FadeIn from "./FadeIn";
import { useLanguage } from "../i18n/LanguageContext";
import { getPublications } from "../data/publications";

export default function Publications() {
  const { lang, t } = useLanguage();
  const publications = getPublications(lang);
  const pub = publications[0];

  return (
    <section id="guide" className="py-24 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn>
          <p className="text-sky-500 font-mono text-xs tracking-widest uppercase mb-2 text-center">
            {t("publications.label")}
          </p>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-16 text-center text-white">
            {t("publications.heading")}
          </h2>
        </FadeIn>

        <FadeIn delay={150}>
          <div className="max-w-4xl mx-auto glass-panel rounded-3xl p-8 md:p-10 relative overflow-hidden group hover:border-white/20 transition-all duration-500">
            {/* Subtle glow on hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/5 to-blue-500/5 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-semibold tracking-wider text-white/80 bg-white/5 border border-white/10">
                  NEW
                </span>
              </div>

              <h3 className="text-2xl font-medium tracking-tight text-white mb-1">
                {pub.title}
              </h3>
              <p className="text-sm font-medium text-sky-400 mb-4">
                {pub.subtitle}
              </p>

              <p className="leading-relaxed mb-6 text-white/50">
                {pub.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {pub.stats.map((s) => (
                  <div
                    key={s.label}
                    className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    <div className="text-xl font-bold text-white">
                      {s.value}
                    </div>
                    <div className="text-xs mt-1 text-white/40">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Topic tags */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {pub.topics.map((topic) => (
                  <span
                    key={topic}
                    className="text-[10px] px-2 py-1 rounded text-white/30 bg-white/5"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-3">
                <a
                  href={pub.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
                >
                  {pub.linkLabel}
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    className="group-hover/btn:translate-x-0.5 transition-transform"
                  >
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
