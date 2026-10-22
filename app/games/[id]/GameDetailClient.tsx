'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GameDetail } from '@/lib/types'
import { Avatar } from '@/components/Avatar'
import { getShortName } from '@/lib/utils'

interface Props {
  game: GameDetail
  currentPlayerId: string
}

export function GameDetailClient({ game: initialGame, currentPlayerId }: Props) {
  const router = useRouter()
  const [game, setGame] = useState(initialGame)
  const [loading, setLoading] = useState(false)
  const [finalizeMode, setFinalizeMode] = useState(false)
  const [totalCost, setTotalCost] = useState('')
  const [copyLabel, setCopyLabel] = useState('Copy invite link')

  const isOrganiser = game.created_by === currentPlayerId
  const myEntry = game.players.find((p) => p.player_id === currentPlayerId)
  const isJoined = !!myEntry
  const playerCount = game.players.length
  const spotsLeft = game.max_players - playerCount
  const perPlayerCost =
    game.status === 'finalized' && game.total_cost != null && playerCount > 0
      ? Number(game.total_cost) / playerCount
      : null

  async function refresh() {
    const res = await fetch(`/api/games/${game.id}`)
    if (res.ok) {
      const data = await res.json()
      setGame(data)
    }
  }

  async function handleJoin() {
    setLoading(true)
    await fetch(`/api/games/${game.id}/join`, { method: 'POST' })
    await refresh()
    setLoading(false)
  }

  async function handleLeave() {
    setLoading(true)
    await fetch(`/api/games/${game.id}/leave`, { method: 'DELETE' })
    await refresh()
    setLoading(false)
  }

  async function handleCancel() {
    if (!confirm('Cancel this game?')) return
    setLoading(true)
    await fetch(`/api/games/${game.id}`, { method: 'DELETE' })
    router.push('/')
    router.refresh()
  }

  async function handleRemovePlayer(playerId: string) {
    setLoading(true)
    await fetch(`/api/games/${game.id}/players/${playerId}`, { method: 'DELETE' })
    await refresh()
    setLoading(false)
  }

  async function handleFinalize() {
    if (!totalCost || isNaN(Number(totalCost))) return
    setLoading(true)
    await fetch(`/api/games/${game.id}/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ total_cost: Number(totalCost) }),
    })
    await refresh()
    setFinalizeMode(false)
    setLoading(false)
  }

  async function handleTogglePayment(playerId: string, currentStatus: string) {
    const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid'
    setLoading(true)
    await fetch(`/api/games/${game.id}/players/${playerId}/payment`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_status: newStatus }),
    })
    await refresh()
    setLoading(false)
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/join/${game.join_code}`
    navigator.clipboard.writeText(url).then(() => {
      setCopyLabel('Copied!')
      setTimeout(() => setCopyLabel('Copy invite link'), 2000)
    })
  }

  const priceLabel =
    game.status === 'finalized' && perPlayerCost != null
      ? `RM ${perPlayerCost.toFixed(2)} each`
      : 'After game'

  return (
    <>
      {/* Nav bar */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => router.push('/')}
          className="text-sm text-gray-600 flex items-center gap-1"
        >
          ← Games
        </button>
        <button
          onClick={handleCopyLink}
          className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors"
        >
          {copyLabel}
        </button>
      </div>

      {/* Header */}
      <div className="mb-5">
        <p className="text-sm text-gray-500 mb-1">
          {game.organiser
            ? isOrganiser
              ? `${new Date(game.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long' })} · Organised by you`
              : `${new Date(game.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long' })} · Organised by ${game.organiser.name}`
            : ''}
        </p>
        <div className="flex items-baseline gap-3 mb-1">
          <h1 className="text-4xl font-bold">
            {new Date(game.date + 'T00:00:00').toLocaleDateString('en-GB', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })}
          </h1>
          <span className="text-2xl font-semibold text-gray-500">{game.time.slice(0, 5)}</span>
        </div>
        <p className="font-semibold text-gray-900">{game.venue_name}</p>
        {game.venue_address && (
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(game.venue_address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 underline-offset-2 hover:underline"
          >
            {game.venue_address} ↗
          </a>
        )}
      </div>

      {/* Stats row */}
      <div className="flex mb-5 border border-gray-200 rounded-xl py-4 px-4">
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-0.5">Spots left</p>
          <p className="text-3xl font-bold text-gray-900">{spotsLeft}</p>
        </div>
        <div className="flex-1 border-l border-gray-100 pl-4">
          <p className="text-xs text-gray-500 mb-0.5">Players</p>
          <p className="text-3xl font-bold text-gray-900">
            <span>{playerCount}</span>
            <span className="text-gray-400 text-xl"> / {game.max_players}</span>
          </p>
        </div>
        <div className="flex-1 border-l border-gray-100 pl-4">
          <p className="text-xs text-gray-500 mb-0.5">Price</p>
          <p className="text-base font-semibold text-gray-900 mt-1.5">{priceLabel}</p>
        </div>
      </div>

      {/* Admin actions */}
      {isOrganiser && game.status === 'active' && (
        <div className="flex gap-3 mb-5">
          <button
            onClick={() => router.push(`/games/${game.id}/edit`)}
            className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Edit game
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 border border-red-300 text-red-600 text-sm font-medium py-2.5 rounded-xl hover:bg-red-50 transition-colors"
          >
            Cancel game
          </button>
        </div>
      )}

      {/* Finalize section for past games */}
      {isOrganiser && game.status === 'active' && new Date(game.date) < new Date() && (
        <div className="mb-5">
          {!finalizeMode ? (
            <button
              onClick={() => setFinalizeMode(true)}
              className="w-full border border-green-600 text-green-600 text-sm font-medium py-2.5 rounded-xl hover:bg-green-50 transition-colors"
            >
              Confirm price
            </button>
          ) : (
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-sm font-medium mb-3">Enter total pitch cost</p>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">RM</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={totalCost}
                    onChange={(e) => setTotalCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-gray-400"
                  />
                </div>
                <button
                  onClick={handleFinalize}
                  disabled={loading}
                  className="bg-green-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-green-700 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setFinalizeMode(false)}
                  className="border border-gray-200 text-gray-600 text-sm px-3 py-2.5 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
              {playerCount > 0 && totalCost && !isNaN(Number(totalCost)) && (
                <p className="text-xs text-gray-500 mt-2">
                  = RM {(Number(totalCost) / playerCount).toFixed(2)} per player
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Players list */}
      <div className="mb-5">
        <p className="text-sm font-medium text-gray-500 mb-3">Players</p>
        <div className="flex flex-col gap-1">
          {game.players.map((entry) => {
            const isMe = entry.player_id === currentPlayerId
            const isGameOrganiser = entry.player_id === game.created_by
            const shortName = getShortName(entry.player.name)

            return (
              <div key={entry.id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                <Avatar name={entry.player.name} size="sm" />
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium">{shortName}</span>
                  {isMe && (
                    <span className="text-xs text-gray-400">You</span>
                  )}
                  {isGameOrganiser && (
                    <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded-full">Organiser</span>
                  )}
                </div>

                {/* Payment status for finalized games */}
                {game.status === 'finalized' && isOrganiser && (
                  <button
                    onClick={() => handleTogglePayment(entry.player_id, entry.payment_status)}
                    className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                      entry.payment_status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {entry.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                  </button>
                )}

                {/* Remove button for organiser on active games */}
                {isOrganiser && !isMe && game.status === 'active' && (
                  <button
                    onClick={() => handleRemovePlayer(entry.player_id)}
                    disabled={loading}
                    className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors text-sm"
                  >
                    ×
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom action */}
      <div className="mt-4">
        {game.status === 'cancelled' ? (
          <div className="w-full bg-gray-100 text-gray-500 text-sm font-medium py-3.5 rounded-xl text-center">
            This game was cancelled
          </div>
        ) : isOrganiser ? (
          <div className="w-full bg-gray-100 text-gray-700 text-sm font-medium py-3.5 rounded-xl text-center">
            You&apos;re organising
          </div>
        ) : isJoined ? (
          <div className="flex gap-3">
            <div className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-3.5 rounded-xl text-center">
              You&apos;re playing
            </div>
            {game.status === 'active' && (
              <button
                onClick={handleLeave}
                disabled={loading}
                className="border border-red-300 text-red-600 text-sm font-medium px-5 py-3.5 rounded-xl hover:bg-red-50 transition-colors"
              >
                Leave
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={handleJoin}
            disabled={loading || spotsLeft === 0 || game.status !== 'active'}
            className="w-full bg-green-600 text-white font-semibold py-3.5 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60"
          >
            {spotsLeft === 0 ? 'Game is full' : 'Join'}
          </button>
        )}
      </div>
    </>
  )
}
