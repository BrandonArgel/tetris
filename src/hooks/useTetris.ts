import { useRef, useState, useCallback, useEffect } from 'react'
import { GameEngine } from '@/engine/engine'
import type { GameState, BoardState } from '@/engine/types'
import { useGameLoop } from './useGameLoop'
import type { SoundManager } from './useSoundManager'

// ─── Keyboard Key Bindings ────────────────────────────────────────────────────

const KEY_MAP: Record<string, string> = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowDown: 'softDrop',
    ArrowUp: 'rotate',
    ' ': 'hardDrop',
    Escape: 'pause',
    p: 'pause',
    P: 'pause',
}

// ─── useTetris ────────────────────────────────────────────────────────────────

export interface TetrisOptions {
    /** Optional stable sound play callback from useSoundManager. */
    playSound?: SoundManager['play']
}

export interface TetrisAPI {
    gameState: GameState
    visualBoard: BoardState
    startGame: () => void
    togglePause: () => void
}

/** Duration of the line-clear flash animation in milliseconds. */
const CLEAR_ANIM_MS = 220

/**
 * `useTetris` is the single public interface between React and the game engine.
 *
 * Key decisions:
 *  - `engineRef` holds the stable `GameEngine` — never recreated.
 *  - `stateRef` is a mutable ref updated by every engine call (zero React cost).
 *  - `setState` is called from the rAF `onFrame` callback (once per frame) and
 *    immediately after user input for crisp responsiveness.
 *  - Line-clear animation: `useEffect` watches `clearingRows`; when non-empty it
 *    waits `CLEAR_ANIM_MS` then calls `engine.finalizeClear()`.
 *  - Sound: `playSound` is called only on discrete events, never from `onFrame`.
 */
export function useTetris({ playSound }: TetrisOptions = {}): TetrisAPI {
    const engineRef = useRef<GameEngine>(new GameEngine())
    const playSoundRef = useRef(playSound)
    useEffect(() => { playSoundRef.current = playSound }, [playSound])

    // ─── State ──────────────────────────────────────────────────────────────

    const [gameState, setGameState] = useState<GameState>(() => engineRef.current.getState())
    const [visualBoard, setVisualBoard] = useState<BoardState>(() => engineRef.current.getVisualBoard())

    // Mutable ref so loop callbacks never capture stale state
    const stateRef = useRef<GameState>(gameState)

    const pushState = useCallback((s: GameState) => {
        stateRef.current = s
        setGameState(s)
        setVisualBoard(engineRef.current.getVisualBoard())
    }, [])

    // ─── rAF Loop ────────────────────────────────────────────────────────────

    const getLevel = useCallback((): number => stateRef.current.level, [])

    const onTick = useCallback(() => {
        // Skip gravity during clearing animation — engine handles the guard too
        if (stateRef.current.status !== 'playing') return
        const next = engineRef.current.tick()
        stateRef.current = next
    }, [])

    const onFrame = useCallback(() => {
        setGameState(stateRef.current)
        setVisualBoard(engineRef.current.getVisualBoard())
    }, [])

    const { startLoop, stopLoop } = useGameLoop({ getLevel, onTick, onFrame })

    // ─── Line-Clear Animation Effect ─────────────────────────────────────────

    useEffect(() => {
        if (gameState.status !== 'clearing' || gameState.clearingRows.length === 0) return

        // Play sound immediately when clearing starts
        playSoundRef.current?.('lineClear')

        const id = window.setTimeout(() => {
            const next = engineRef.current.finalizeClear()
            pushState(next)
        }, CLEAR_ANIM_MS)

        return () => clearTimeout(id)
    }, [gameState.status, gameState.clearingRows, pushState])

    // ─── Stop loop on game over ───────────────────────────────────────────────

    useEffect(() => {
        if (gameState.status === 'gameover') {
            stopLoop()
            playSoundRef.current?.('gameOver')
        }
    }, [gameState.status, stopLoop])

    // ─── Keyboard Input ───────────────────────────────────────────────────────

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            let action = KEY_MAP[e.key]

            if (e.key === 'ArrowUp' && e.shiftKey) {
                action = 'rotateCCW'
            }

            if (!action) return

            if (['ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowUp', ' '].includes(e.key)) {
                e.preventDefault()
            }

            const engine = engineRef.current
            let next: GameState | null = null
            let sound: Parameters<NonNullable<TetrisOptions['playSound']>>[0] | null = null

            switch (action) {
                case 'left':
                    next = engine.moveLeft()
                    sound = 'move'
                    break
                case 'right':
                    next = engine.moveRight()
                    sound = 'move'
                    break
                case 'softDrop':
                    next = engine.softDrop()
                    break
                case 'hardDrop':
                    next = engine.hardDrop()
                    sound = 'hardDrop'
                    break
                case 'rotate':
                    next = engine.rotate()
                    sound = 'rotate'
                    break
                case 'rotateCCW':
                    next = engine.rotateCCW()
                    sound = 'rotate'
                    break
                case 'pause':
                    if (stateRef.current.status === 'playing') {
                        next = engine.pause()
                        stopLoop()
                    } else if (stateRef.current.status === 'paused') {
                        next = engine.resume()
                        startLoop()
                    }
                    break
            }

            if (next) {
                stateRef.current = next
                pushState(next)
                if (sound) playSoundRef.current?.(sound)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [startLoop, stopLoop, pushState])

    // ─── Public API ───────────────────────────────────────────────────────────

    const startGame = useCallback(() => {
        stopLoop()
        const next = engineRef.current.start()
        stateRef.current = next
        setGameState(next)
        setVisualBoard(engineRef.current.getVisualBoard())
        startLoop()
    }, [startLoop, stopLoop])

    const togglePause = useCallback(() => {
        const { status } = stateRef.current
        if (status === 'playing') {
            const next = engineRef.current.pause()
            pushState(next)
            stopLoop()
        } else if (status === 'paused') {
            const next = engineRef.current.resume()
            pushState(next)
            startLoop()
        }
    }, [startLoop, stopLoop, pushState])

    // ─── Expose gamepad controls as stable callbacks ──────────────────────────

    return { gameState, visualBoard, startGame, togglePause }
}

// ─── Gamepad Action Helper (re-exported for MobileGamepad) ───────────────────

/**
 * Factory that creates imperative action callbacks from the engine ref.
 * Used by MobileGamepad so it can call actions directly without prop-drilling.
 */
export function createGamepadActions(
    engineRef: React.RefObject<GameEngine>,
    stateRef: React.RefObject<GameState>,
    pushState: (s: GameState) => void,
    playSoundRef: React.RefObject<SoundManager['play'] | undefined>,
) {
    return {
        moveLeft: () => {
            if (stateRef.current?.status !== 'playing') return
            const next = engineRef.current?.moveLeft()
            if (next) { pushState(next); playSoundRef.current?.('move') }
        },
        moveRight: () => {
            if (stateRef.current?.status !== 'playing') return
            const next = engineRef.current?.moveRight()
            if (next) { pushState(next); playSoundRef.current?.('move') }
        },
        rotate: () => {
            if (stateRef.current?.status !== 'playing') return
            const next = engineRef.current?.rotate()
            if (next) { pushState(next); playSoundRef.current?.('rotate') }
        },
        rotateCCW: () => {
            if (stateRef.current?.status !== 'playing') return
            const next = engineRef.current?.rotateCCW()
            if (next) { pushState(next); playSoundRef.current?.('rotate') }
        },
        softDrop: () => {
            if (stateRef.current?.status !== 'playing') return
            const next = engineRef.current?.softDrop()
            if (next) pushState(next)
        },
        hardDrop: () => {
            if (stateRef.current?.status !== 'playing') return
            const next = engineRef.current?.hardDrop()
            if (next) { pushState(next); playSoundRef.current?.('hardDrop') }
        },
    }
}
