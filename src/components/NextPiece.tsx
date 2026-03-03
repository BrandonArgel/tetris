import { memo } from 'react'
import type { Piece } from '../engine/types'
import { COLORS } from '../engine/tetrominoes'

interface NextPieceProps {
    piece: Piece
}

/** 4×4 mini preview grid showing the next tetromino. */
export const NextPiece = memo(function NextPiece({ piece }: NextPieceProps) {
    const color = COLORS[piece.type]
    // Render in a fixed 4×4 grid
    const grid: (string | null)[][] = Array.from({ length: 4 }, () => Array(4).fill(null))

    const matrix = piece.matrix
    const offsetRow = Math.floor((4 - matrix.length) / 2)
    const offsetCol = Math.floor((4 - matrix[0].length) / 2)

    for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
            if (matrix[r][c]) {
                grid[r + offsetRow][c + offsetCol] = color
            }
        }
    }

    return (
        <div className="grid grid-cols-4 gap-0.5 rounded-md bg-gray-950 p-2 w-20 md:w-24 mx-auto">
            {grid.flat().map((cell, i) => (
                <div
                    key={i}
                    className="w-full aspect-square rounded-sm"
                    style={
                        cell
                            ? {
                                backgroundColor: cell,
                                boxShadow: `0 0 6px ${cell}99`,
                            }
                            : { backgroundColor: 'rgb(3 7 18)' }
                    }
                />
            ))}
        </div>
    )
})

export function NextPieceContainer({ piece }: NextPieceProps) {
    return (
        <div className="flex w-full min-w-[72px] flex-col items-center gap-1 rounded-lg border border-cyan-500/50 bg-gray-950/80 px-2 py-2 backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.15)] shrink-0">
            <span className="text-[10px] font-mono tracking-[0.2em] text-cyan-400/80 uppercase">Next</span>
            <div className="flex items-center justify-center pt-1">
                <NextPiece piece={piece} />
            </div>
        </div>
    )
}
