import { memo } from 'react'
import { cn } from '@/utils/cn'

interface CellProps {
    color: string
    isGhost?: boolean
    isClearing?: boolean
}

/** A single cell in the Tetris grid. Memoized to prevent re-renders of unchanged cells. */
export const Cell = memo(function Cell({ color, isGhost, isClearing }: CellProps) {
    const isEmpty = color === ''
    const isGhostCell = isGhost || (color.length === 9 && color.startsWith('#'))

    return (
        <div
            className={cn(
                'aspect-square w-full border border-white/5',
                isEmpty && 'bg-gray-950',
                !isEmpty && isGhostCell && 'border border-white/20 bg-transparent',
                !isEmpty && !isGhostCell && 'rounded-sm shadow-inner',
                isClearing && 'animate-row-flash',
            )}
            style={
                isEmpty
                    ? undefined
                    : isGhostCell
                        ? { borderColor: color.slice(0, 7), boxShadow: `inset 0 0 4px ${color.slice(0, 7)}44` }
                        : {
                            backgroundColor: color,
                            boxShadow: `inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.4), 0 0 8px ${color}88`,
                        }
            }
        />
    )
})
