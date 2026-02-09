import { colors } from "../styles/theme";
import { useLanguage } from "../i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Nav({ active }) {
  const { t } = useLanguage();
  const links = t("nav.links");

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
      style={{
        background: "rgba(15,20,25,0.85)",
        borderBottom: `1px solid ${colors.cardBorder}`,
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => scrollTo("hero")}
          className="text-xl font-bold tracking-tight cursor-pointer bg-transparent border-none"
          style={{ color: colors.white }}
        >
          <span style={{ color: colors.teal }}>&lt;</span>FM
          <span style={{ color: colors.teal }}>/&gt;</span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="px-3 py-1.5 text-sm rounded-lg transition-all duration-200 hover:bg-white/5 cursor-pointer bg-transparent border-none"
              style={{
                color: active === link.id ? colors.teal : colors.gray,
              }}
            >
              {link.label}
            </button>
          ))}
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}
