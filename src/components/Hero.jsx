import { colors } from "../styles/theme";
import FadeIn from "./FadeIn";
import Counter from "./Counter";
import Particles from "./Particles";
import highlights from "../data/highlights";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
    >
      <Particles />

      {/* Gradient orbs */}
      <div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ background: colors.teal, top: "10%", right: "10%" }}
      />
      <div
        className="absolute w-72 h-72 rounded-full blur-3xl opacity-10"
        style={{ background: colors.indigo, bottom: "20%", left: "5%" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
        <FadeIn delay={100}>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
            Filipe <span style={{ color: colors.teal }}>Motta</span>
          </h1>
        </FadeIn>

        <FadeIn delay={250}>
          <p className="text-xl md:text-2xl font-light mb-4" style={{ color: colors.gray }}>
            Senior DevOps, Cloud Architect &amp; Engineer
          </p>
        </FadeIn>

        <FadeIn delay={350}>
          <p
            className="text-base max-w-2xl mx-auto leading-relaxed mb-10"
            style={{ color: colors.gray }}
          >
            Building and scaling cloud-native infrastructure for over 20 years.
            Kubernetes specialist managing 300+ clusters across AWS, Azure, and
            GCP with a passion for automation, GitOps, and reliability.
          </p>
        </FadeIn>

        <FadeIn delay={450}>
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <button
              onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
              className="px-7 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer border-none"
              style={{ background: colors.teal, color: colors.dark }}
            >
              View Projects
            </button>
            <button
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className="px-7 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:bg-white/10 cursor-pointer bg-transparent"
              style={{ border: `1px solid ${colors.cardBorder}`, color: colors.white }}
            >
              Get in Touch
            </button>
          </div>
        </FadeIn>

        <FadeIn delay={600}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {highlights.map((h, i) => (
              <div
                key={i}
                className="text-center p-4 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${colors.cardBorder}`,
                }}
              >
                <div className="text-3xl font-bold" style={{ color: colors.teal }}>
                  <Counter end={h.value} suffix={h.suffix} />
                </div>
                <div className="text-xs mt-1" style={{ color: colors.gray }}>
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
