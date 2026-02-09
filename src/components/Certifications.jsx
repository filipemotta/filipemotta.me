import { colors } from "../styles/theme";
import FadeIn from "./FadeIn";
import CertBadge from "./CertBadge";
import certifications from "../data/certifications";

export default function Certifications() {
  return (
    <section id="certifications" className="py-24" style={{ background: colors.darker }}>
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn>
          <p
            className="text-sm font-semibold tracking-widest uppercase mb-3 text-center"
            style={{ color: colors.teal }}
          >
            Validated Knowledge
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold mb-16 text-center"
            style={{ color: colors.white }}
          >
            Certifications
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
