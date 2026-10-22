'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProgressBar } from '@/components/ProgressBar'
import { getShortName } from '@/lib/utils'

interface JoinGame {
  id: string
  date: string
  time: string
  venue_name: string
  venue_address: string | null
  max_players: number
  status: string
  join_code: string
  player_count: number
  spots_left: number
  organiser: { id: string; name: string }
  players: Array<{ player_id: string; player: { id: string; name: string } }>
}

interface Props {
  game: JoinGame
  currentPlayerId: string | null
  isJoined: boolean
}

export function JoinPageClient({ game, currentPlayerId, isJoined: initialIsJoined }: Props) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(initialIsJoined)

  const organiserShort = getShortName(game.organiser.name)

  const playerNames = game.players.slice(0, 6).map((p) => getShortName(p.player.name))
  const remaining = game.player_count - 6
  const playerLabel =
    playerNames.length > 0
      ? remaining > 0
        ? `${playerNames.join(', ')} and ${remaining} more are playing`
        : `${playerNames.join(', ')} are playing`
      : 'No players yet'

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!currentPlayerId) {
      // Try signup first; if name exists, fall back to login
      let authRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      })

      if (!authRes.ok) {
        // If signup failed (name taken), try login instead
        authRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, password }),
        })
      }

      if (!authRes.ok) {
        const data = await authRes.json()
        setError(data.error ?? 'Authentication failed')
        setLoading(false)
        return
      }
    }

    // Join the game
    const joinRes = await fetch(`/api/games/${game.id}/join`, { method: 'POST' })
    setLoading(false)

    if (!joinRes.ok && joinRes.status !== 409) {
      const data = await joinRes.json()
      setError(data.error ?? 'Failed to join game')
      return
    }

    setJoined(true)
    setTimeout(() => router.push(`/games/${game.id}`), 800)
  }

  async function handleJoinLoggedIn() {
    setLoading(true)
    const joinRes = await fetch(`/api/games/${game.id}/join`, { method: 'POST' })
    setLoading(false)
    if (joinRes.ok || joinRes.status === 409) {
      setJoined(true)
      setTimeout(() => router.push(`/games/${game.id}`), 500)
    }
  }

  const gameDate = new Date(game.date + 'T00:00:00')
  const dateLabel = gameDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  const weekday = gameDate.toLocaleDateString('en-GB', { weekday: 'long' })

  return (
    <div className="min-h-screen flex flex-col justify-start pt-6">
      {/* Brand */}
      <div className="flex items-center gap-2 mb-8">
        <span className="w-2 h-2 rounded-full bg-green-600" />
        <span className="font-semibold text-sm">Football Lobby</span>
      </div>

      {/* Invite header */}
      <p className="text-sm text-gray-600 mb-1">
        <span className="font-semibold text-gray-900">{organiserShort}</span> invited you to play
      </p>

      {/* Date/time */}
      <p className="text-sm text-gray-500 mb-0.5">{weekday}</p>
      <div className="flex items-baseline gap-3 mb-3">
        <h1 className="text-3xl font-bold">{dateLabel}</h1>
        <span className="text-xl font-semibold text-gray-500">{game.time.slice(0, 5)}</span>
      </div>

      {/* Venue */}
      <p className="font-semibold mb-0.5">{game.venue_name}</p>
      {game.venue_address && (
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(game.venue_address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-500 hover:underline mb-4 block"
        >
          {game.venue_address} ↗
        </a>
      )}

      {/* Stats card */}
      <div className="border border-gray-200 rounded-xl p-4 mb-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Spots left</p>
            <p className="text-3xl font-bold text-gray-900">
              {game.spots_left}
              <span className="text-base font-normal text-gray-500"> of {game.max_players}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-0.5">Price</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">Split after the game</p>
          </div>
        </div>
        <ProgressBar filled={game.player_count} total={game.max_players} />

        <p className="text-sm text-gray-600 mt-3">{playerLabel}</p>
      </div>

      {/* Join action */}
      {joined ? (
        <div className="text-center py-4">
          <p className="text-green-600 font-semibold">You&apos;re in! Redirecting…</p>
        </div>
      ) : currentPlayerId ? (
        <button
          onClick={handleJoinLoggedIn}
          disabled={loading || game.spots_left === 0}
          className="w-full bg-green-600 text-white font-semibold py-3.5 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60"
        >
          {loading ? 'Joining…' : 'Join game'}
        </button>
      ) : (
        <form onSubmit={handleJoin} className="flex flex-col gap-3">
          <div className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white font-semibold py-3.5 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'Joining…' : 'Join game'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            New here? This creates your account. Returning? Use your existing name and password.
          </p>
        </form>
      )}
    </div>
  )
}
