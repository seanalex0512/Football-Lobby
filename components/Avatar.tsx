'use client'

import { getAvatarColor, getInitials } from '@/lib/utils'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md'
}

export function Avatar({ name, size = 'md' }: AvatarProps) {
  const color = getAvatarColor(name)
  const initials = getInitials(name)
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm'

  return (
    <span
      className={`${sizeClass} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </span>
  )
}
