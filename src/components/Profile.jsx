import { useState } from "react";
import FadeIn from "./FadeIn";
import Counter from "./Counter";
import profileImg from "../assets/profile.jpg";
import { useLanguage } from "../i18n/LanguageContext";

export default function Profile() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const bio = t("profile.bio");
  const stats = t("profile.stats");

  return (
    <section id="about" className="section-y scroll-mt-16">
      <div className="container-site">
        <FadeIn>
          <h2 className="text-display-lg text-white">{t("profile.heading")}</h2>
        </FadeIn>

        <FadeIn delay={120}>
          <article className="surface-card mt-10 grid overflow-hidden md:mt-14 lg:min-h-[36rem] lg:grid-cols-[minmax(0,11fr)_minmax(0,13fr)]">
            <div className="relative aspect-[4/3] border-b border-white/[0.08] bg-raised sm:aspect-[16/10] lg:aspect-auto lg:border-b-0 lg:border-r">
              <img
                src={profileImg}
                alt="Filipe Motta"
                width="1120"
                height="1400"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover object-[62%_24%]"
              />
            </div>

            <div className="flex min-w-0 flex-col justify-center gap-8 px-6 py-8 sm:px-8 lg:p-12 xl:p-16">
              <header className="flex flex-col gap-2.5">
                <h3 className="text-display-lg text-white">Filipe Motta</h3>
                <p className="text-[15px] leading-snug text-muted md:text-base">{t("profile.role")}</p>
              </header>

              <div className="flex flex-col items-start gap-2">
                <div
                  id="profile-bio"
                  className={`max-w-[58ch] text-pretty text-[15px] leading-relaxed text-white/75 md:text-base lg:text-[17px] ${
                    open ? "" : "line-clamp-4"
                  }`}
                >
                  {bio.map((para, i) => (
                    <span key={i} className={`block ${i ? "mt-4" : ""}`}>
                      {para}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  aria-expanded={open}
                  aria-controls="profile-bio"
                  className="cursor-pointer border-none bg-transparent p-0 text-sm font-medium text-signal underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  {open ? t("profile.less") : t("profile.more")}
                </button>
              </div>

              <dl className="m-0 grid grid-cols-3 border-t border-white/[0.08] pt-6 lg:pt-8">
                {stats.map((s, i) => (
                  <div
                    key={s.label}
                    className={`flex min-w-0 flex-col gap-2 ${i ? "border-l border-white/[0.08] px-3 sm:px-4 lg:px-6" : "pr-3 sm:pr-4 lg:pr-6"}`}
                  >
                    <dt className="stat-label truncate">{s.label}</dt>
                    <dd className="text-display-md m-0 leading-none text-white tabular-nums">
                      <Counter end={s.value} suffix={s.suffix} duration={1400} />
                    </dd>
                    <dd className="m-0 text-[13px] leading-snug text-white/45">{s.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </article>
        </FadeIn>
      </div>
    </section>
  );
}
