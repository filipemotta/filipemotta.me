import { useState } from "react";
import Rail from "./Rail";
import { useLanguage } from "../i18n/LanguageContext";
import { getProjects } from "../data/jobs";

export default function Experience() {
  const { lang, t } = useLanguage();
  const projects = getProjects(lang);
  const [open, setOpen] = useState(0);

  return (
    <Rail id="projects" title={t("experience.heading")} lead={t("sections.projectsLead")}>
      <ul className="m-0 list-none border-b border-white/[0.08] p-0">
        {projects.map((project, i) => {
          const isOpen = open === i;
          return (
            <li key={project.title} className="border-t border-white/[0.08]">
              <h3 className="m-0">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  aria-controls={`project-${i}`}
                  className="group flex w-full cursor-pointer items-start justify-between gap-6 border-none bg-transparent py-6 text-left"
                >
                  <span className="flex flex-col gap-1.5">
                    <span className="font-mono text-xs text-signal">{project.category}</span>
                    <span className={`font-display text-xl font-bold tracking-tight transition-colors md:text-2xl ${isOpen ? "text-white" : "text-white/75 group-hover:text-white"}`}>
                      {project.title}
                    </span>
                  </span>
                  <svg
                    width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
                    className={`mt-2 flex-shrink-0 text-muted transition-transform duration-300 ${isOpen ? "rotate-45 text-white" : ""}`}
                    aria-hidden="true"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </h3>
              {/* grid-rows 0fr → 1fr animates height without measuring */}
              <div
                id={`project-${i}`}
                className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden" inert={isOpen ? undefined : ""}>
                  <ul className="m-0 max-w-[68ch] list-none space-y-2.5 p-0">
                    {project.bullets.map((b) => (
                      <li key={b} className="flex gap-3 text-[15px] leading-relaxed text-white/65">
                        <span className="mt-[0.6em] h-1 w-1 flex-shrink-0 rounded-full bg-accent" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <p className="mb-7 mt-5 font-mono text-xs leading-relaxed text-muted">{project.tech.join(", ")}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Rail>
  );
}
