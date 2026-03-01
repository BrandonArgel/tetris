interface HUDProps {
    score: number
    level: number
    lines: number
}

interface StatBlockProps {
    label: string
    value: number
    color: string
}

function StatBlock({ label, value, color }: StatBlockProps) {
    return (
        <div className="flex flex-col items-center gap-1 rounded-lg border border-white/10 bg-gray-900/80 px-4 py-3 backdrop-blur-sm">
            <span className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">{label}</span>
            <span
                className="font-mono text-2xl font-bold tabular-nums"
                style={{ color, textShadow: `0 0 12px ${color}99` }}
            >
                {value.toLocaleString()}
            </span>
        </div>
    )
}

/** HUD panel showing score, level, and cleared lines. */
export function HUD({ score, level, lines }: HUDProps) {
    return (
        <div className="flex flex-col gap-3">
            <StatBlock label="Score" value={score} color="#00f0ff" />
            <StatBlock label="Level" value={level} color="#a000f0" />
            <StatBlock label="Lines" value={lines} color="#00f000" />
        </div>
    )
}
