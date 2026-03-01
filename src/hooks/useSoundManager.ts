import { useRef, useState, useCallback } from 'react'

// ─── Sound Types ──────────────────────────────────────────────────────────────

export type SoundType = 'move' | 'rotate' | 'hardDrop' | 'lineClear' | 'gameOver'

// ─── Synthesised Sounds ───────────────────────────────────────────────────────

/**
 * Plays a synthesised sound using the Web Audio API.
 * Each sound is a programmatic oscillator — no audio files required.
 */
function synthesise(ctx: AudioContext, type: SoundType): void {
    const now = ctx.currentTime
    const gain = ctx.createGain()
    gain.connect(ctx.destination)
    gain.gain.setValueAtTime(0.08, now)

    switch (type) {
        case 'move': {
            // Short square click
            const osc = ctx.createOscillator()
            osc.connect(gain)
            osc.type = 'square'
            osc.frequency.setValueAtTime(220, now)
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)
            osc.start(now)
            osc.stop(now + 0.04)
            break
        }
        case 'rotate': {
            // Rising sine sweep
            const osc = ctx.createOscillator()
            osc.connect(gain)
            osc.type = 'sine'
            osc.frequency.setValueAtTime(330, now)
            osc.frequency.linearRampToValueAtTime(520, now + 0.08)
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
            osc.start(now)
            osc.stop(now + 0.1)
            break
        }
        case 'hardDrop': {
            // Falling sawtooth thud
            const osc = ctx.createOscillator()
            osc.connect(gain)
            osc.type = 'sawtooth'
            osc.frequency.setValueAtTime(200, now)
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.12)
            gain.gain.setValueAtTime(0.12, now)
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14)
            osc.start(now)
            osc.stop(now + 0.14)
            break
        }
        case 'lineClear': {
            // Two-note chord arpeggio (celebratory)
            const freqs = [660, 880, 1100]
            freqs.forEach((freq, i) => {
                const osc = ctx.createOscillator()
                const g = ctx.createGain()
                osc.connect(g)
                g.connect(ctx.destination)
                osc.type = 'sine'
                osc.frequency.setValueAtTime(freq, now + i * 0.05)
                g.gain.setValueAtTime(0.06, now + i * 0.05)
                g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.2)
                osc.start(now + i * 0.05)
                osc.stop(now + i * 0.05 + 0.22)
            })
            break
        }
        case 'gameOver': {
            // Descending sawtooth dirge
            const osc = ctx.createOscillator()
            osc.connect(gain)
            osc.type = 'sawtooth'
            osc.frequency.setValueAtTime(280, now)
            osc.frequency.linearRampToValueAtTime(60, now + 0.7)
            gain.gain.setValueAtTime(0.1, now)
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75)
            osc.start(now)
            osc.stop(now + 0.8)
            break
        }
    }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface SoundManager {
    /** Play a synthesised sound. Ref-stable — calling this never causes re-renders. */
    play: (sound: SoundType) => void
    /** Whether the sound is currently muted. */
    muted: boolean
    /** Toggle mute on/off. */
    toggleMute: () => void
}

/**
 * `useSoundManager` provides a Web Audio API–based sound synthesiser.
 *
 * Design decisions:
 *  - `AudioContext` is created lazily on the **first `play()` call** to comply
 *    with browser autoplay policies (context must follow a user gesture).
 *  - `play` is a **stable callback** stored in a ref — calling it never triggers
 *    a re-render in the consuming component.
 *  - `muted` IS exposed as React state so the UI toggle button re-renders correctly.
 */
export function useSoundManager(): SoundManager {
    const ctxRef = useRef<AudioContext | null>(null)
    const mutedRef = useRef(false)
    const [muted, setMuted] = useState(false)

    /** Lazily initialise the AudioContext after a user gesture. */
    const getCtx = useCallback((): AudioContext => {
        if (!ctxRef.current) {
            ctxRef.current = new AudioContext()
        }
        if (ctxRef.current.state === 'suspended') {
            void ctxRef.current.resume()
        }
        return ctxRef.current
    }, [])

    const play = useCallback(
        (sound: SoundType): void => {
            if (mutedRef.current) return
            try {
                synthesise(getCtx(), sound)
            } catch {
                // Silently swallow any AudioContext errors (e.g., browser restrictions)
            }
        },
        [getCtx],
    )

    const toggleMute = useCallback(() => {
        mutedRef.current = !mutedRef.current
        setMuted(mutedRef.current)
    }, [])

    return { play, muted, toggleMute }
}
