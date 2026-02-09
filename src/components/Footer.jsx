import { colors } from "../styles/theme";
import { useLanguage } from "../i18n/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer
      className="py-8 text-center text-sm"
      style={{ borderTop: `1px solid ${colors.cardBorder}`, color: colors.gray }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <p>
          <span style={{ color: colors.teal }}>&lt;</span> Filipe Motta{" "}
          <span style={{ color: colors.teal }}>/&gt;</span> — {t("footer.tagline")}
        </p>
      </div>
    </footer>
  );
}
