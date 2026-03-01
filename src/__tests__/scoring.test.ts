import { describe, it, expect } from 'vitest'
import { computeScore, levelFromLines, dropInterval } from '../engine/scoring'

describe('computeScore', () => {
    it('returns 0 for 0 lines cleared', () => {
        expect(computeScore(0, 1)).toBe(0)
    })

    it('returns 100 × level for 1 line', () => {
        expect(computeScore(1, 1)).toBe(100)
        expect(computeScore(1, 3)).toBe(300)
    })

    it('returns 300 × level for 2 lines', () => {
        expect(computeScore(2, 1)).toBe(300)
        expect(computeScore(2, 5)).toBe(1500)
    })

    it('returns 500 × level for 3 lines', () => {
        expect(computeScore(3, 1)).toBe(500)
        expect(computeScore(3, 2)).toBe(1000)
    })

    it('returns 800 × level for 4 lines (Tetris!)', () => {
        expect(computeScore(4, 1)).toBe(800)
        expect(computeScore(4, 2)).toBe(1600)
        expect(computeScore(4, 10)).toBe(8000)
    })

    it('caps at 4-line score for more than 4 lines', () => {
        // Should not exceed the 4-line multiplier
        expect(computeScore(5, 1)).toBe(800)
    })
})

describe('levelFromLines', () => {
    it('starts at level 1 with 0 lines', () => {
        expect(levelFromLines(0)).toBe(1)
    })

    it('stays at level 1 up to 9 lines', () => {
        expect(levelFromLines(9)).toBe(1)
    })

    it('advances to level 2 at 10 lines', () => {
        expect(levelFromLines(10)).toBe(2)
    })

    it('advances to level 10 at 90 lines', () => {
        expect(levelFromLines(90)).toBe(10)
    })

    it('advances every 10 lines', () => {
        for (let i = 1; i <= 10; i++) {
            expect(levelFromLines(i * 10)).toBe(i + 1)
        }
    })
})

describe('dropInterval', () => {
    it('returns 800ms at level 1', () => {
        expect(dropInterval(1)).toBe(800)
    })

    it('decreases as level increases', () => {
        expect(dropInterval(2)).toBeLessThan(dropInterval(1))
        expect(dropInterval(5)).toBeLessThan(dropInterval(2))
    })

    it('never goes below 50ms', () => {
        expect(dropInterval(100)).toBe(50)
        expect(dropInterval(999)).toBe(50)
    })

    it('reaches minimum at roughly level 11', () => {
        // 800 - (10 * 75) = 50, so level 11 should be at minimum
        expect(dropInterval(11)).toBe(50)
    })
})
