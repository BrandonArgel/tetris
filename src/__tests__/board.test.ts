import { describe, it, expect } from 'vitest'
import { createBoard, stampPiece, clearLines, BOARD_COLS, BOARD_ROWS } from '../engine/board'

describe('createBoard', () => {
    it('returns a board with BOARD_ROWS rows', () => {
        const board = createBoard()
        expect(board).toHaveLength(BOARD_ROWS)
    })

    it('each row has BOARD_COLS columns', () => {
        const board = createBoard()
        board.forEach(row => expect(row).toHaveLength(BOARD_COLS))
    })

    it('all cells are empty strings', () => {
        const board = createBoard()
        board.forEach(row => row.forEach(cell => expect(cell).toBe('')))
    })
})

describe('stampPiece', () => {
    it('stamps color at the correct position', () => {
        const board = createBoard()
        const matrix = [[1, 1], [1, 1]]
        const result = stampPiece(board, matrix, 0, 0, '#ff0000')
        expect(result[0][0]).toBe('#ff0000')
        expect(result[0][1]).toBe('#ff0000')
        expect(result[1][0]).toBe('#ff0000')
        expect(result[1][1]).toBe('#ff0000')
    })

    it('does not mutate the original board', () => {
        const board = createBoard()
        stampPiece(board, [[1]], 0, 0, '#ff0000')
        expect(board[0][0]).toBe('')
    })

    it('clips cells above the board gracefully', () => {
        const board = createBoard()
        const matrix = [[1, 1], [1, 1]]
        // y = -1 means top row is off-screen; only bottom row should stamp
        expect(() => stampPiece(board, matrix, 0, -1, '#ff0000')).not.toThrow()
        const result = stampPiece(board, matrix, 0, -1, '#ff0000')
        expect(result[0][0]).toBe('#ff0000') // only row 0 visible
    })

    it('leaves cells unaffected where matrix is 0', () => {
        const board = createBoard()
        const matrix = [[1, 0], [0, 1]]
        const result = stampPiece(board, matrix, 0, 0, '#00ff00')
        expect(result[0][0]).toBe('#00ff00')
        expect(result[0][1]).toBe('')
        expect(result[1][0]).toBe('')
        expect(result[1][1]).toBe('#00ff00')
    })
})

describe('clearLines', () => {
    it('returns 0 linesCleared when no full rows exist', () => {
        const board = createBoard()
        const { linesCleared } = clearLines(board)
        expect(linesCleared).toBe(0)
    })

    it('clears a single full row and shifts board down', () => {
        const board = createBoard()
        // Fill the last row
        board[BOARD_ROWS - 1] = Array(BOARD_COLS).fill('#ff0000')
        const { newBoard, linesCleared } = clearLines(board)
        expect(linesCleared).toBe(1)
        expect(newBoard).toHaveLength(BOARD_ROWS)
        // Last row should now be empty (shifted down from above)
        expect(newBoard[BOARD_ROWS - 1].every(c => c === '')).toBe(true)
        // New top row should be all empty
        expect(newBoard[0].every(c => c === '')).toBe(true)
    })

    it('clears multiple full rows', () => {
        const board = createBoard()
        board[BOARD_ROWS - 1] = Array(BOARD_COLS).fill('#ff0000')
        board[BOARD_ROWS - 2] = Array(BOARD_COLS).fill('#00ff00')
        const { newBoard, linesCleared } = clearLines(board)
        expect(linesCleared).toBe(2)
        expect(newBoard).toHaveLength(BOARD_ROWS)
    })

    it('does not clear a partially filled row', () => {
        const board = createBoard()
        board[BOARD_ROWS - 1] = Array(BOARD_COLS).fill('#ff0000')
        board[BOARD_ROWS - 1][0] = '' // leave one gap
        const { linesCleared } = clearLines(board)
        expect(linesCleared).toBe(0)
    })
})
