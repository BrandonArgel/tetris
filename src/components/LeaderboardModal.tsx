import { useRef, useEffect, useCallback, memo } from 'react'
import { Trophy, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { LeaderboardEntry } from '@/hooks/useLeaderboard'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeaderboardModalProps {
    entries: LeaderboardEntry[]
    isOpen: boolean
    onClose: () => void
    /** If provided, this rank (0-indexed) is highlighted as the newest entry. */
    highlightRank?: number
}

// ─── Medal colours for Top 3 ─────────────────────────────────────────────────

const RANK_STYLES = [
    { medal: '🥇', row: 'bg-yellow-400/10 border-yellow-400/30', text: 'text-yellow-300' },
    { medal: '🥈', row: 'bg-gray-400/10  border-gray-400/30', text: 'text-gray-300' },
    { medal: '🥉', row: 'bg-amber-700/10 border-amber-700/30', text: 'text-amber-400' },
]

// ─── Formatted date ───────────────────────────────────────────────────────────

function formatDate(iso: string): string {
    try {
        return new Intl.DateTimeFormat(undefined, {
            month: 'short',
            day: 'numeric',
            year: '2-digit',
        }).format(new Date(iso))
    } catch {
        return '—'
    }
}

// ─── LeaderboardModal ─────────────────────────────────────────────────────────

export const LeaderboardModal = memo(function LeaderboardModal({
    entries,
    isOpen,
    onClose,
    highlightRank,
}: LeaderboardModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null)

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [isOpen, onClose])

    // Close on backdrop click
    const handleBackdropClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === overlayRef.current) onClose()
        },
        [onClose],
    )

    if (!isOpen) return null

    return (
        <div
            ref={overlayRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
            <div
                className={cn(
                    'w-[min(420px,92vw)] rounded-2xl border border-white/10',
                    'bg-gray-950/95 p-0 text-white',
                    'shadow-[0_0_60px_rgba(0,240,255,0.12)]',
                )}
            >
                {/* ── Header ─────────────────────────────────────────────────── */}
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                    <div className="flex items-center gap-2.5">
                        <Trophy size={18} className="text-yellow-400" />
                        <h2 className="text-base font-black tracking-[0.2em] text-cyan-300 uppercase">
                            Rankings
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close leaderboard"
                        className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-lg',
                            'text-gray-500 transition-colors hover:bg-white/10 hover:text-white',
                        )}
                    >
                        <X size={16} strokeWidth={2.5} />
                    </button>
                </div>

                {/* ── Table ──────────────────────────────────────────────────── */}
                <div className="max-h-[70vh] overflow-y-auto px-4 py-3">
                    {entries.length === 0 ? (
                        <p className="py-10 text-center text-sm text-gray-500">
                            No scores yet — play a game!
                        </p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-[10px] tracking-widest text-gray-500 uppercase">
                                    <th className="pb-2 pl-2 font-semibold">#</th>
                                    <th className="pb-2 font-semibold">Name</th>
                                    <th className="pb-2 font-semibold text-right">Score</th>
                                    <th className="pb-2 font-semibold text-right">Lv</th>
                                    <th className="pb-2 font-semibold text-right">Lines</th>
                                    <th className="pb-2 pr-2 font-semibold text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {entries.map((entry, i) => {
                                    const style = RANK_STYLES[i]
                                    const isHighlight = i === highlightRank
                                    return (
                                        <tr
                                            key={`${entry.date}-${i}`}
                                            className={cn(
                                                'border transition-colors',
                                                style
                                                    ? cn(style.row, 'rounded-lg')
                                                    : 'border-transparent',
                                                isHighlight && 'ring-1 ring-cyan-400/50',
                                            )}
                                        >
                                            <td className="py-2 pl-2 font-mono text-xs text-gray-500">
                                                {style ? style.medal : `${i + 1}`}
                                            </td>
                                            <td
                                                className={cn(
                                                    'max-w-[120px] truncate py-2 font-semibold tracking-wide',
                                                    style ? style.text : 'text-gray-300',
                                                    isHighlight && 'text-cyan-300',
                                                )}
                                            >
                                                {entry.initials}
                                            </td>
                                            <td className="py-2 text-right font-mono font-semibold text-cyan-400">
                                                {entry.score.toLocaleString()}
                                            </td>
                                            <td className="py-2 text-right font-mono text-gray-400">
                                                {entry.level}
                                            </td>
                                            <td className="py-2 text-right font-mono text-gray-400">
                                                {entry.lines}
                                            </td>
                                            <td className="py-2 pr-2 text-right text-xs text-gray-600">
                                                {formatDate(entry.date)}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
})
