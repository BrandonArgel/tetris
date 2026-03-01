import { useCallback, useEffect, useRef, useState } from 'react'
import { BOARD_COLS, BOARD_ROWS } from '@/engine/board'

const DESKTOP_CELL_SIZE = 30 // px — 300×600 board

/**
 * Computes an optimal cell size based on the current viewport dimensions.
 * On desktop (wide/tall screens) it returns the fixed 30px.
 * On mobile it scales the board to fit within ~58% of the viewport height,
 * leaving room for the header and on-screen gamepad.
 */
function computeCellSize(): number {
    const vw = window.innerWidth
    const vh = window.innerHeight

    // Portrait / small screen — scale to viewport
    if (vw < 640 || vh < 700) {
        const byHeight = Math.floor((vh * 0.58) / BOARD_ROWS)
        const byWidth = Math.floor((vw * 0.62) / BOARD_COLS)
        return Math.max(14, Math.min(byHeight, byWidth))
    }

    return DESKTOP_CELL_SIZE
}

export interface BoardSize {
    cellSize: number
    boardWidth: number
    boardHeight: number
}

/**
 * Returns the optimal board cell size, recalculated on window resize.
 * All values are in pixels.
 */
export function useBoardSize(): BoardSize {
    const [cellSize, setCellSize] = useState(computeCellSize)
    const rafRef = useRef<number | null>(null)

    const handleResize = useCallback(() => {
        // Debounce via rAF — only recalculate on settled frame
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(() => {
            setCellSize(computeCellSize())
        })
    }, [])

    useEffect(() => {
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
        }
    }, [handleResize])

    return {
        cellSize,
        boardWidth: cellSize * BOARD_COLS,
        boardHeight: cellSize * BOARD_ROWS,
    }
}
