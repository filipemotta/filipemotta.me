import { useLanguage } from "../i18n/LanguageContext";

const LANGS = [
  { code: "pt", label: "PT", name: "Português" },
  { code: "en", label: "EN", name: "English" },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center rounded-lg p-0.5" style={{ boxShadow: "inset 0 0 0 1px var(--hairline)" }}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          aria-label={l.name}
          aria-pressed={lang === l.code}
          className={`cursor-pointer rounded-md border-none px-2 py-1 font-mono text-[11px] font-medium transition-colors ${
            lang === l.code ? "bg-white/10 text-white" : "bg-transparent text-muted hover:text-white"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
