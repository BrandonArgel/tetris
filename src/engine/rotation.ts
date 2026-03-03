import type { BoardState, Matrix, Piece } from './types'
import { isValidPosition } from './collision'

/**
 * Rotates a matrix 90° clockwise.
 * Uses the standard transpose-then-reverse-rows algorithm.
 */
export function rotateMatrix(matrix: Matrix): Matrix {
    console.log('rotateMatrix', matrix)
    const rows = matrix.length
    const cols = matrix[0].length
    const rotated: Matrix = Array.from({ length: cols }, () => Array(rows).fill(0))
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            rotated[c][rows - 1 - r] = matrix[r][c]
        }
    }
    return rotated
}

/**
 * Rotates a matrix 90° counter-clockwise.
 * Uses the standard transpose-then-reverse-rows algorithm.
 */
export function rotateMatrixCCW(matrix: Matrix): Matrix {
    console.log('rotateMatrixCCW', matrix)
    const rows = matrix.length
    const cols = matrix[0].length
    const rotated: Matrix = Array.from({ length: cols }, () => Array(rows).fill(0))

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            rotated[cols - 1 - c][r] = matrix[r][c]
        }
    }
    return rotated
}

/**
 * SRS-lite wall-kick offsets to try when a rotation would otherwise be invalid.
 * Tries: no shift, shift left, shift right, shift left×2, shift right×2.
 */
const KICK_OFFSETS = [0, -1, 1, -2, 2]

/**
 * Attempts to rotate the piece clockwise.
 * Tries wall-kick x-offsets until a valid position is found.
 * Returns the rotated Piece, or the original if no valid rotation exists.
 */
export function rotatePiece(piece: Piece, board: BoardState): Piece {
    const rotated = rotateMatrix(piece.matrix)
    for (const dx of KICK_OFFSETS) {
        if (isValidPosition(board, rotated, piece.x + dx, piece.y)) {
            return { ...piece, matrix: rotated, x: piece.x + dx }
        }
    }
    return piece // rotation not possible
}

export function rotatePieceCCW(piece: Piece, board: BoardState): Piece {
    const rotated = rotateMatrixCCW(piece.matrix)
    for (const dx of KICK_OFFSETS) {
        if (isValidPosition(board, rotated, piece.x + dx, piece.y)) {
            return { ...piece, matrix: rotated, x: piece.x + dx }
        }
    }

    return piece // rotation not possible
}

/**
 * Computes the Y coordinate where the piece would land if hard-dropped.
 */
export function computeGhostY(board: BoardState, matrix: Matrix, x: number, y: number): number {
    let ghostY = y
    while (isValidPosition(board, matrix, x, ghostY + 1)) {
        ghostY++
    }
    return ghostY
}
