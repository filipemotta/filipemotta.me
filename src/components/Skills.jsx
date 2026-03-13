import { colors } from "../styles/theme";
import FadeIn from "./FadeIn";
import SkillBar from "./SkillBar";
import { useLanguage } from "../i18n/LanguageContext";
import { getSkillGroups } from "../data/skills";

export default function Skills() {
  const { lang, t } = useLanguage();
  const skillGroups = getSkillGroups(lang);

  return (
    <section id="skills" className="py-24 border-t border-white/5 relative">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative">
        <FadeIn>
          <p className="text-sky-500 font-mono text-xs tracking-widest uppercase mb-2 text-center">
            {t("skills.label")}
          </p>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-16 text-center text-white">
            {t("skills.heading")}
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6">
          {skillGroups.map((group, gi) => (
            <FadeIn key={group.title} delay={gi * 150}>
              <div className="glass-panel p-8 rounded-3xl group hover:border-white/20 transition-all duration-500">
                <h3 className="text-lg font-medium tracking-tight text-white mb-6">
                  <span className="mr-2">{group.icon}</span>
                  {group.title}
                </h3>
                {group.skills.map((s, si) => (
                  <SkillBar
                    key={s.name}
                    name={s.name}
                    level={s.level}
                    delay={si * 100}
                  />
                ))}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
