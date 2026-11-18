import { useLanguage } from "../i18n/LanguageContext";

const STATUS_COLOR = { Ready: "text-signal", Running: "text-accent", Valid: "text-signal" };

/** The numbers, read the way this trade reads them: as `kubectl get` output. */
function StatusPanel({ rows }) {
  return (
    <div className="enter surface-card overflow-hidden font-mono text-[13px]" style={{ animationDelay: "700ms" }}>
      <div className="flex items-center gap-2 border-b border-white/[0.08] px-4 py-3 text-muted">
        <span className="text-signal">$</span>
        <span className="text-white/90">kubectl get filipe -o wide</span>
      </div>
      <div className="overflow-x-auto px-4 py-4">
        <table className="w-full min-w-[20rem] border-separate border-spacing-y-1.5 text-left">
          <thead>
            <tr className="text-[11px] tracking-[0.08em] text-muted">
              <th className="pr-4 font-medium">NAME</th>
              <th className="pr-4 font-medium">STATUS</th>
              <th className="font-medium">VALUE</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.name} className="row-in" style={{ animationDelay: `${1100 + i * 220}ms` }}>
                <td className="whitespace-nowrap pr-4 text-white/70">{row.name}</td>
                <td className={`whitespace-nowrap pr-4 ${STATUS_COLOR[row.status] || "text-signal"}`}>{row.status}</td>
                <td className="text-white">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="row-in mt-3 text-muted" style={{ animationDelay: `${1100 + rows.length * 220}ms` }}>
          <span className="text-signal">$</span> <span className="caret" aria-hidden="true" />
        </p>
      </div>
    </div>
  );
}

export default function Hero() {
  const { lang, t } = useLanguage();
  const words = t("hero.headline").split(" ");
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="hero" className="relative overflow-hidden pt-16">
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div
        className="pointer-events-none absolute -right-[10%] -top-[20%] h-[70%] w-[60%] rounded-full opacity-[0.16] blur-[140px]"
        style={{ background: "#2E9BFF" }}
      />

      <div className="container-site relative grid items-end gap-12 pb-16 pt-16 md:pb-24 md:pt-24 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="enter mb-7 inline-flex items-center gap-2.5 text-sm text-muted">
            <span className="relative flex h-2 w-2">
              <span className="ping-ring absolute inline-flex h-full w-full rounded-full bg-signal" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
            </span>
            {t("hero.status")}
          </p>

          {/* key={lang} replays the rise when the language changes */}
          <h1 key={lang} className="text-display-xl text-white" aria-label={t("hero.headline")}>
            {words.map((word, i) => (
              <span key={i} aria-hidden="true">
                <span className="word">
                  <span style={{ animationDelay: `${120 + i * 55}ms` }}>{word}</span>
                </span>{" "}
              </span>
            ))}
          </h1>

          <p className="enter mt-7 max-w-[52ch] text-lg leading-relaxed text-white/70" style={{ animationDelay: "500ms" }}>
            {t("hero.sub")}
          </p>

          <div className="enter mt-9 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "620ms" }}>
            <button onClick={() => scrollTo("contact")} className="btn-primary cursor-pointer border-none">
              {t("hero.primary")}
            </button>
            <a href="/istio/" className="btn-ghost">
              {t("hero.secondary")}
            </a>
          </div>
        </div>

        <div className="lg:col-span-5">
          <StatusPanel rows={t("hero.rows")} />
        </div>
      </div>
    </section>
  );
}
