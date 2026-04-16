import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeScore(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  return Math.max(0, Math.min(100, value))
}

export function scoreColor(score: number): string {
  score = safeScore(score)
  if (score >= 75) return 'text-emerald-400'
  if (score >= 50) return 'text-amber-400'
  return 'text-red-400'
}

export function scoreBarColor(score: number): string {
  score = safeScore(score)
  if (score >= 75) return 'bg-emerald-400'
  if (score >= 50) return 'bg-amber-400'
  return 'bg-red-400'
}

export function scoreLabel(score: number): string {
  score = safeScore(score)
  if (score >= 80) return 'Excellent'
  if (score >= 65) return 'Good'
  if (score >= 50) return 'Moderate'
  if (score >= 35) return 'Risky'
  return 'Critical'
}

export function riskLabel(score: number): string {
  if (score <= 25) return 'Low'
  if (score <= 50) return 'Medium'
  if (score <= 75) return 'High'
  return 'Critical'
}

export function riskColor(score: number): string {
  if (score <= 25) return 'text-emerald-400'
  if (score <= 50) return 'text-amber-400'
  if (score <= 75) return 'text-orange-400'
  return 'text-red-400'
}

// Safe for both client and server — no server-only APIs
export function priceLevelLabel(level: number | null): string {
  if (level === null) return 'Unknown'
  const labels = ['Free', 'Under $15', '$15–$30', '$30–$60', '$60+']
  return labels[level] ?? 'Unknown'
}
