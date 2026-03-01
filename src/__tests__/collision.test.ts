import { describe, it, expect } from 'vitest'
import { isValidPosition } from '../engine/collision'
import { createBoard, BOARD_COLS, BOARD_ROWS } from '../engine/board'

describe('isValidPosition', () => {
    it('returns true for a piece at top-left with empty board', () => {
        const board = createBoard()
        const matrix = [[1]]
        expect(isValidPosition(board, matrix, 0, 0)).toBe(true)
    })

    it('returns false when piece exceeds right boundary', () => {
        const board = createBoard()
        const matrix = [[1, 1]]
        expect(isValidPosition(board, matrix, BOARD_COLS - 1, 0)).toBe(false)
    })

    it('returns false when piece exceeds left boundary', () => {
        const board = createBoard()
        const matrix = [[1]]
        expect(isValidPosition(board, matrix, -1, 0)).toBe(false)
    })

    it('returns false when piece exceeds bottom boundary', () => {
        const board = createBoard()
        const matrix = [[1]]
        expect(isValidPosition(board, matrix, 0, BOARD_ROWS)).toBe(false)
    })

    it('allows piece cells above the board (y < 0)', () => {
        const board = createBoard()
        const matrix = [[1, 1], [1, 1]]
        // Top row is off-screen but bottom row is valid
        expect(isValidPosition(board, matrix, 0, -1)).toBe(true)
    })

    it('returns false when piece overlaps an occupied cell', () => {
        const board = createBoard()
        board[0][0] = '#ff0000'
        const matrix = [[1]]
        expect(isValidPosition(board, matrix, 0, 0)).toBe(false)
    })

    it('returns true when piece does not overlap occupied cells', () => {
        const board = createBoard()
        board[0][1] = '#ff0000'
        const matrix = [[1]]
        expect(isValidPosition(board, matrix, 0, 0)).toBe(true)
    })

    it('ignores zero cells in the matrix', () => {
        const board = createBoard()
        board[0][0] = '#ff0000'
        // matrix[0][0] is 0, so it should not collide with board[0][0]
        const matrix = [[0, 1]]
        expect(isValidPosition(board, matrix, 0, 0)).toBe(true)
    })
})
