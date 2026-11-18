import Rail from "./Rail";
import FadeIn from "./FadeIn";
import { useLanguage } from "../i18n/LanguageContext";
import { getSkillGroups } from "../data/skills";

export default function Skills() {
  const { lang, t } = useLanguage();
  const groups = getSkillGroups(lang);

  return (
    <Rail id="skills" title={t("sections.stackHeading")}>
      <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
        {groups.map((group, gi) => (
          <FadeIn key={group.title} delay={gi * 80}>
            <h3 className="m-0 border-b border-white/[0.08] pb-3 font-display text-lg font-bold tracking-tight text-white">
              {group.title}
            </h3>
            <ul className="m-0 mt-3 list-none p-0">
              {group.skills.map((s) => (
                <li key={s.name} className="py-1.5 text-[15px] text-white/65">
                  {s.name}
                </li>
              ))}
            </ul>
          </FadeIn>
        ))}
      </div>
    </Rail>
  );
}
