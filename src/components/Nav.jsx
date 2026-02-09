import { colors } from "../styles/theme";

const NAV_LINKS = ["About", "Skills", "Publications", "Projects", "Certifications", "Contact"];

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Nav({ active }) {
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
          {NAV_LINKS.map((label) => (
            <button
              key={label}
              onClick={() => scrollTo(label.toLowerCase())}
              className="px-3 py-1.5 text-sm rounded-lg transition-all duration-200 hover:bg-white/5 cursor-pointer bg-transparent border-none"
              style={{
                color: active === label.toLowerCase() ? colors.teal : colors.gray,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
