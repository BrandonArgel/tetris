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
    /** Pixel size passed to the square Button */
    sizePx?: number
    className?: string
    disabled?: boolean
}

const GamepadButton = memo(function GamepadButton({
    id,
    icon,
    label,
    onAction,
    variant = 'gamepad',
    sizePx = 56,
    className,
    disabled,
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
            style={{ width: sizePx, height: sizePx }}
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
 * Ergonomic on-screen gamepad for two-thumb play.
 *
 *  Left thumb        │ Centre │  Right thumb
 *  ────────────────────────────────────────
 *  [ ← ]             │  [ ⏸ ] │  [ ↻ Rotate    ]
 *  [ ↓ Soft ] [ → ]  │        │  [ ⬇ Hard Drop  ]
 */
export const MobileGamepad = memo(function MobileGamepad({
    actions,
    isPaused,
}: MobileGamepadProps) {
    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-20 flex items-end justify-between px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3"
            style={{ background: 'linear-gradient(to top, rgba(3,7,18,0.98) 60%, transparent)' }}
        >
            {/* ── Left cluster: D-pad ─────────────────────────────────────── */}
            <div className="flex flex-col items-start gap-2.5">
                <GamepadButton
                    id="gp-left"
                    icon={<ArrowLeft size={22} strokeWidth={2.5} />}
                    label="Move left"
                    onAction={actions.moveLeft}
                    sizePx={60}
                    disabled={isPaused}
                />
                <div className="flex gap-2.5">
                    <GamepadButton
                        id="gp-down"
                        icon={<ArrowDown size={22} strokeWidth={2.5} />}
                        label="Soft drop"
                        onAction={actions.softDrop}
                        sizePx={60}
                        disabled={isPaused}
                    />
                    <GamepadButton
                        id="gp-right"
                        icon={<ArrowRight size={22} strokeWidth={2.5} />}
                        label="Move right"
                        onAction={actions.moveRight}
                        sizePx={60}
                        disabled={isPaused}
                    />
                </div>
            </div>

            {/* ── Right cluster: action buttons ────────────────────────────── */}
            <div className="flex flex-col items-end gap-2.5">
                <GamepadButton
                    id="gp-rotate"
                    icon={<RefreshCw size={22} strokeWidth={2.5} />}
                    label="Rotate"
                    onAction={actions.rotate}
                    variant="gamepad-action"
                    sizePx={60}
                    disabled={isPaused}
                />
                <GamepadButton
                    id="gp-harddrop"
                    icon={<ChevronsDown size={22} strokeWidth={2.5} />}
                    label="Hard drop"
                    onAction={actions.hardDrop}
                    variant="gamepad-primary"
                    sizePx={60}
                    disabled={isPaused}
                />
            </div>
        </div>
    )
})
