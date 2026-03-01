import { useRef, useCallback, useEffect } from 'react'
import { dropInterval } from '../engine/scoring'

interface GameLoopOptions {
    /** Returns the current level (used to compute drop interval). */
    getLevel: () => number
    /** Called once per gravity tick - should advance the engine one step. */
    onTick: () => void
    /** Called every rAF frame - should sync the engine ref into React state. */
    onFrame: () => void
}

/**
 * `useGameLoop` manages the requestAnimationFrame game loop.
 *
 * ## Pause-exploit fix
 * Previously, `startLoop()` always reset `lastTickRef` to `performance.now()`,
 * giving the piece a full fresh interval on every resume — a player could spam
 * pause to prevent pieces from ever falling.
 *
 * **Fix:** `stopLoop()` now records how much of the current tick interval had
 * already elapsed into `pausedElapsedRef`. `startLoop()` then offsets the
 * initial `lastTick` *backwards* by that amount, so the timer resumes exactly
 * where it paused rather than resetting to zero.
 *
 * Other invariants:
 *  - All timing state lives in refs — zero setState calls here.
 *  - `getLevel` is a ref-based getter so the interval is always current.
 *  - `onTick` is called AT MOST once per computed gravity interval.
 *  - `onFrame` is called after every rAF to push an engine snapshot to React.
 */
export function useGameLoop({ getLevel, onTick, onFrame }: GameLoopOptions) {
    const rafRef = useRef<number | null>(null)
    const lastTickRef = useRef<number>(0)
    const isRunningRef = useRef(false)
    /**
     * Milliseconds already elapsed within the current drop interval at the
     * moment the loop was most recently stopped. Starts at 0 (full interval)
     * and is written by `stopLoop()` / read by `startLoop()`.
     */
    const pausedElapsedRef = useRef<number>(0)

    // Keep stable function refs so the rAF closure never goes stale.
    const getLevelRef = useRef(getLevel)
    const onTickRef = useRef(onTick)
    const onFrameRef = useRef(onFrame)
    useEffect(() => { getLevelRef.current = getLevel }, [getLevel])
    useEffect(() => { onTickRef.current = onTick }, [onTick])
    useEffect(() => { onFrameRef.current = onFrame }, [onFrame])

    const loop = useCallback((timestamp: number) => {
        if (!isRunningRef.current) return

        const interval = dropInterval(getLevelRef.current())
        if (timestamp - lastTickRef.current >= interval) {
            lastTickRef.current = timestamp
            onTickRef.current()
        }

        onFrameRef.current()
        rafRef.current = requestAnimationFrame(loop)
    }, []) // stable — no deps change identity

    const startLoop = useCallback(() => {
        if (isRunningRef.current) return
        isRunningRef.current = true

        // Offset lastTick backwards by however much time had already elapsed,
        // so the next tick fires after (interval - pausedElapsed) ms, not
        // after a full interval.
        const now = performance.now()
        lastTickRef.current = now - pausedElapsedRef.current
        pausedElapsedRef.current = 0  // consumed — reset for next pause

        rafRef.current = requestAnimationFrame(loop)
    }, [loop])

    const stopLoop = useCallback(() => {
        if (!isRunningRef.current) return
        isRunningRef.current = false

        // Capture elapsed progress so startLoop() can resume from this point.
        pausedElapsedRef.current = performance.now() - lastTickRef.current

        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = null
        }
    }, [])

    // Ensure loop is cleaned up when the component unmounts.
    useEffect(() => () => { stopLoop() }, [stopLoop])

    return { startLoop, stopLoop }
}
