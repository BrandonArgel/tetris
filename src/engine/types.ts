// ─── Domain Types ────────────────────────────────────────────────────────────

export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

/** A 2-D matrix of 0/1 representing a piece's shape. */
export type Matrix = number[][]

/**
 * The board is a 2-D array of colour strings.
 * An empty cell is represented by an empty string `''`.
 */
export type BoardState = string[][]

export type GameStatus = 'idle' | 'playing' | 'paused' | 'clearing' | 'gameover'

export interface Piece {
    type: TetrominoType
    matrix: Matrix
    x: number
    y: number
    color: string
}

export interface GameState {
    board: BoardState
    activePiece: Piece | null
    nextPiece: Piece
    ghostY: number
    score: number
    level: number
    lines: number
    status: GameStatus
    /** Row indices (0-based from top) that are pending the clear animation. Empty when idle. */
    clearingRows: number[]
}
