import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

// Page numbers to show: first, last, current ±1, with "…" gaps.
function pageItems(page, total) {
  const pages = new Set([1, total, page - 1, page, page + 1]);
  const list = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const items = [];
  list.forEach((p, i) => {
    if (i > 0 && p - list[i - 1] > 1) items.push(`gap-${p}`);
    items.push(p);
  });
  return items;
}

const base =
  "min-w-9 h-9 px-3 inline-flex items-center justify-center rounded-lg text-sm font-medium border transition-colors no-underline";
const idle = "text-white/60 border-white/10 bg-white/5 hover:text-white hover:border-sky-500/50 cursor-pointer";
const current = "text-white border-sky-500/60 bg-sky-500/15";
const disabled = "text-white/20 border-white/5 bg-transparent cursor-not-allowed";

/**
 * Prev/next + page numbers. Pass `hrefFor(page)` to render links (URL-driven
 * pagination), or `onChange(page)` to render buttons (in-place pagination).
 */
export default function Pagination({ page, totalPages, hrefFor, onChange }) {
  const { t } = useLanguage();
  if (totalPages <= 1) return null;

  const item = (key, target, label, children, isCurrent = false) => {
    const inactive = target < 1 || target > totalPages;
    const cls = `${base} ${isCurrent ? current : inactive ? disabled : idle}`;
    if (inactive || isCurrent) {
      return (
        <span
          key={key}
          className={cls}
          aria-label={label}
          aria-current={isCurrent ? "page" : undefined}
          aria-disabled={inactive || undefined}
        >
          {children}
        </span>
      );
    }
    if (hrefFor) {
      return (
        <Link key={key} to={hrefFor(target)} className={cls} aria-label={label}>
          {children}
        </Link>
      );
    }
    return (
      <button key={key} type="button" onClick={() => onChange(target)} className={cls} aria-label={label}>
        {children}
      </button>
    );
  };

  return (
    <nav aria-label={t("posts.pagination")} className="flex flex-wrap items-center justify-center gap-2 mt-4">
      {item(
        "prev",
        page - 1,
        t("posts.prev"),
        <>
          ← <span className="ml-1 hidden sm:inline">{t("posts.prev")}</span>
        </>
      )}
      {pageItems(page, totalPages).map((p) =>
        typeof p === "string" ? (
          <span key={p} className="px-1 text-white/30" aria-hidden="true">
            …
          </span>
        ) : (
          item(p, p, t("posts.pageN").replace("{n}", p), p, p === page)
        )
      )}
      {item(
        "next",
        page + 1,
        t("posts.next"),
        <>
          <span className="mr-1 hidden sm:inline">{t("posts.next")}</span> →
        </>
      )}
    </nav>
  );
}
