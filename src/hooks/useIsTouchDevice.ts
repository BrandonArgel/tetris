import { useState, useEffect } from 'react'

/**
 * `useIsTouchDevice` — reactive touch/mobile detection.
 *
 * ## Why not just `'ontouchstart' in window`?
 * A bare capability check is read once at module-evaluation time and never
 * updates. It also returns `true` for laptops with touch screens where you
 * still want the keyboard-driven desktop UI.
 *
 * ## Strategy (two independent signals, ANDed together)
 *
 * 1. **Pointer capability** — `navigator.maxTouchPoints > 0` is the modern,
 *    spec-blessed way to detect touch hardware. It's supported in all current
 *    browsers and is not spoofable by DevTools user-agent overrides alone.
 *
 * 2. **Viewport width** — `window.matchMedia('(max-width: 768px)')` targets
 *    the typical breakpoint where a software gamepad makes sense. This responds
 *    reactively via a `change` event listener, so moving to/from desktop
 *    viewport re-evaluates cleanly (useful in DevTools responsive mode).
 *
 * A device must satisfy **both** conditions to show the gamepad. This prevents
 * a user on a Surface Pro (touch laptop, wide viewport) from seeing the
 * on-screen gamepad while still catching phones & tablets correctly.
 *
 * ## SSR safety
 * The initial state is `false` (server/no-window default). The real value is
 * set in a `useEffect` after mount, so hydration never mismatches.
 */
export function useIsTouchDevice(): boolean {
    const [isTouch, setIsTouch] = useState<boolean>(false)

    useEffect(() => {
        const mq = window.matchMedia('(max-width: 768px)')

        const evaluate = (): boolean => {
            const hasTouch =
                navigator.maxTouchPoints > 0 ||
                // Legacy fallback for older iOS/Android WebViews
                ('ontouchstart' in window)
            return hasTouch && mq.matches
        }

        setIsTouch(evaluate())

        // Re-evaluate whenever the viewport crosses the breakpoint
        const handleChange = () => setIsTouch(evaluate())
        mq.addEventListener('change', handleChange)

        return () => mq.removeEventListener('change', handleChange)
    }, [])

    return isTouch
}
