export function formatDate(dateStr: string): { day: number; weekday: string; month: string } {
  const date = new Date(dateStr + 'T00:00:00')
  return {
    day: date.getDate(),
    weekday: date.toLocaleDateString('en-GB', { weekday: 'short' }),
    month: date.toLocaleDateString('en-GB', { month: 'short' }),
  }
}

export function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function formatWeekday(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-GB', { weekday: 'long' })
}

export function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5)
}

const AVATAR_COLORS = [
  '#16a34a', '#2563eb', '#7c3aed', '#db2777', '#ea580c',
  '#0891b2', '#65a30d', '#dc2626', '#9333ea', '#0d9488',
]

export function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function getShortName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[parts.length - 1][0]}.`
  }
  return name
}
