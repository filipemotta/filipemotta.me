import { useEffect, useId, useRef, useState } from "react";

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {}
    ta.remove();
    return ok;
  }
}

/** Tabs of generated code, each with a Copy button. tabs: [{ id, label, code, filename }] */
export default function CodeTabs({ tabs, labels }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const [copied, setCopied] = useState(false);
  const timer = useRef();
  const baseId = useId();
  const current = tabs.find((t) => t.id === active) || tabs[0];

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => setCopied(false), [current?.id]);

  if (!current) return null;

  const onCopy = async () => {
    const ok = await copyText(current.code);
    setCopied(ok ? "ok" : "fail");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="overflow-hidden rounded-[14px] bg-ink ring-1 ring-white/10">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] px-2 py-2">
        <div role="tablist" aria-label={labels.tablist} className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const selected = tab.id === current.id;
            return (
              <button
                key={tab.id}
                id={`${baseId}-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                onClick={() => setActive(tab.id)}
                className={`rounded-[8px] px-3 py-1.5 text-xs font-medium transition-colors ${
                  selected ? "bg-white/[0.08] text-white" : "text-muted hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <span aria-live="polite" className="font-mono text-[11px] text-signal">
            {copied === "ok" ? labels.copied : copied === "fail" ? labels.copyFailed : ""}
          </span>
          <button type="button" onClick={onCopy} className="btn-ghost !px-3 !py-1.5 !text-xs">
            {copied === "ok" ? "✓ " : ""}
            {labels.copy}
          </button>
        </div>
      </div>
      {current.filename && (
        <p className="border-b border-white/[0.05] px-4 py-2 font-mono text-[11px] text-muted">{current.filename}</p>
      )}
      <pre
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${current.id}`}
        tabIndex={0}
        className="max-h-[560px] overflow-auto p-4 font-mono text-[12.5px] leading-relaxed text-white/85"
      >
        <code>{current.code}</code>
      </pre>
    </div>
  );
}
