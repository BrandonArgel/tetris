import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS class names safely.
 * - Uses `clsx` for conditional class logic
 * - Uses `twMerge` to resolve conflicting Tailwind utilities (e.g. `p-2 p-4` → `p-4`)
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
