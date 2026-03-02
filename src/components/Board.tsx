import type { BoardState } from '@/engine/types'
import { BoardRow } from './BoardRow'

interface BoardProps {
    board: BoardState
    clearingRows?: number[]
}

/**
 * The main 10×20 Tetris playfield.
 *
 * Sizing is handled entirely by CSS:
 *  - `aspect-[1/2]` locks the 10:20 ratio.
 *  - `h-full` + `w-auto` lets the board expand to fill all available height,
 *    while the parent flex container constrains it.
 *  - CSS Grid auto-sizes each cell — no JS pixel calculations needed.
 */
export function Board({ board, clearingRows = [] }: BoardProps) {
    const clearingSet = new Set(clearingRows)

    return (
        <div
            className="relative grid h-full max-h-full w-auto grid-cols-10 grid-rows-20 overflow-hidden rounded-lg border border-cyan-500/30 bg-gray-950"
            style={{ aspectRatio: '10 / 20', boxShadow: '0 0 40px rgba(0,240,255,0.10), 0 0 80px rgba(0,240,255,0.05)' }}
        >
            {board.map((row, rowIdx) => (
                <BoardRow key={rowIdx} row={row} isClearing={clearingSet.has(rowIdx)} />
            ))}
        </div>
    )
}
