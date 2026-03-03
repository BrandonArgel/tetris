import type { BoardState, GameState } from './types'
import { createBoard, stampPiece, clearLines, getFullRowIndices } from './board'
import { isValidPosition } from './collision'
import { rotatePiece as _rotatePiece, rotatePieceCCW as _rotatePieceCCW, computeGhostY } from './rotation'
import { computeScore, levelFromLines } from './scoring'
import { createPiece, nextFromBag, resetBag } from './tetrominoes'

// ─── GameEngine ───────────────────────────────────────────────────────────────

/**
 * Pure stateful game engine — no React imports.
 * All mutating methods return a new immutable GameState snapshot.
 *
 * Line-clear animation uses a two-phase approach:
 *   Phase 1: `lockPiece` stamps the board, detects full rows, sets
 *            `status: 'clearing'` and `clearingRows: [...]`.
 *   Phase 2: `finalizeClear` actually clears the rows, updates score,
 *            and spawns the next piece. Called by useTetris after the
 *            flash animation timeout.
 */
export class GameEngine {
    private state: GameState

    constructor() {
        this.state = this.buildIdleState()
    }

    // ─── Private Helpers ───────────────────────────────────────────────────────

    private buildIdleState(): GameState {
        resetBag()
        const nextPiece = createPiece(nextFromBag())
        return {
            board: createBoard(),
            activePiece: null,
            nextPiece,
            ghostY: 0,
            score: 0,
            level: 1,
            lines: 0,
            status: 'idle',
            clearingRows: [],
        }
    }

    private spawnPiece(state: GameState): GameState {
        const activePiece = state.nextPiece
        const nextPiece = createPiece(nextFromBag())

        // Game over check — if the newly spawned piece immediately collides
        if (!isValidPosition(state.board, activePiece.matrix, activePiece.x, activePiece.y)) {
            return { ...state, activePiece: null, status: 'gameover', clearingRows: [] }
        }

        const ghostY = computeGhostY(state.board, activePiece.matrix, activePiece.x, activePiece.y)
        return { ...state, activePiece, nextPiece, ghostY, clearingRows: [] }
    }

    /**
     * Phase 1: stamp the piece onto the board, detect full rows.
     * If rows are complete → enter `'clearing'` status and expose `clearingRows`.
     * If no rows complete → immediately spawn the next piece.
     */
    private lockPiece(state: GameState): GameState {
        const { activePiece, board } = state
        if (!activePiece) return state

        const stamped = stampPiece(board, activePiece.matrix, activePiece.x, activePiece.y, activePiece.color)
        const fullRows = getFullRowIndices(stamped)

        if (fullRows.length > 0) {
            // Enter clearing phase — useTetris will call finalizeClear after animation
            return {
                ...state,
                board: stamped,
                activePiece: null,
                status: 'clearing',
                clearingRows: fullRows,
            }
        }

        // No lines to clear — go straight back to playing
        return this.spawnPiece({ ...state, board: stamped, activePiece: null, clearingRows: [] })
    }

    /**
     * Phase 2: called by useTetris after the flash animation completes.
     * Clears the full rows, updates score/level, spawns the next piece.
     */
    finalizeClear(): GameState {
        if (this.state.status !== 'clearing') return this.state

        const { newBoard, linesCleared } = clearLines(this.state.board)
        const newLines = this.state.lines + linesCleared
        const newLevel = levelFromLines(newLines)
        const newScore = this.state.score + computeScore(linesCleared, newLevel)

        this.state = this.spawnPiece({
            ...this.state,
            board: newBoard,
            score: newScore,
            level: newLevel,
            lines: newLines,
            status: 'playing',
            clearingRows: [],
        })
        return this.state
    }

    // ─── Public API ────────────────────────────────────────────────────────────

    getState(): GameState {
        return this.state
    }

    start(): GameState {
        this.state = this.buildIdleState()
        this.state = this.spawnPiece({ ...this.state, status: 'playing' })
        return this.state
    }

    pause(): GameState {
        if (this.state.status !== 'playing') return this.state
        this.state = { ...this.state, status: 'paused' }
        return this.state
    }

    resume(): GameState {
        if (this.state.status !== 'paused') return this.state
        this.state = { ...this.state, status: 'playing' }
        return this.state
    }

    /** Advance gravity by one row. Skipped automatically when status !== 'playing'. */
    tick(): GameState {
        if (this.state.status !== 'playing' || !this.state.activePiece) return this.state

        const { activePiece, board } = this.state
        const newY = activePiece.y + 1

        if (isValidPosition(board, activePiece.matrix, activePiece.x, newY)) {
            this.state = {
                ...this.state,
                activePiece: { ...activePiece, y: newY },
            }
        } else {
            this.state = this.lockPiece(this.state)
        }
        return this.state
    }

    moveLeft(): GameState {
        if (this.state.status !== 'playing' || !this.state.activePiece) return this.state
        const { activePiece, board } = this.state
        const newX = activePiece.x - 1
        if (isValidPosition(board, activePiece.matrix, newX, activePiece.y)) {
            const ghostY = computeGhostY(board, activePiece.matrix, newX, activePiece.y)
            this.state = { ...this.state, activePiece: { ...activePiece, x: newX }, ghostY }
        }
        return this.state
    }

    moveRight(): GameState {
        if (this.state.status !== 'playing' || !this.state.activePiece) return this.state
        const { activePiece, board } = this.state
        const newX = activePiece.x + 1
        if (isValidPosition(board, activePiece.matrix, newX, activePiece.y)) {
            const ghostY = computeGhostY(board, activePiece.matrix, newX, activePiece.y)
            this.state = { ...this.state, activePiece: { ...activePiece, x: newX }, ghostY }
        }
        return this.state
    }

    rotate(): GameState {
        if (this.state.status !== 'playing' || !this.state.activePiece) return this.state
        const rotated = _rotatePiece(this.state.activePiece, this.state.board)
        const ghostY = computeGhostY(this.state.board, rotated.matrix, rotated.x, rotated.y)
        this.state = { ...this.state, activePiece: rotated, ghostY }
        return this.state
    }

    rotateCCW(): GameState {
        if (this.state.status !== 'playing' || !this.state.activePiece) return this.state
        const rotated = _rotatePieceCCW(this.state.activePiece, this.state.board)
        const ghostY = computeGhostY(this.state.board, rotated.matrix, rotated.x, rotated.y)
        this.state = { ...this.state, activePiece: rotated, ghostY }
        return this.state
    }

    softDrop(): GameState {
        return this.tick()
    }

    hardDrop(): GameState {
        if (this.state.status !== 'playing' || !this.state.activePiece) return this.state
        const { activePiece, board } = this.state
        const landY = computeGhostY(board, activePiece.matrix, activePiece.x, activePiece.y)
        this.state = {
            ...this.state,
            activePiece: { ...activePiece, y: landY },
        }
        this.state = this.lockPiece(this.state)
        return this.state
    }

    /** Build a composite board: ghost footprint + active piece on top. */
    getVisualBoard(): BoardState {
        const { board, activePiece, ghostY } = this.state
        if (!activePiece) return board

        const ghostColor = activePiece.color + '44'
        let visual = stampPiece(board, activePiece.matrix, activePiece.x, ghostY, ghostColor)
        visual = stampPiece(visual, activePiece.matrix, activePiece.x, activePiece.y, activePiece.color)
        return visual
    }
}
