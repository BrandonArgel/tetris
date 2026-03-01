import type { GameStatus } from '@/engine/types'
import { Button } from '@/components/ui/Button'
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice'
import { Play } from 'lucide-react'

interface GameOverlayProps {
    status: GameStatus
    score: number
    onStart: () => void
    onPause: () => void
}

/** Full-screen overlay shown when the game is idle, paused, or game-over. */
export function GameOverlay({ status, score, onStart, onPause }: GameOverlayProps) {
    if (status === 'playing' || status === 'clearing') return null

    const isTouch = useIsTouchDevice()

    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 rounded-lg bg-gray-950/90 backdrop-blur-sm">
            {status === 'idle' && (
                <div className="flex flex-col items-center gap-6 animate-fade-in-bounce">
                    <h1 className="animate-title-pulse text-5xl font-black tracking-wider text-cyan-400">
                        TETRIS
                    </h1>
                    <p className="text-sm tracking-widest text-gray-400">CLASSIC ARCADE</p>
                    <Button
                        id="start-button"
                        variant="primary"
                        size="lg"
                        onClick={onStart}
                        className="mt-2 tracking-[0.25em] uppercase"
                    >
                        Play
                    </Button>
                    <div className="mt-1 grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-gray-500">
                        <span>← → Move</span>
                        <span>↑ Rotate</span>
                        <span>↓ Soft Drop</span>
                        <span>Space Hard Drop</span>
                        <span className="col-span-2 text-center">Esc / P — Pause</span>
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
                            className="mt-2 tracking-[0.25em] uppercase"
                        >
                            <Play size={18} strokeWidth={2.5} />
                        </Button>
                    ) : (
                        <p className="text-sm text-gray-400">Press Esc or P to resume</p>
                    )}
                </div>
            )}

            {status === 'gameover' && (
                <div className="flex flex-col items-center gap-5 animate-fade-in-bounce">
                    <h2
                        className="text-4xl font-black tracking-widest text-red-500"
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
