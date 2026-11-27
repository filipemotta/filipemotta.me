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

const COMMENT_LINE = /^\s*(#|\/\/)/;

/** Renders code line by line so comment lines get their own color. Text content stays identical to `code`. */
function CodeLines({ code }) {
  const lines = code.split("\n");
  return lines.map((line, i) => (
    <span key={i} className={COMMENT_LINE.test(line) ? "tools-code-comment" : undefined}>
      {line}
      {i < lines.length - 1 ? "\n" : ""}
    </span>
  ));
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
    <div className="tools-code overflow-hidden rounded-[14px]">
      <div className="tools-code-chrome flex flex-wrap items-center justify-between gap-2 border-b px-2 py-2">
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
                className={`rounded-[8px] px-3.5 py-2 text-sm font-medium transition-colors ${
                  selected ? "bg-white/[0.10] text-white ring-1 ring-white/15" : "text-slate-300 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <span aria-live="polite" className="font-mono text-[13px] text-signal">
            {copied === "ok" ? labels.copied : copied === "fail" ? labels.copyFailed : ""}
          </span>
          <button type="button" onClick={onCopy} className="btn-ghost !px-3.5 !py-2 !text-sm">
            {copied === "ok" ? "✓ " : ""}
            {labels.copy}
          </button>
        </div>
      </div>
      {current.filename && (
        <p className="tools-code-chrome border-b px-4 py-2 font-mono text-[13px] text-slate-200">{current.filename}</p>
      )}
      <pre
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${current.id}`}
        tabIndex={0}
        className="tools-code-pre max-h-[640px] overflow-auto p-5 font-mono text-[13.5px] leading-[1.65]"
      >
        <code>
          <CodeLines code={current.code} />
        </code>
      </pre>
    </div>
  );
}
