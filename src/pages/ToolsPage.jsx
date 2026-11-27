import { useState } from "react";
import { Link } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import K8sSizingCalculator from "../components/tools/K8sSizingCalculator";
import { useLanguage } from "../i18n/LanguageContext";
import useDocumentMeta from "../hooks/useDocumentMeta";

// Registry of utilities hosted on /tools. Add new tools here.
const TOOLS = [{ id: "k8s-sizing", key: "k8s", Component: K8sSizingCalculator }];

/**
 * /tools — DevOps utilities. Intentionally unlisted: nothing on the site links
 * here (no Nav, Footer or sitemap entry); it is reachable by direct URL only.
 */
export default function ToolsPage() {
  const { t } = useLanguage();
  const [activeId, setActiveId] = useState(TOOLS[0].id);
  const active = TOOLS.find((tool) => tool.id === activeId) || TOOLS[0];
  const { Component } = active;

  useDocumentMeta(`${t(`tools.${active.key}.metaTitle`)} — Filipe Motta`, t(`tools.${active.key}.metaDescription`));

  return (
    <>
      <Nav />
      <main className="min-h-screen pb-24 pt-28">
        <div className="container-site">
          <Link to="/" className="text-sm text-white/50 transition-colors hover:text-white">
            ← {t("tools.backHome")}
          </Link>

          <div className="mt-6 flex flex-col gap-4 border-b border-white/[0.06] pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("tools.label")}</p>
              <h1 className="text-display-lg mt-2 text-white">{t(`tools.${active.key}.title`)}</h1>
              <p className="mt-3 max-w-2xl text-white/55">{t(`tools.${active.key}.lead`)}</p>
            </div>
            <div role="tablist" aria-label={t("tools.selectorLabel")} className="flex flex-wrap items-center gap-2">
              {TOOLS.map((tool) => {
                const selected = tool.id === active.id;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActiveId(tool.id)}
                    className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium ring-1 transition-colors ${
                      selected ? "bg-accent/10 text-white ring-accent/60" : "text-muted ring-white/10 hover:text-white"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${selected ? "bg-signal" : "bg-white/30"}`} aria-hidden="true" />
                    {t(`tools.${tool.key}.short`)}
                  </button>
                );
              })}
              <span className="font-mono text-[11px] text-white/30">{t("tools.moreSoon")}</span>
            </div>
          </div>

          <div className="mt-8" role="tabpanel">
            <Component />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
