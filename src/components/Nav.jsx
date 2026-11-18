import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import posts from "../data/posts";

export default function Nav({ active }) {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const onHome = pathname === "/";
  // Hide the Posts link when there are no posts (the section is hidden too).
  const links = t("nav.links").filter((link) => link.id !== "posts" || posts.length > 0);

  // On home, scroll to the section; elsewhere, go home and let Home scroll to #id.
  const goTo = (id) => {
    if (onHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate(`/#${id}`);
    }
  };

  return (
    <nav className="glass-nav fixed top-0 z-50 w-full">
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <button
          onClick={() => goTo("hero")}
          className="cursor-pointer border-none bg-transparent font-display text-lg font-bold tracking-tight text-white"
        >
          filipemotta<span className="text-accent">.me</span>
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="mr-2 hidden items-center lg:flex">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => goTo(link.id)}
                aria-current={active === link.id ? "true" : undefined}
                className={`cursor-pointer rounded-md border-none bg-transparent px-3 py-2 text-sm transition-colors hover:text-white ${
                  active === link.id ? "text-white" : "text-muted"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
          <LanguageSwitcher />
          <button onClick={() => goTo("contact")} className="btn-primary ml-2 cursor-pointer border-none !px-4 !py-2 !text-sm">
            {t("nav.contact")}
          </button>
        </div>
      </div>
    </nav>
  );
}
