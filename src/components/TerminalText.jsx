import { colors, fonts } from "../styles/theme";

export default function TerminalText({ lines }) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-4">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          </div>
          <span
            className="text-[10px] font-mono text-white/40"
            style={{ fontFamily: fonts.mono }}
          >
            zsh — filipe@devops
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-mono text-green-400">LIVE</span>
        </div>
      </div>

      {/* Lines */}
      <div
        className="p-6 text-sm leading-7"
        style={{ fontFamily: fonts.mono }}
      >
        {lines.map((l, i) => (
          <div key={i} className="mb-0.5">
            {l.prompt && (
              <span className="text-green-400 mr-2">&#10132;</span>
            )}
            {l.prompt && <span className="text-cyan-300 mr-1">~</span>}
            <span style={{ color: l.color || "rgba(255,255,255,0.4)" }}>{l.text}</span>
          </div>
        ))}
        <div className="flex items-center mt-1">
          <span className="text-green-400 mr-2">&#10132;</span>
          <span className="text-cyan-300 mr-2">~</span>
          <span className="w-2 h-4 bg-white/50 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
