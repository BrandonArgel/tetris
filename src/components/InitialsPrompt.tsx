import { useRef, useEffect, useState, useCallback, memo } from 'react'
import { Trophy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

// ─── Types ────────────────────────────────────────────────────────────────────

interface InitialsPromptProps {
    score: number
    level: number
    lines: number
    isOpen: boolean
    onSubmit: (name: string) => void
}

// ─── InitialsPrompt ───────────────────────────────────────────────────────────

/**
 * High-score name entry shown when a player achieves a new Top-10 score.
 * Accepts a full name/nickname (up to 15 characters).
 * Rendered as a fixed-overlay modal for guaranteed perfect centering.
 */
export const InitialsPrompt = memo(function InitialsPrompt({
    score,
    level,
    lines,
    isOpen,
    onSubmit,
}: InitialsPromptProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [value, setValue] = useState('')

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setValue('')
            requestAnimationFrame(() => inputRef.current?.focus())
        }
    }, [isOpen])

    // Block Escape to force name entry (prevent accidental dismissal)
    useEffect(() => {
        if (!isOpen) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') e.stopPropagation()
        }
        window.addEventListener('keydown', handler, { capture: true })
        return () => window.removeEventListener('keydown', handler, { capture: true })
    }, [isOpen])

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow letters, digits, spaces, hyphens, underscores
        const cleaned = e.target.value.replace(/[^a-zA-Z0-9 _-]/g, '').slice(0, 15)
        setValue(cleaned)
    }, [])

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault()
            const trimmed = value.trim()
            if (trimmed.length === 0) return
            onSubmit(trimmed)
        },
        [value, onSubmit],
    )

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div
                className={cn(
                    'w-[min(380px,90vw)] rounded-2xl border border-yellow-400/25',
                    'bg-gray-950 p-0 text-white',
                    'shadow-[0_0_60px_rgba(240,200,0,0.14)]',
                )}
            >
                <div className="flex flex-col items-center gap-5 px-8 py-8">
                    {/* Icon + heading */}
                    <div className="flex items-center gap-2">
                        <Trophy size={22} className="text-yellow-400" />
                        <h2 className="text-lg font-black tracking-[0.2em] text-yellow-300 uppercase">
                            New High Score!
                        </h2>
                    </div>

                    {/* Stats recap */}
                    <div className="flex w-full justify-around rounded-xl border border-white/10 bg-white/5 py-3 text-center">
                        <div>
                            <p className="text-[10px] tracking-widest text-gray-500 uppercase">Score</p>
                            <p className="font-mono text-lg font-bold text-cyan-400">
                                {score.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] tracking-widest text-gray-500 uppercase">Level</p>
                            <p className="font-mono text-lg font-bold text-purple-400">{level}</p>
                        </div>
                        <div>
                            <p className="text-[10px] tracking-widest text-gray-500 uppercase">Lines</p>
                            <p className="font-mono text-lg font-bold text-green-400">{lines}</p>
                        </div>
                    </div>

                    {/* Name form */}
                    <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-4">
                        <p className="text-xs tracking-widest text-gray-400 uppercase">
                            Enter your name
                        </p>

                        <input
                            ref={inputRef}
                            type="text"
                            value={value}
                            onChange={handleChange}
                            maxLength={15}
                            autoComplete="off"
                            spellCheck={false}
                            placeholder="Your name"
                            className={cn(
                                'w-full rounded-xl border border-yellow-400/30 bg-white/5',
                                'text-center font-mono text-xl font-bold tracking-wide',
                                'text-yellow-300 placeholder-gray-600',
                                'px-4 py-3 uppercase outline-none',
                                'focus:border-yellow-400/60 focus:shadow-[0_0_20px_rgba(240,200,0,0.18)]',
                                'transition-shadow duration-150',
                            )}
                        />

                        <Button
                            id="submit-initials-btn"
                            type="submit"
                            variant="primary"
                            size="lg"
                            disabled={value.trim().length === 0}
                            className="w-full tracking-[0.2em] uppercase"
                        >
                            Save Score
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
})
