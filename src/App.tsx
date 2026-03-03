import { useEffect, useCallback, useState, useRef } from 'react'
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  Trophy,
} from 'lucide-react'
import { useTetris } from '@/hooks/useTetris'
import { useSoundManager } from '@/hooks/useSoundManager'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { Board } from '@/components/Board'
import { NextPiece } from '@/components/NextPiece'
import { HUD } from '@/components/HUD'
import { GameOverlay } from '@/components/GameOverlay'
import { MobileGamepad } from '@/components/MobileGamepad'
import { LeaderboardModal } from '@/components/LeaderboardModal'
import { InitialsPrompt } from '@/components/InitialsPrompt'
import { Button } from '@/components/ui/Button'
import type { GamepadActions } from '@/components/MobileGamepad'
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dispatchKey(key: string, options: KeyboardEventInit = {}): void {
  window.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...options
    })
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const { play, muted, toggleMute } = useSoundManager()
  const { gameState, visualBoard, startGame, togglePause } = useTetris({ playSound: play })
  const leaderboard = useLeaderboard()

  // ── UI state ──────────────────────────────────────────────────────────────

  const [showLeaderboard, setShowLeaderboard] = useState(false)
  /** Set when a name has been submitted; used to highlight the new rank. */
  const [newEntryRank, setNewEntryRank] = useState<number | undefined>(undefined)
  /** Controls the name-entry dialog. Shown on Game Over when score qualifies. */
  const [promptingInitials, setPromptingInitials] = useState(false)

  /**
   * Track whether we paused the game to show a modal, so we can auto-resume
   * when the modal closes. We use a ref instead of state to avoid re-renders.
   */
  const pausedForModalRef = useRef(false)

  // ── Derived ───────────────────────────────────────────────────────────────

  const isGameInProgress =
    gameState.status === 'playing' ||
    gameState.status === 'paused' ||
    gameState.status === 'clearing'

  const isPaused = gameState.status === 'paused'
  const showGamepad = useIsTouchDevice()

  // ── Game-over → high-score check ─────────────────────────────────────────

  useEffect(() => {
    if (gameState.status === 'gameover' && leaderboard.isHighScore(gameState.score)) {
      setPromptingInitials(true)
    }
  }, [gameState.status])

  // ── Handle name submission ────────────────────────────────────────────────

  const handleInitialsSubmit = useCallback(
    (name: string) => {
      const updated = leaderboard.addEntry({
        initials: name,
        score: gameState.score,
        level: gameState.level,
        lines: gameState.lines,
      })
      setPromptingInitials(false)

      // Find the rank of the new entry so we can highlight it in the modal
      const rank = updated.findIndex(e => e.initials === name && e.score === gameState.score)
      setNewEntryRank(rank >= 0 ? rank : undefined)
      setShowLeaderboard(true)
    },
    [leaderboard, gameState.score, gameState.level, gameState.lines],
  )

  // ── Leaderboard open/close with auto-pause ────────────────────────────────

  const openLeaderboard = useCallback(() => {
    setNewEntryRank(undefined)
    // Auto-pause if game is actively running
    if (gameState.status === 'playing') {
      togglePause()
      pausedForModalRef.current = true
    } else {
      pausedForModalRef.current = false
    }
    setShowLeaderboard(true)
  }, [gameState.status, togglePause])

  const closeLeaderboard = useCallback(() => {
    setShowLeaderboard(false)
    // Auto-resume if we paused on open
    if (pausedForModalRef.current) {
      pausedForModalRef.current = false
      togglePause()
    }
  }, [togglePause])

  // ── Enter → start game ────────────────────────────────────────────────────

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (gameState.status === 'idle' || gameState.status === 'gameover')) {
        startGame()
      }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [gameState.status, startGame])

  // ── Gamepad actions ───────────────────────────────────────────────────────

  const gamepadActions: GamepadActions = {
    moveLeft: useCallback(() => dispatchKey('ArrowLeft'), []),
    moveRight: useCallback(() => dispatchKey('ArrowRight'), []),
    rotate: useCallback(() => dispatchKey('ArrowUp'), []),
    rotateCCW: useCallback(() => dispatchKey('ArrowUp', { shiftKey: true }), []),
    softDrop: useCallback(() => dispatchKey('ArrowDown'), []),
    hardDrop: useCallback(() => dispatchKey(' '), []),
  }

  // ─── Shared Trophy button fragment ─────────────────────────────────────────

  const TrophyButton = ({ id, size: iconSize = 16 }: { id: string; size?: number }) => (
    <Button
      id={id}
      variant="ghost"
      size="icon"
      onClick={openLeaderboard}
      title="Leaderboard"
      aria-label="Open leaderboard"
    >
      <Trophy size={iconSize} strokeWidth={2.5} />
    </Button>
  )

  return (
    <div className="flex items-center justify-center h-[100dvh] w-full flex-col overflow-hidden bg-gray-950 font-sans">

      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute left-1/4 top-1/3 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      {showGamepad ? (
        // ── MOBILE ───────────────────────────────────────────────────────────
        <>
          <header
            className="w-full relative z-10 flex shrink-0 items-center justify-between px-4 py-2"
            style={{ background: 'rgba(3,7,18,0.9)', minHeight: 48 }}
          >
            <div className="flex gap-4">
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-semibold tracking-widest text-violet-400/80 uppercase">Level</span>
                <span className="font-mono text-sm font-bold text-violet-400">
                  {String(gameState.level).padStart(2, '0')}
                </span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-semibold tracking-widest text-cyan-400/80 uppercase">Score</span>
                <span className="font-mono text-sm font-bold text-cyan-400">
                  {String(gameState.score).padStart(7, '0')}
                </span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-semibold tracking-widest text-lime-400/80 uppercase">Lines</span>
                <span className="font-mono text-sm font-bold text-lime-400">
                  {String(gameState.lines).padStart(4, '0')}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <NextPiece piece={gameState.nextPiece} />
            </div>

            <div className="flex items-center gap-1">
              <TrophyButton id="trophy-btn-mobile" />
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

          {/* Main Content Area — 2 Column Asymmetric Grid with Unified HUD */}
          <main className="relative flex-1 min-h-0 overflow-hidden px-2 py-4 items-center justify-center">

            {/* Left Column: The Board */}
            <div className="col-start-1 relative flex h-full max-h-full aspect-[10/20] object-contain origin-left flex-shrink-0 flex justify-center items-center">
              <Board board={visualBoard} clearingRows={gameState.clearingRows} />
              <GameOverlay status={gameState.status} score={gameState.score} onStart={startGame} onPause={togglePause} />
            </div>

          </main>

          <MobileGamepad actions={gamepadActions} isPaused={isPaused} />
        </>
      ) : (
        // ── DESKTOP ──────────────────────────────────────────────────────────
        <main className="relative flex flex-1 items-center justify-center gap-6 overflow-hidden p-4">

          {/* Playfield — board grows to fill available height */}
          <div className="relative flex h-full items-center justify-center">
            <Board board={visualBoard} clearingRows={gameState.clearingRows} />
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

            {/* Leaderboard */}
            <Button
              id="trophy-button"
              variant="ghost"
              size="sm"
              onClick={openLeaderboard}
              className="w-full gap-2 font-bold tracking-widest uppercase"
              title="Leaderboard"
            >
              <Trophy size={14} strokeWidth={2.5} />
              <span>Ranks</span>
            </Button>

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
          </div>
        </main>
      )}

      {/* ── Leaderboard Modal (shared between mobile & desktop) ───────────── */}
      <LeaderboardModal
        entries={leaderboard.entries}
        isOpen={showLeaderboard}
        onClose={closeLeaderboard}
        highlightRank={newEntryRank}
      />

      {/* ── Name Prompt (shown on new high-score game-over) ───────────── */}
      <InitialsPrompt
        score={gameState.score}
        level={gameState.level}
        lines={gameState.lines}
        isOpen={promptingInitials}
        onSubmit={handleInitialsSubmit}
      />
    </div>
  )
}
