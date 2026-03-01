import type { BoardState, Matrix } from './types'
import { BOARD_COLS, BOARD_ROWS } from './board'

/**
 * Returns true if the piece (defined by matrix + x,y offset) is in a valid
 * position — within board bounds and not overlapping any occupied cells.
 */
export function isValidPosition(
    board: BoardState,
    matrix: Matrix,
    x: number,
    y: number,
): boolean {
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] === 0) continue
            const boardRow = y + row
            const boardCol = x + col
            // Allow cells above the visible board (spawning area)
            if (boardRow < 0) continue
            if (boardRow >= BOARD_ROWS) return false
            if (boardCol < 0 || boardCol >= BOARD_COLS) return false
            if (board[boardRow][boardCol] !== '') return false
        }
    }
    return true
}
