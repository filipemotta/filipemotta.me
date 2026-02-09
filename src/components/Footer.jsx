import { colors } from "../styles/theme";

export default function Footer() {
  return (
    <footer
      className="py-8 text-center text-sm"
      style={{ borderTop: `1px solid ${colors.cardBorder}`, color: colors.gray }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <p>
          <span style={{ color: colors.teal }}>&lt;</span> Filipe Motta{" "}
          <span style={{ color: colors.teal }}>/&gt;</span> — Built with passion
          for infrastructure
        </p>
      </div>
    </footer>
  );
}
