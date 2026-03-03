import type { GameStatus } from '@/engine/types'
import { Button } from '@/components/ui/Button'
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice'
import {
    Play,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    ArrowDown,
    ChevronsDown,
    RotateCcw,
} from 'lucide-react'

interface GameOverlayProps {
    status: GameStatus
    score: number
    onStart: () => void
    onPause: () => void
}

// ─── Control hint rows ────────────────────────────────────────────────────────

const KeyboardHints = () => (
    <div className="flex flex-col gap-1.5">
        <p className="mb-0.5 text-center text-[9px] font-bold tracking-[0.25em] text-gray-500 uppercase">
            Keyboard
        </p>
        {[
            { icons: [ArrowLeft, ArrowRight], label: 'Move' },
            { icons: [ArrowDown], label: 'Soft Drop' },
            { icons: [ArrowUp], label: 'Rotate' },
        ].map(({ icons, label }) => (
            <div key={label} className="flex items-center gap-2">
                <div className="flex gap-1">
                    {icons.map((Icon, i) => (
                        <span
                            key={i}
                            className="inline-flex h-6 w-6 items-center justify-center rounded border border-white/20 bg-white/8 text-gray-300"
                        >
                            <Icon size={11} strokeWidth={2.5} />
                        </span>
                    ))}
                </div>
                <span className="text-xs text-gray-400">{label}</span>
            </div>
        ))}
        <div className="flex items-center gap-2">
            <span className="inline-flex h-6 items-center justify-center rounded border border-white/20 bg-white/8 px-2 text-[9px] font-bold tracking-widest text-gray-300 uppercase">
                <ArrowUp size={11} strokeWidth={2.5} /> + Shift
            </span>
            <span className="text-xs text-gray-400">Rotate CCW</span>
        </div>
        {/* Space bar */}
        <div className="flex items-center gap-2">
            <span className="inline-flex h-6 items-center justify-center rounded border border-white/20 bg-white/8 px-2 text-[9px] font-bold tracking-widest text-gray-300 uppercase">
                Space
            </span>
            <span className="text-xs text-gray-400">Hard Drop</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="inline-flex h-6 items-center justify-center rounded border border-white/20 bg-white/8 px-2 text-[9px] font-bold tracking-widest text-gray-300 uppercase">
                Esc / P
            </span>
            <span className="text-xs text-gray-400">Pause</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="inline-flex h-6 items-center justify-center rounded border border-white/20 bg-white/8 px-2 text-[9px] font-bold tracking-widest text-gray-300 uppercase">
                Enter
            </span>
            <span className="text-xs text-gray-400">Start</span>
        </div>
    </div>
)

const TouchHints = () => (
    <div className="flex flex-col gap-1.5">
        <p className="mb-0.5 text-center text-[9px] font-bold tracking-[0.25em] text-gray-500 uppercase">
            Touch
        </p>
        {[
            { Icon: ArrowLeft, label: 'Tap ← / →  Move' },
            { Icon: RotateCcw, label: 'Tap ↑  Rotate' },
            { Icon: ArrowDown, label: 'Tap ↓  Soft Drop' },
            { Icon: ChevronsDown, label: '▲  Hard Drop' },
        ].map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded border border-white/20 bg-white/8 text-gray-300">
                    <Icon size={11} strokeWidth={2.5} />
                </span>
                <span className="text-xs text-gray-400">{label}</span>
            </div>
        ))}
    </div>
)

// ─── GameOverlay ──────────────────────────────────────────────────────────────

/** Full-screen overlay shown when the game is idle, paused, or game-over. */
export function GameOverlay({ status, score, onStart, onPause }: GameOverlayProps) {
    if (status === 'playing' || status === 'clearing') return null

    const isTouch = useIsTouchDevice()

    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 rounded-lg bg-gray-950/90 backdrop-blur-sm">
            {status === 'idle' && (
                <div className="flex flex-col items-center gap-5 animate-fade-in-bounce px-4">
                    <h1 className="animate-title-pulse text-5xl font-black tracking-wider text-cyan-400">
                        TETRIS
                    </h1>
                    <p className="text-[11px] tracking-widest text-gray-400 uppercase">Classic Arcade</p>

                    <Button
                        id="start-button"
                        variant="primary"
                        size="lg"
                        onClick={onStart}
                        className="mt-1 gap-2 tracking-[0.25em] uppercase"
                    >
                        <Play size={16} strokeWidth={2.5} />
                        Play
                    </Button>

                    {/* Controls guide */}
                    <div className="flex gap-6 rounded-xl border border-white/8 bg-white/3 px-5 py-4">
                        {isTouch ? <TouchHints /> : <KeyboardHints />}
                    </div>
                </div>
            )}

            {status === 'paused' && (
                <div className="flex flex-col items-center gap-4 animate-fade-in-bounce">
                    <h2
                        className="text-4xl font-black tracking-widest text-yellow-400"
                        style={{ textShadow: '0 0 20px #f0d000aa' }}
                    >
                        PAUSED
                    </h2>
                    {isTouch ? (
                        <Button
                            id="resume-button"
                            variant="primary"
                            size="lg"
                            onClick={onPause}
                            className="mt-2 gap-2 tracking-[0.25em] uppercase"
                        >
                            <Play size={18} strokeWidth={2.5} />
                            Resume
                        </Button>
                    ) : (
                        <p className="text-sm text-gray-400">Press Esc or P to resume</p>
                    )}
                </div>
            )}

            {status === 'gameover' && (
                <div className="flex flex-col items-center gap-5 animate-fade-in-bounce">
                    <h2
                        className="text-4xl font-black tracking-widest text-red-500 text-center"
                        style={{ textShadow: '0 0 24px #f00000cc' }}
                    >
                        GAME OVER
                    </h2>
                    <p className="font-mono text-xl text-gray-300">
                        Score:{' '}
                        <span className="font-bold text-cyan-400">{score.toLocaleString()}</span>
                    </p>
                    <Button
                        id="restart-button"
                        variant="ghost"
                        size="lg"
                        onClick={onStart}
                        className="mt-2 border-red-500/50 bg-red-500/10 text-red-300 tracking-[0.25em] uppercase hover:border-red-400 hover:bg-red-500/20"
                    >
                        Play Again
                    </Button>
                </div>
            )}
        </div>
    )
}
