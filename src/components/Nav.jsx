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
    <nav className="fixed top-0 w-full z-50 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => scrollTo("hero")}
          className="flex items-center gap-3 cursor-pointer bg-transparent border-none group"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 group-hover:border-sky-500/50 transition-colors">
            <span className="text-white text-sm font-bold">FM</span>
          </div>
          <span className="text-sm font-medium text-white/90 tracking-tight">
            Filipe
            <span className="text-white/40"> Motta</span>
          </span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="hover:text-white transition-colors text-xs font-medium cursor-pointer bg-transparent border-none"
              style={{
                color: active === link.id ? colors.accent : "rgba(255,255,255,0.6)",
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
