import { colors, fonts } from "../styles/theme";

export default function TerminalText({ lines }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "#0A0E13", border: `1px solid ${colors.cardBorder}` }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{
          background: "#111820",
          borderBottom: `1px solid ${colors.cardBorder}`,
        }}
      >
        <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" />
        <div className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
        <span
          className="ml-2 text-xs"
          style={{ color: colors.gray, fontFamily: fonts.mono }}
        >
          ~ filipe@devops
        </span>
      </div>

      {/* Lines */}
      <div
        className="p-5 text-sm leading-relaxed"
        style={{ fontFamily: fonts.mono }}
      >
        {lines.map((l, i) => (
          <div key={i} className="mb-1">
            {l.prompt && <span style={{ color: colors.teal }}>$ </span>}
            <span style={{ color: l.color || colors.gray }}>{l.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
