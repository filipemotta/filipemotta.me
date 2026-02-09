import { colors } from "../styles/theme";
import FadeIn from "./FadeIn";
import SkillBar from "./SkillBar";
import { useLanguage } from "../i18n/LanguageContext";
import { getSkillGroups } from "../data/skills";

export default function Skills() {
  const { lang, t } = useLanguage();
  const skillGroups = getSkillGroups(lang);

  return (
    <section id="skills" className="py-24" style={{ background: colors.darker }}>
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn>
          <p
            className="text-sm font-semibold tracking-widest uppercase mb-3 text-center"
            style={{ color: colors.teal }}
          >
            {t("skills.label")}
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold mb-16 text-center"
            style={{ color: colors.white }}
          >
            {t("skills.heading")}
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-12">
          {skillGroups.map((group, gi) => (
            <FadeIn key={group.title} delay={gi * 150}>
              <div
                className="p-6 rounded-xl"
                style={{
                  background: colors.cardBg,
                  border: `1px solid ${colors.cardBorder}`,
                }}
              >
                <h3 className="text-lg font-bold mb-6" style={{ color: colors.white }}>
                  <span style={{ color: colors.teal }}>{group.icon}</span>{" "}
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
