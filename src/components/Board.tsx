import type { BoardState } from '@/engine/types'
import { BOARD_COLS, BOARD_ROWS } from '@/engine/board'
import { BoardRow } from './BoardRow'

interface BoardProps {
    board: BoardState
    cellSize: number
    clearingRows?: number[]
}

/**
 * The main 10×20 Tetris playfield.
 * `cellSize` drives both cell dimensions for responsive scaling.
 * `clearingRows` triggers the flash animation on those specific rows.
 */
export function Board({ board, cellSize, clearingRows = [] }: BoardProps) {
    const clearingSet = new Set(clearingRows)

    return (
        <div
            className="relative overflow-hidden rounded-lg border border-cyan-500/30 bg-gray-950"
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${BOARD_COLS}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${BOARD_ROWS}, ${cellSize}px)`,
                width: cellSize * BOARD_COLS,
                height: cellSize * BOARD_ROWS,
                boxShadow: '0 0 40px rgba(0,240,255,0.10), 0 0 80px rgba(0,240,255,0.05)',
            }}
        >
            {board.map((row, rowIdx) => (
                <BoardRow key={rowIdx} row={row} isClearing={clearingSet.has(rowIdx)} />
            ))}
        </div>
    )
}
