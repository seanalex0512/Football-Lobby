'use client'

import { useRouter } from 'next/navigation'
import { Avatar } from './Avatar'

interface TopBarProps {
  playerName: string
}

export function TopBar({ playerName }: TopBarProps) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0" />
        <span className="font-semibold text-sm">Football Lobby</span>
      </div>
      <div className="flex items-center gap-2">
        <Avatar name={playerName} size="sm" />
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-1 hover:bg-gray-50 transition-colors"
        >
          Log out
        </button>
      </div>
    </div>
  )
}
