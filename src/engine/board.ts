import type { BoardState } from './types'

export const BOARD_COLS = 10
export const BOARD_ROWS = 20

/** Create a fresh empty board. */
export function createBoard(): BoardState {
    return Array.from({ length: BOARD_ROWS }, () => Array(BOARD_COLS).fill(''))
}

/**
 * Returns a new board with the piece's color stamped at its current position.
 * Does NOT mutate the original board.
 */
export function stampPiece(board: BoardState, matrix: number[][], x: number, y: number, color: string): BoardState {
    const next = board.map(row => [...row])
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] !== 0) {
                const boardRow = y + row
                const boardCol = x + col
                if (boardRow >= 0 && boardRow < BOARD_ROWS && boardCol >= 0 && boardCol < BOARD_COLS) {
                    next[boardRow][boardCol] = color
                }
            }
        }
    }
    return next
}

export interface ClearResult {
    newBoard: BoardState
    linesCleared: number
}

/**
 * Returns the 0-based row indices of fully filled rows (top-to-bottom order).
 * Pure function — does NOT mutate the board.
 */
export function getFullRowIndices(board: BoardState): number[] {
    return board
        .map((row, i) => (row.every(cell => cell !== '') ? i : -1))
        .filter((i): i is number => i !== -1)
}

/**
 * Removes any completely filled rows and shifts everything above down.
 * Returns the new board and the count of cleared lines.
 */
export function clearLines(board: BoardState): ClearResult {
    const remaining = board.filter(row => row.some(cell => cell === ''))
    const linesCleared = BOARD_ROWS - remaining.length
    const emptyRows = Array.from({ length: linesCleared }, () => Array(BOARD_COLS).fill(''))
    return {
        newBoard: [...emptyRows, ...remaining],
        linesCleared,
    }
}
