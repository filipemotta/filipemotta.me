import { colors } from "../styles/theme";
import { useLanguage } from "../i18n/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="py-8 text-center text-sm border-t border-white/5 text-white/40">
      <div className="max-w-6xl mx-auto px-6">
        <p>
          <span className="text-white/60">Filipe Motta</span>
          {" "}— {t("footer.tagline")}
        </p>
      </div>
    </footer>
  );
}
