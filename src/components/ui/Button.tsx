import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

// ─── CVA variant definition ───────────────────────────────────────────────────

/**
 * `buttonVariants` is the single source of truth for every button style in the
 * app. All conditional class logic is handled by CVA — callers just pick a
 * `variant` and `size`, then optionally append extra classes via `cn()`.
 */
export const buttonVariants = cva(
    // ── Shared base ──────────────────────────────────────────────────────────
    [
        'inline-flex cursor-pointer select-none items-center justify-center gap-2',
        'rounded-lg font-medium leading-none',
        'transition-[transform,background-color,border-color,box-shadow] duration-75',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60',
        'disabled:pointer-events-none disabled:opacity-40',
    ],
    {
        variants: {
            variant: {
                /** Prominent filled — start/restart overlays */
                primary:
                    'border border-cyan-500/60 bg-cyan-500/10 text-cyan-300 ' +
                    'hover:border-cyan-400 hover:bg-cyan-500/20 ' +
                    'hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]',

                /** Subtle bordered — HUD controls (Pause, Sound) */
                ghost:
                    'border border-white/10 bg-white/5 text-gray-300 ' +
                    'hover:border-white/20 hover:bg-white/10 hover:text-white',

                /** Danger / end-game — Play Again */
                destructive:
                    'border border-red-500/50 bg-red-500/10 text-red-300 ' +
                    'hover:border-red-400 hover:bg-red-500/20',

                /** Gamepad movement (D-pad directional buttons) */
                gamepad:
                    'gamepad-btn border border-white/15 bg-white/8 text-white/80 ' +
                    'shadow-md backdrop-blur-sm ' +
                    'active:scale-90 active:bg-white/20 active:brightness-125',

                /** Gamepad action — Rotate (purple accent) */
                'gamepad-action':
                    'gamepad-btn border border-purple-500/40 bg-purple-500/15 text-purple-200 ' +
                    'shadow-[0_0_12px_rgba(168,85,247,0.2)] ' +
                    'active:scale-90 active:bg-purple-500/35',

                /** Gamepad primary — Hard Drop (cyan accent) */
                'gamepad-primary':
                    'gamepad-btn border border-cyan-500/40 bg-cyan-500/15 text-cyan-200 ' +
                    'shadow-[0_0_12px_rgba(0,240,255,0.2)] ' +
                    'active:scale-90 active:bg-cyan-500/35',
            },

            size: {
                /** Standard text + icon button */
                default: 'h-10 px-4 text-sm',
                /** Compact — keyboard hints, side-panel controls */
                sm: 'h-8 px-3 text-xs',
                /** Hero CTA */
                lg: 'h-12 px-6 text-base',
                /** Square icon button — header Mute/Pause on desktop & mobile */
                icon: 'h-9 w-9 p-0',
                /** Large square — gamepad thumb buttons */
                'gamepad-btn': 'rounded-xl p-0',
            },
        },
        defaultVariants: {
            variant: 'ghost',
            size: 'default',
        },
    },
)

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    /** Additional Tailwind classes — twMerge resolves conflicts with CVA output. */
    className?: string
    children: React.ReactNode
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Reusable `Button` component.
 *
 * ```tsx
 * // HUD icon button
 * <Button variant="ghost" size="icon"><Volume2 size={16}/></Button>
 *
 * // Full-width CTA
 * <Button variant="primary" size="lg" className="w-full tracking-widest uppercase">
 *   Press Enter / Click to Start
 * </Button>
 *
 * // Mobile gamepad — zero-latency touch
 * <Button
 *   variant="gamepad"
 *   size="gamepad-btn"
 *   style={{ width: 60, height: 60 }}
 *   onTouchStart={e => { e.preventDefault(); onMoveLeft() }}
 * >
 *   <ArrowLeft size={22} />
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { variant, size, className, children, ...rest },
    ref,
) {
    return (
        <button
            ref={ref}
            className={cn(buttonVariants({ variant, size }), className)}
            {...rest}
        >
            {children}
        </button>
    )
})
