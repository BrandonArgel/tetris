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
        <div className="flex w-full min-w-[72px] flex-col items-center gap-1 rounded-lg border border-cyan-500/50 bg-gray-950/80 px-2 py-2 backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.15)] shrink-0">
            <span className="text-[10px] font-mono tracking-[0.2em] text-cyan-400/80 uppercase">
                {label}
            </span>
            <span
                className="font-mono text-xl font-bold tabular-nums"
                style={{ color, textShadow: `0 0 10px ${color}99` }}
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
