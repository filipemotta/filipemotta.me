import { colors } from "../styles/theme";
import FadeIn from "./FadeIn";
import TimelineItem from "./TimelineItem";
import { useLanguage } from "../i18n/LanguageContext";
import { getProjects } from "../data/jobs";

export default function Experience() {
  const { lang, t } = useLanguage();
  const projects = getProjects(lang);

  return (
    <section id="projects" className="py-24 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn>
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <p className="text-sky-500 font-mono text-xs tracking-widest uppercase mb-2">
                {t("experience.label")}
              </p>
              <h2 className="text-3xl font-medium tracking-tight text-white">
                {t("experience.heading")}
              </h2>
            </div>
          </div>
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
