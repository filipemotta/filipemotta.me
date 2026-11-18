import Rail from "./Rail";
import certifications from "../data/certifications";
import { useLanguage } from "../i18n/LanguageContext";

export default function Certifications() {
  const { t } = useLanguage();

  return (
    <Rail id="certifications" title={t("certifications.heading")} lead={t("sections.certsLead")}>
      <ul className="m-0 grid list-none gap-px overflow-hidden rounded-[20px] bg-white/[0.08] p-0 sm:grid-cols-2" style={{ boxShadow: "0 0 0 1px var(--hairline)" }}>
        {certifications.map((c) => (
          <li key={c.name} className="flex items-center gap-4 bg-surface p-5 transition-colors hover:bg-raised">
            <img src={c.logo} alt="" width="24" height="24" loading="lazy" className="h-6 w-6 flex-shrink-0 object-contain" />
            <div className="min-w-0">
              <p className="m-0 text-sm font-medium leading-snug text-white">{c.name}</p>
              <p className="m-0 mt-0.5 text-xs text-muted">{c.org}</p>
            </div>
          </li>
        ))}
      </ul>
    </Rail>
  );
}
