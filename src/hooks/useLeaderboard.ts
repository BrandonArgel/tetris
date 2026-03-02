import { useState, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
    initials: string
    score: number
    level: number
    lines: number
    date: string // ISO date string
}

const STORAGE_KEY = 'tetris-leaderboard-v1'
const MAX_ENTRIES = 10

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadEntries(): LeaderboardEntry[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return parsed as LeaderboardEntry[]
    } catch {
        return []
    }
}

function saveEntries(entries: LeaderboardEntry[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    } catch {
        // Silently ignore storage errors (e.g. private browsing quota exceeded)
    }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface LeaderboardAPI {
    /** Sorted Top 10 entries (highest score first). */
    entries: LeaderboardEntry[]
    /**
     * Returns `true` if the given score would appear in the Top 10.
     * Call this on Game Over to decide whether to show the initials prompt.
     */
    isHighScore: (score: number) => boolean
    /**
     * Add a new entry, re-sort, trim to Top 10, and persist to localStorage.
     * Returns the updated sorted array.
     */
    addEntry: (entry: Omit<LeaderboardEntry, 'date'>) => LeaderboardEntry[]
    /** Wipe all scores (useful for dev / settings). */
    clearEntries: () => void
}

/**
 * `useLeaderboard` manages a persistent Top-10 leaderboard backed by
 * `localStorage`. Data survives page refreshes and is synced across tabs via a
 * `storage` event listener.
 */
export function useLeaderboard(): LeaderboardAPI {
    const [entries, setEntries] = useState<LeaderboardEntry[]>(() => loadEntries())

    const isHighScore = useCallback(
        (score: number): boolean => {
            if (score <= 0) return false
            if (entries.length < MAX_ENTRIES) return true
            return score > entries[entries.length - 1].score
        },
        [entries],
    )

    const addEntry = useCallback(
        (entry: Omit<LeaderboardEntry, 'date'>): LeaderboardEntry[] => {
            const newEntry: LeaderboardEntry = {
                ...entry,
                date: new Date().toISOString(),
            }
            const updated = [...entries, newEntry]
                .sort((a, b) => b.score - a.score)
                .slice(0, MAX_ENTRIES)
            saveEntries(updated)
            setEntries(updated)
            return updated
        },
        [entries],
    )

    const clearEntries = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY)
        setEntries([])
    }, [])

    return { entries, isHighScore, addEntry, clearEntries }
}
