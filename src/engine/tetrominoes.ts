import type { Matrix, Piece, TetrominoType } from './types'

// ─── Piece Shapes ─────────────────────────────────────────────────────────────

const SHAPES: Record<TetrominoType, Matrix> = {
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    O: [
        [1, 1],
        [1, 1],
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
    ],
}

export const COLORS: Record<TetrominoType, string> = {
    I: '#00f0ff',
    O: '#f0d000',
    T: '#a000f0',
    S: '#00f000',
    Z: '#f00000',
    J: '#0000f0',
    L: '#f0a000',
}

const TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']

// ─── Bag-7 Random Generator ───────────────────────────────────────────────────

let bag: TetrominoType[] = []

/** Unbiased Fisher-Yates shuffle — every permutation is equally probable. */
function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
}

function refillBag(): void {
    bag = shuffle([...TYPES])
}

export function nextFromBag(): TetrominoType {
    if (bag.length === 0) refillBag()
    return bag.pop()!
}

/** Reset bag (needed when a new game starts). */
export function resetBag(): void {
    bag = []
}

// ─── Piece Factory ────────────────────────────────────────────────────────────

export function createPiece(type: TetrominoType): Piece {
    const matrix = SHAPES[type]
    const color = COLORS[type]
    // Spawn near top-center of a 10-wide board
    const x = Math.floor((10 - matrix[0].length) / 2)
    const y = type === 'I' ? -1 : 0
    return { type, matrix, x, y, color }
}
