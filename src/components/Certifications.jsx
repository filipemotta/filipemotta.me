import { colors } from "../styles/theme";
import FadeIn from "./FadeIn";
import CertBadge from "./CertBadge";
import certifications from "../data/certifications";
import { useLanguage } from "../i18n/LanguageContext";

export default function Certifications() {
  const { t } = useLanguage();

  return (
    <section id="certifications" className="py-24 border-t border-white/5 bg-neutral-950 relative">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-16 text-center text-white">
            {t("certifications.heading")}
          </h2>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certifications.map((c, i) => (
            <CertBadge key={i} cert={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
