import { colors } from "../styles/theme";
import FadeIn from "./FadeIn";
import TimelineItem from "./TimelineItem";
import { useLanguage } from "../i18n/LanguageContext";
import { getProjects } from "../data/jobs";

export default function Experience() {
  const { lang, t } = useLanguage();
  const projects = getProjects(lang);

  return (
    <section id="projects" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn>
          <p
            className="text-sm font-semibold tracking-widest uppercase mb-3 text-center"
            style={{ color: colors.teal }}
          >
            {t("experience.label")}
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold mb-16 text-center"
            style={{ color: colors.white }}
          >
            {t("experience.heading")}
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <TimelineItem key={i} job={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
