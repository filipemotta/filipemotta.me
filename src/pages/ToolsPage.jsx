import { Link, Navigate, useParams } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import K8sSizingCalculator from "../components/tools/K8sSizingCalculator";
import K8sPolicyGenerator from "../components/tools/K8sPolicyGenerator";
import { useLanguage } from "../i18n/LanguageContext";
import useDocumentMeta from "../hooks/useDocumentMeta";

// Registry of utilities hosted on /tools. Add new tools here (and their tools.<key>.* i18n strings).
// The first tool is also what bare /tools shows, so the original /tools URL keeps working.
const TOOLS = [
  { id: "k8s-sizing", key: "k8s", path: "/tools/k8s-sizing", Component: K8sSizingCalculator },
  { id: "k8s-policies", key: "policies", path: "/tools/k8s-policies", Component: K8sPolicyGenerator },
];

/**
 * /tools and /tools/:toolId — DevOps utilities. Intentionally unlisted: nothing on the site links
 * here (no Nav, Footer or sitemap entry); it is reachable by direct URL only.
 * The active tool comes from the URL, so every tool has a shareable direct link.
 * Uses its own wider container and readability scope (.container-tools,
 * .tools-scope in index.css) so the rest of the site is unaffected.
 */
export default function ToolsPage() {
  const { t } = useLanguage();
  const { toolId } = useParams();
  const active = toolId ? TOOLS.find((tool) => tool.id === toolId) : TOOLS[0];

  useDocumentMeta(
    active ? `${t(`tools.${active.key}.metaTitle`)} — Filipe Motta` : "Filipe Motta",
    active ? t(`tools.${active.key}.metaDescription`) : ""
  );

  if (!active) return <Navigate to="/tools" replace />;
  const { Component } = active;

  return (
    <>
      <Nav />
      <main className="tools-scope min-h-screen pb-24 pt-28">
        <div className="container-tools">
          <Link to="/" className="text-[15px] text-slate-300 transition-colors hover:text-white">
            ← {t("tools.backHome")}
          </Link>

          <nav
            aria-label={t("tools.selectorLabel")}
            className="mt-6 flex flex-col gap-3 rounded-[16px] bg-white/[0.03] p-3 ring-1 ring-white/[0.12] sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="stat-label px-2">{t("tools.label")}</span>
              {TOOLS.map((tool) => {
                const selected = tool.id === active.id;
                return (
                  <Link
                    key={tool.id}
                    to={tool.path}
                    aria-current={selected ? "page" : undefined}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-[15px] font-medium ring-1 transition-colors ${
                      selected ? "bg-accent/15 text-white ring-accent/70" : "text-slate-300 ring-white/15 hover:text-white hover:ring-white/30"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${selected ? "bg-signal" : "bg-white/40"}`} aria-hidden="true" />
                    {t(`tools.${tool.key}.short`)}
                  </Link>
                );
              })}
            </div>
            <span className="px-2 font-mono text-[13px] text-slate-400">{t("tools.moreSoon")}</span>
          </nav>

          <div className="mt-8 border-b border-white/[0.12] pb-6">
            <p className="font-mono text-[13px] uppercase tracking-widest text-accent">{t("tools.label")}</p>
            <h1 className="text-display-lg mt-2 text-white">{t(`tools.${active.key}.title`)}</h1>
            <p className="mt-3 max-w-3xl text-[17px] leading-relaxed text-slate-200">{t(`tools.${active.key}.lead`)}</p>
          </div>

          <div className="mt-8">
            <Component key={active.id} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
