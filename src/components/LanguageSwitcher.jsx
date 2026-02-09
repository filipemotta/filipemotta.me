import { useLanguage } from "../i18n/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-1 ml-4">
      <button
        onClick={() => setLang("en")}
        className="text-lg cursor-pointer bg-transparent border-none p-1 transition-opacity duration-200"
        style={{ opacity: lang === "en" ? 1 : 0.4 }}
        aria-label="English"
      >
        🇺🇸
      </button>
      <button
        onClick={() => setLang("pt")}
        className="text-lg cursor-pointer bg-transparent border-none p-1 transition-opacity duration-200"
        style={{ opacity: lang === "pt" ? 1 : 0.4 }}
        aria-label="Português"
      >
        🇧🇷
      </button>
    </div>
  );
}
