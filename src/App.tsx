import { useEffect, useCallback } from 'react'
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
} from 'lucide-react'
import { useTetris } from '@/hooks/useTetris'
import { useSoundManager } from '@/hooks/useSoundManager'
import { useBoardSize } from '@/hooks/useBoardSize'
import { Board } from '@/components/Board'
import { NextPiece } from '@/components/NextPiece'
import { HUD } from '@/components/HUD'
import { GameOverlay } from '@/components/GameOverlay'
import { MobileGamepad } from '@/components/MobileGamepad'
import { Button } from '@/components/ui/Button'
import type { GamepadActions } from '@/components/MobileGamepad'
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dispatchKey(key: string): void {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const { play, muted, toggleMute } = useSoundManager()
  const { gameState, visualBoard, startGame, togglePause } = useTetris({ playSound: play })
  const { cellSize } = useBoardSize()

  const isGameInProgress =
    gameState.status === 'playing' ||
    gameState.status === 'paused' ||
    gameState.status === 'clearing'

  const isPaused = gameState.status === 'paused'
  const showGamepad = useIsTouchDevice()

  // Enter key → start game from idle / game-over
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (gameState.status === 'idle' || gameState.status === 'gameover')) {
        startGame()
      }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [gameState.status, startGame])

  // Gamepad actions → dispatched as keyboard events so useTetris handles them
  const gamepadActions: GamepadActions = {
    moveLeft: useCallback(() => dispatchKey('ArrowLeft'), []),
    moveRight: useCallback(() => dispatchKey('ArrowRight'), []),
    rotate: useCallback(() => dispatchKey('ArrowUp'), []),
    softDrop: useCallback(() => dispatchKey('ArrowDown'), []),
    hardDrop: useCallback(() => dispatchKey(' '), []),
  }

  // Board pixel dimensions
  const MOBILE_CHROME = 208
  const boardH = cellSize * 20
  const boardW = cellSize * 10

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-gray-950 font-sans">

      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute left-1/4 top-1/3 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      {showGamepad ? (
        // ── MOBILE ─────────────────────────────────────────────────────────
        <>
          {/* Header */}
          <header
            className="relative z-10 flex shrink-0 items-center justify-between px-4 py-2"
            style={{ background: 'rgba(3,7,18,0.9)', minHeight: 48 }}
          >
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase">Score</span>
              <span className="font-mono text-sm font-bold text-cyan-400">
                {gameState.score.toLocaleString()}
              </span>
            </div>

            <span
              className="text-base font-black tracking-[0.3em] text-cyan-400"
              style={{ textShadow: '0 0 10px #00f0ff88' }}
            >
              TETRIS
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase">
                LV {gameState.level}
              </span>
              {isGameInProgress && (
                <Button
                  id="pause-btn-mobile"
                  variant="ghost"
                  size="icon"
                  onClick={togglePause}
                  title={isPaused ? 'Resume' : 'Pause'}
                  aria-label={isPaused ? 'Resume' : 'Pause'}
                >
                  {isPaused
                    ? <Play size={16} strokeWidth={2.5} />
                    : <Pause size={16} strokeWidth={2.5} />}
                </Button>
              )}
              <Button
                id="mute-btn-mobile"
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                title={muted ? 'Unmute' : 'Mute'}
                aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
              >
                {muted
                  ? <VolumeX size={16} strokeWidth={2.5} />
                  : <Volume2 size={16} strokeWidth={2.5} />}
              </Button>
            </div>
          </header>

          {/* Board */}
          <main
            className="relative flex flex-1 items-center justify-center overflow-hidden"
            style={{ maxHeight: `calc(100dvh - ${MOBILE_CHROME}px)` }}
          >
            <div className="relative" style={{ width: boardW, height: boardH }}>
              <Board board={visualBoard} cellSize={cellSize} clearingRows={gameState.clearingRows} />
              <GameOverlay status={gameState.status} score={gameState.score} onStart={startGame} onPause={togglePause} />
            </div>
          </main>

          <MobileGamepad actions={gamepadActions} isPaused={isPaused} />
        </>
      ) : (
        // ── DESKTOP ─────────────────────────────────────────────────────────
        <main className="relative flex flex-1 items-center justify-center gap-6 overflow-hidden p-4">

          {/* Playfield */}
          <div className="relative shrink-0" style={{ width: boardW, height: boardH }}>
            <Board board={visualBoard} cellSize={cellSize} clearingRows={gameState.clearingRows} />
            <GameOverlay status={gameState.status} score={gameState.score} onStart={startGame} onPause={togglePause} />
          </div>

          {/* Side panel */}
          <div className="flex w-36 shrink-0 flex-col gap-4">
            <div className="text-center">
              <h1
                className="text-2xl font-black tracking-[0.3em] text-cyan-400"
                style={{ textShadow: '0 0 14px #00f0ff88' }}
              >
                TETRIS
              </h1>
              <div className="mt-1 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            </div>

            <HUD score={gameState.score} level={gameState.level} lines={gameState.lines} />

            <div className="flex flex-col items-center gap-2 rounded-lg border border-white/10 bg-gray-900/80 p-3 backdrop-blur-sm">
              <span className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">Next</span>
              <NextPiece piece={gameState.nextPiece} />
            </div>

            {/* Pause */}
            {isGameInProgress && (
              <Button
                id="pause-button"
                variant="ghost"
                size="sm"
                onClick={togglePause}
                className="w-full gap-2 font-bold tracking-widest uppercase"
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused
                  ? <><Play size={14} strokeWidth={2.5} /><span>Resume</span></>
                  : <><Pause size={14} strokeWidth={2.5} /><span>Pause</span></>}
              </Button>
            )}

            {/* Mute */}
            <Button
              id="mute-button"
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="w-full gap-2"
              title={muted ? 'Unmute' : 'Mute'}
              aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
            >
              {muted
                ? <><VolumeX size={14} strokeWidth={2.5} /><span>Muted</span></>
                : <><Volume2 size={14} strokeWidth={2.5} /><span>Sound</span></>}
            </Button>

            {/* Keyboard hints */}
            {isGameInProgress && (
              <div className="space-y-0.5 text-center text-xs text-gray-600">
                <p>↑ Rotate · ↓ Drop</p>
                <p>Space Hard Drop</p>
                <p>Esc / P Pause</p>
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  )
}
