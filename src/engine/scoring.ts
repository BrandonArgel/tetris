// ─── Scoring ──────────────────────────────────────────────────────────────────

/** Classic Tetris points per line clear, multiplied by current level. */
const LINE_POINTS = [0, 100, 300, 500, 800]

export function computeScore(linesCleared: number, level: number): number {
    const points = LINE_POINTS[Math.min(linesCleared, 4)] ?? 0
    return points * level
}

/** Level advances every 8 lines. Minimum level is 1. */
export function levelFromLines(totalLines: number): number {
    return Math.floor(totalLines / 8) + 1
}

/**
 * Gravity interval in milliseconds.
 * Starts at 800 ms (level 1) and approaches 50 ms at high levels.
 */
export function dropInterval(level: number): number {
    return Math.max(50, 800 - (level - 1) * 75)
}
