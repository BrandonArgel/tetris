import { describe, it, expect } from 'vitest'
import { rotateMatrix, computeGhostY } from '../engine/rotation'
import { createBoard, stampPiece, BOARD_ROWS } from '../engine/board'

describe('rotateMatrix', () => {
    it('rotates a 2×2 matrix clockwise', () => {
        const m = [[1, 0], [0, 1]]
        const r = rotateMatrix(m)
        expect(r).toEqual([[0, 1], [1, 0]])
    })

    it('rotates a 3×3 T piece matrix clockwise', () => {
        const T = [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ]
        const rotated = rotateMatrix(T)
        // After one CW rotation, T points right
        expect(rotated).toEqual([
            [0, 1, 0],
            [0, 1, 1],
            [0, 1, 0],
        ])
    })

    it('rotates a 4×4 I piece correctly', () => {
        const I = [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ]
        const rotated = rotateMatrix(I)
        expect(rotated).toEqual([
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
        ])
    })

    it('4 rotations returns to the original matrix', () => {
        const T = [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ]
        const r1 = rotateMatrix(T)
        const r2 = rotateMatrix(r1)
        const r3 = rotateMatrix(r2)
        const r4 = rotateMatrix(r3)
        expect(r4).toEqual(T)
    })
})

describe('computeGhostY', () => {
    it('returns a y-coord at the bottom of the board on empty board', () => {
        const board = createBoard()
        const matrix = [[1]]
        // A single 1×1 cell should fall to row BOARD_ROWS - 1
        const ghostY = computeGhostY(board, matrix, 0, 0)
        expect(ghostY).toBe(BOARD_ROWS - 1)
    })

    it('returns current y when piece is already at the bottom', () => {
        const board = createBoard()
        const matrix = [[1]]
        const ghostY = computeGhostY(board, matrix, 0, BOARD_ROWS - 1)
        expect(ghostY).toBe(BOARD_ROWS - 1)
    })

    it('stops above an occupied cell', () => {
        const board = createBoard()
        // Put a blocker in the middle
        board[10][0] = '#ff0000'
        const matrix = [[1]]
        const ghostY = computeGhostY(board, matrix, 0, 0)
        expect(ghostY).toBe(9) // stops just above row 10
    })
})

describe('stampPiece + rotation integration', () => {
    it('stamps a rotated matrix correctly', () => {
        const board = createBoard()
        const L = [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0],
        ]
        const rotated = rotateMatrix(L)
        const result = stampPiece(board, rotated, 0, 0, '#f0a000')
        // Verify at least one cell was stamped
        let stamped = 0
        result.forEach(row => row.forEach(c => { if (c !== '') stamped++ }))
        expect(stamped).toBeGreaterThan(0)
    })
})
