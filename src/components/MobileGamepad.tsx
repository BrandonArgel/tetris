import { memo, useCallback } from 'react'
import {
    ArrowLeft,
    ArrowRight,
    ArrowDown,
    RefreshCw,
    ChevronsDown,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GamepadActions {
    moveLeft: () => void
    moveRight: () => void
    rotate: () => void
    rotateCCW: () => void
    softDrop: () => void
    hardDrop: () => void
}

interface MobileGamepadProps {
    actions: GamepadActions
    isPaused: boolean
}

// ─── GamepadButton ────────────────────────────────────────────────────────────

interface GamepadButtonProps {
    id: string
    icon: React.ReactNode
    label: string
    onAction: () => void
    variant?: 'gamepad' | 'gamepad-action' | 'gamepad-primary'
    sizePx?: number
    className?: string
    disabled?: boolean
    style?: React.CSSProperties
}

const GamepadButton = memo(function GamepadButton({
    id,
    icon,
    label,
    onAction,
    variant = 'gamepad',
    className,
    disabled,
    style,
}: GamepadButtonProps) {
    /** onTouchStart fires instantly — bypasses the 300 ms click delay */
    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            e.preventDefault()
            onAction()
        },
        [onAction],
    )

    /** Fallback for mouse / DevTools pointer emulation */
    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            if (e.pointerType !== 'touch') {
                e.preventDefault()
                onAction()
            }
        },
        [onAction],
    )

    return (
        <Button
            id={id}
            variant={variant}
            size="icon"
            aria-label={label}
            className={cn('gamepad-btn active:scale-90 rounded-xl', className)}
            style={{ touchAction: 'none', ...style }}
            onTouchStart={handleTouchStart}
            onPointerDown={handlePointerDown}
            onContextMenu={e => e.preventDefault()}
            disabled={disabled}
        >
            {icon}
        </Button>
    )
})

// ─── MobileGamepad ────────────────────────────────────────────────────────────

/**
 * Ergonomic on-screen gamepad using CSS Grid for precise thumb placement.
 *
 * Left thumb  ── D-Pad (3-col grid)   │  Right thumb ── Actions (2-col grid)
 * ─────────────────────────────────────────────────────────────────────────────
 *  [ ← ]  [   ]  [ → ]                │  [   ]  [ ↻ Rotate   ]
 *  [   ]  [ ↓ ]  [   ]                │  [ ⬇ Hard Drop   ]  [  ]
 *
 * The centre cell of the D-Pad is intentionally empty so arrows feel like a
 * cohesive cross. Hard Drop spans two columns for a bigger, easier target.
 */
export const MobileGamepad = memo(function MobileGamepad({
    actions,
    isPaused,
}: MobileGamepadProps) {
    return (
        <div
            className="w-full max-w-sm mx-auto shrink-0 z-20 flex items-end justify-between px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3 h-auto max-h-[25vh]"
            style={{ background: 'linear-gradient(to top, rgba(3,7,18,0.98) 60%, transparent)' }}
        >
            {/* ── Left cluster: D-pad ─────────────────────────────────────── */}
            {/*
             *  Grid layout (3 × 2):
             *    Col1     Col2    Col3
             *  [ ← ]    [    ]  [ → ]
             *  [    ]   [ ↓  ]  [   ]
             */}
            <div className="grid grid-cols-3 grid-rows-2 gap-2">
                {/* Left  — row 1, col 1 */}
                <GamepadButton
                    id="gp-left"
                    icon={<ArrowLeft size={22} strokeWidth={2.5} />}
                    label="Move left"
                    onAction={actions.moveLeft}
                    disabled={isPaused}
                    className="col-start-1 row-start-1 w-14 h-14 sm:w-16 sm:h-16"
                />

                {/* Right — row 1, col 3 */}
                <GamepadButton
                    id="gp-right"
                    icon={<ArrowRight size={22} strokeWidth={2.5} />}
                    label="Move right"
                    onAction={actions.moveRight}
                    disabled={isPaused}
                    className="col-start-3 row-start-1 w-14 h-14 sm:w-16 sm:h-16"
                />

                {/* Down (Soft Drop) — row 2, col 2 */}
                <GamepadButton
                    id="gp-down"
                    icon={<ArrowDown size={22} strokeWidth={2.5} />}
                    label="Soft drop"
                    onAction={actions.softDrop}
                    disabled={isPaused}
                    className="col-start-2 row-start-2 w-14 h-14 sm:w-16 sm:h-16"
                />
            </div>

            {/* ── Right cluster: action buttons ────────────────────────────── */}
            {/*
             *  Grid layout (2 × 2):
             *    Col1              Col2
             *  [        ]        [ ↻ Rotate ]
             *  [ ⬇ Hard Drop (col-span 2)   ]
             */}
            <div className="grid grid-cols-2 grid-rows-2 gap-2">
                {/* Rotate — row 1, col 2 (right-hand, natural thumb reach) */}
                <GamepadButton
                    id="gp-rotate"
                    icon={<RefreshCw size={22} strokeWidth={2.5} />}
                    label="Rotate"
                    onAction={actions.rotate}
                    variant="gamepad-action"
                    disabled={isPaused}
                    className="col-start-1 row-start-1 w-14 h-14 sm:w-16 sm:h-16"
                />

                {/* Rotate CCW — row 1, col 1 (left-hand, natural thumb reach) */}
                <GamepadButton
                    id="gp-rotate-ccw"
                    icon={<RefreshCw size={22} strokeWidth={2.5} />}
                    label="Rotate CCW"
                    onAction={actions.rotateCCW}
                    variant="gamepad-action"
                    disabled={isPaused}
                    className="col-start-2 row-start-1 w-14 h-14 sm:w-16 sm:h-16 rotate-x-180"
                />

                {/* Hard Drop — row 2, spans both columns (wide target) */}
                <div className="col-span-2 row-start-2">
                    <GamepadButton
                        id="gp-harddrop"
                        icon={<ChevronsDown size={22} strokeWidth={2.5} />}
                        label="Hard drop"
                        onAction={actions.hardDrop}
                        variant="gamepad-primary"
                        disabled={isPaused}
                        className="w-full h-14 sm:h-16 rounded-xl"
                    />
                </div>
            </div>
        </div>
    )
})
