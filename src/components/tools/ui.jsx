import { useEffect, useState } from "react";

// Small form/layout primitives for the /tools calculators.
// Sizes/colors tuned for readability on the dark /tools page (body ~15px, captions ≥13px).

export const inputClass =
  "w-full rounded-[10px] bg-ink/70 px-3 py-2.5 font-mono text-[15px] text-slate-100 outline-none ring-1 ring-white/15 transition focus:ring-2 focus:ring-accent";

export const fmt = (str, vars = {}) =>
  String(str ?? "").replace(/\{(\w+)\}/g, (_, key) => (vars[key] !== undefined ? vars[key] : `{${key}}`));

const clamp = (v, min, max) => Math.min(Math.max(v, min ?? -Infinity), max ?? Infinity);

export function Panel({ eyebrow, title, description, children, className = "" }) {
  return (
    <section className={`surface-card p-5 sm:p-7 ${className}`}>
      {(eyebrow || title) && (
        <header className="mb-6">
          {eyebrow && <p className="stat-label !text-accent">{eyebrow}</p>}
          {title && <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-white">{title}</h2>}
          {description && <p className="mt-2 text-[15px] leading-relaxed text-slate-300">{description}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Field({ label, htmlFor, hint, children, error }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-[15px] font-medium text-slate-100">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{hint}</p>
      )}
    </div>
  );
}

/** Numeric input that lets the user type freely and commits clamped numbers. */
export function NumberInput({ id, value, onChange, min, max, step = 1, suffix, ariaLabel, className = "" }) {
  const [text, setText] = useState(String(value));
  useEffect(() => {
    setText((prev) => (Number(prev) === value ? prev : String(value)));
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={text}
        aria-label={ariaLabel}
        onChange={(e) => {
          setText(e.target.value);
          const v = Number(e.target.value);
          if (e.target.value !== "" && Number.isFinite(v)) onChange(clamp(v, min, max));
        }}
        onBlur={() => setText(String(value))}
        className={`${inputClass} ${suffix ? "pr-16" : ""}`}
      />
      {suffix && (
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-[13px] text-slate-400">
          {suffix}
        </span>
      )}
    </div>
  );
}

export function SliderField({ id, label, hint, value, onChange, min, max, step = 1, suffix }) {
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.min(Math.max(value, min), max)}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
          className="h-1.5 w-full cursor-pointer accent-accent"
        />
        <NumberInput id={id} value={value} onChange={onChange} min={min} max={max} step={step} suffix={suffix} className="w-36 shrink-0" />
      </div>
    </Field>
  );
}

/** Button group behaving like a radio group. */
export function Segmented({ label, options, value, onChange, size = "md" }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`rounded-[9px] font-mono transition-colors ${
              size === "lg" ? "px-4 py-2.5 text-[15px]" : "px-3 py-2 text-sm"
            } ${
              active
                ? "bg-accent/20 text-white ring-1 ring-accent"
                : "bg-white/[0.04] text-slate-300 ring-1 ring-white/15 hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({ id, checked, onChange, label, hint, disabled = false }) {
  return (
    <div className={`flex items-start gap-3 ${disabled ? "opacity-50" : ""}`}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-accent" : "bg-white/20"
        } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-[15px] font-medium text-slate-100">{label}</span>
        {hint && <span className="mt-1 block text-sm leading-relaxed text-slate-300">{hint}</span>}
      </label>
    </div>
  );
}

const TONES = {
  info: "bg-accent/[0.09] ring-accent/40 text-white",
  signal: "bg-signal/[0.09] ring-signal/50 text-white",
  warn: "bg-amber-400/[0.09] ring-amber-300/50 text-white",
  error: "bg-red-500/[0.09] ring-red-400/50 text-white",
};
const TONE_ICON = { info: "i", signal: "◆", warn: "!", error: "×" };
const TONE_ICON_CLASS = {
  info: "bg-accent text-ink",
  signal: "bg-signal text-ink",
  warn: "bg-amber-300 text-ink",
  error: "bg-red-400 text-ink",
};

export function Banner({ tone = "info", title, children, strong = false }) {
  return (
    <div
      role={tone === "error" || tone === "warn" ? "alert" : "status"}
      className={`flex gap-3 rounded-[14px] p-4 ring-1 ${TONES[tone]} ${strong ? "ring-2" : ""}`}
    >
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[13px] font-bold ${TONE_ICON_CLASS[tone]}`}
      >
        {TONE_ICON[tone]}
      </span>
      <div className="min-w-0 text-[15px] leading-relaxed">
        {title && <p className={`font-semibold text-slate-50 ${strong ? "font-display text-base" : ""}`}>{title}</p>}
        <div className={`${title ? "mt-1" : ""} text-slate-200`}>{children}</div>
      </div>
    </div>
  );
}

export function Badge({ tone = "accent", children }) {
  const cls = {
    accent: "bg-accent/15 text-accent ring-accent/40",
    signal: "bg-signal/15 text-signal ring-signal/40",
    warn: "bg-amber-300/15 text-amber-200 ring-amber-300/40",
  }[tone];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[13px] font-medium uppercase tracking-wide ring-1 ${cls}`}>
      {children}
    </span>
  );
}

/** Used vs available bar. Turns amber over 80% and red when it does not fit. */
export function UtilBar({ value, label }) {
  const over = !Number.isFinite(value) || value > 1;
  const pct = Number.isFinite(value) ? Math.min(value, 1) * 100 : 100;
  const color = over ? "bg-red-400" : value > 0.8 ? "bg-amber-300" : "bg-signal";
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className="h-2 w-full overflow-hidden rounded-full bg-white/[0.10]"
    >
      <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${Math.max(pct, 2)}%` }} />
    </div>
  );
}

export function Stat({ label, value, sub }) {
  return (
    <div className="rounded-[12px] bg-white/[0.03] p-3.5 ring-1 ring-white/[0.12]">
      <p className="stat-label">{label}</p>
      <p className="mt-1 font-mono text-lg text-white">{value}</p>
      {sub && <p className="mt-0.5 text-[13px] text-slate-300">{sub}</p>}
    </div>
  );
}
