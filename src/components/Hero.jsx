import { colors, fonts } from "../styles/theme";
import FadeIn from "./FadeIn";
import Counter from "./Counter";
import Particles from "./Particles";
import { useLanguage } from "../i18n/LanguageContext";
import { getHighlights } from "../data/highlights";

export default function Hero() {
  const { lang, t } = useLanguage();
  const highlights = getHighlights(lang);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
    >
      <Particles />

      {/* Gradient orbs — subtle */}
      <div
        className="absolute w-[60%] h-[60%] rounded-full blur-[120px] opacity-[0.08] pointer-events-none"
        style={{ background: colors.accent, top: "10%", right: "-10%" }}
      />
      <div
        className="absolute w-72 h-72 rounded-full blur-[100px] opacity-[0.05] pointer-events-none"
        style={{ background: "#8b5cf6", bottom: "20%", left: "5%" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
        {/* Badge */}
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8 hover:border-sky-500/30 hover:bg-white/10 transition-colors cursor-pointer group shadow-[0_0_10px_-5px_rgba(255,255,255,0.1)]">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
            </span>
            <span className="text-xs font-medium text-white tracking-wide">
              Available for projects
            </span>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-semibold tracking-tighter leading-[1.05] max-w-5xl mx-auto mb-8 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-sky-500/20 blur-[120px] -z-10 rounded-full pointer-events-none mix-blend-screen" />
            <span className="text-gradient">Filipe</span>
            <br className="hidden sm:block" />
            <span className="text-gradient-accent drop-shadow-[0_0_35px_rgba(56,189,248,0.4)]">
              Motta.
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={200}>
          <p className="text-lg sm:text-xl text-neutral-300 font-light max-w-2xl mx-auto leading-relaxed mb-4">
            {t("hero.subtitle")}
          </p>
        </FadeIn>

        <FadeIn delay={300}>
          <p className="text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-10">
            {t("hero.description")}
          </p>
        </FadeIn>

        <FadeIn delay={400}>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-16">
            {/* Primary button with glow */}
            <button
              onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
              className="group sm:w-auto overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(14,165,233,0.6)] hover:scale-[1.02] w-full rounded-full p-[1px] relative"
            >
              <span className="absolute inset-0 bg-white/20 group-hover:bg-gradient-to-r group-hover:from-sky-500 group-hover:to-blue-500 transition-all duration-300" />
              <span className="flex items-center justify-center gap-2 text-sm font-semibold text-white bg-black w-full h-full rounded-full py-3.5 px-8 relative backdrop-blur-3xl transition-all duration-300 group-hover:bg-black/90">
                {t("hero.viewProjects")}
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </button>

            {/* Secondary glass button */}
            <button
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className="group flex items-center justify-center gap-2 sm:w-auto text-sm font-medium text-white/80 bg-white/5 w-full rounded-full py-3.5 px-8 border border-white/10 backdrop-blur-xl transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:text-white cursor-pointer"
            >
              {t("hero.getInTouch")}
            </button>
          </div>
        </FadeIn>

        <FadeIn delay={600}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {highlights.map((h, i) => (
              <div
                key={i}
                className="glass-panel text-center p-5 rounded-2xl group hover:border-white/20 transition-all duration-300"
              >
                <div className="text-3xl font-bold text-white mb-1">
                  <Counter end={h.value} suffix={h.suffix} />
                </div>
                <div className="text-xs text-white/40">
                  {h.label}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
