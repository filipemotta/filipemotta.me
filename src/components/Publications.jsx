import FadeIn from "./FadeIn";
import { useLanguage } from "../i18n/LanguageContext";
import { getPublications } from "../data/publications";

export default function Publications() {
  const { lang, t } = useLanguage();
  const publications = getPublications(lang);

  return (
    <section id="guide" className="section-y scroll-mt-16 border-t border-white/[0.06]">
      <div className="container-site">
        <FadeIn>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="text-display-lg text-white">{t("publications.heading")}</h2>
            <p className="max-w-[44ch] text-[15px] leading-relaxed text-muted md:text-right md:text-base">
              {t("sections.guideLead")}
            </p>
          </div>
        </FadeIn>

        <div className="mt-10 grid gap-5 md:mt-14 lg:grid-cols-2">
          {publications.map((pub, i) => (
            <FadeIn key={pub.title} delay={i * 120} className="h-full">
              <article className="surface-card flex h-full flex-col p-6 transition-shadow duration-300 hover:shadow-[inset_0_0_0_1px_rgba(46,155,255,0.45)] sm:p-9">
                <p className="font-mono text-xs text-signal">{pub.badge}</p>
                <h3 className="text-display-md mt-4 text-white">{pub.title}</h3>
                <p className="mt-1.5 text-[15px] text-muted">{pub.subtitle}</p>
                <p className="mt-5 leading-relaxed text-white/70">{pub.description}</p>

                <dl className="m-0 mt-7 grid grid-cols-3 border-y border-white/[0.08] py-5">
                  {pub.stats.map((s, si) => (
                    <div key={s.label} className={`flex flex-col gap-1.5 ${si ? "border-l border-white/[0.08] pl-4" : ""}`}>
                      <dt className="stat-label">{s.label}</dt>
                      <dd className="m-0 font-display text-2xl font-bold text-white tabular-nums">{s.value}</dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-6 text-sm font-medium text-white">{t("sections.topics")}</p>
                <ul className="m-0 mt-3 grid list-none gap-x-6 gap-y-2 p-0 text-sm text-white/60 sm:grid-cols-2">
                  {pub.topics.map((topic) => (
                    <li key={topic} className="flex gap-2.5">
                      <span className="mt-[0.55em] h-1 w-1 flex-shrink-0 rounded-full bg-accent" />
                      {topic}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  <a
                    href={pub.url}
                    {...(pub.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={i === 0 ? "btn-primary" : "btn-ghost"}
                  >
                    {pub.linkLabel}
                  </a>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
