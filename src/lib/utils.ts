import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNGN(amount: number, compact: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'NGN 0'
  }

  if (compact) {
    if (amount >= 1_000_000_000) {
      return `NGN ${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`
    }
    if (amount >= 1_000_000) {
      return `NGN ${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
    }
    if (amount >= 1_000) {
      return `NGN ${(amount / 1_000).toFixed(0)}k`
    }
  }

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('NGN', 'NGN ')
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHour < 24) return `${diffHour}h ago`
    if (diffDay === 1) return 'Yesterday'
    if (diffDay < 7) return `${diffDay}d ago`
    if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

export function formatFullDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function getTimeGreeting(name: string = 'User'): string {
  const hour = new Date().getHours()
  let greeting = 'Good morning'
  if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon'
  } else if (hour >= 17) {
    greeting = 'Good evening'
  }
  return `${greeting}, ${name}`
}
