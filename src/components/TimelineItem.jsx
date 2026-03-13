import { colors } from "../styles/theme";
import FadeIn from "./FadeIn";

export default function TimelineItem({ job, index }) {
  return (
    <FadeIn delay={index * 120}>
      <div className="glass-panel rounded-3xl p-8 transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl h-full flex flex-col group relative overflow-hidden">
        {/* Corner accents like the reference */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 group-hover:border-sky-500 transition-colors" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 group-hover:border-sky-500 transition-colors" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 group-hover:border-sky-500 transition-colors" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-sky-500 transition-colors" />

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] bg-white/5 px-2.5 py-1 text-sky-400 rounded-full border border-sky-500/20 font-medium uppercase tracking-wider">
              {job.category}
            </span>
          </div>
          <h3 className="text-lg font-medium tracking-tight text-white">
            {job.title}
          </h3>
        </div>

        {/* Bullets */}
        <ul className="space-y-2 mt-2 flex-1">
          {job.bullets.map((b, i) => (
            <li
              key={i}
              className="flex gap-2.5 text-sm leading-relaxed text-white/50"
            >
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-sky-500/50" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-1.5 mt-6 pt-4 border-t border-white/5">
          {job.tech.map((t) => (
            <span
              key={t}
              className="text-[10px] px-2 py-1 rounded text-white/30 bg-white/5"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}
