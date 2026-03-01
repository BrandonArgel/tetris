import { memo } from 'react'
import { Cell } from './Cell'

interface BoardRowProps {
    row: string[]
    isClearing?: boolean
}

/**
 * A single row of 10 cells.
 *
 * IMPORTANT: Must render as a React Fragment (not a real DOM element) so that
 * the child Cells become direct children of the parent CSS Grid container.
 * Using a <div class="contents"> was unreliable and caused pieces to appear to
 * fall horizontally — the 20 row-divs were being treated as 20 block grid items
 * filling left-to-right instead of dissolving into the grid.
 *
 * Flash animation is applied to each Cell individually since they are the actual
 * grid items.
 */
export const BoardRow = memo(function BoardRow({ row, isClearing = false }: BoardRowProps) {
    return (
        <>
            {row.map((color, col) => (
                <Cell key={col} color={color} isClearing={isClearing} />
            ))}
        </>
    )
})
