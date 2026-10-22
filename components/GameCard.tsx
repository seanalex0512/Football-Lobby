'use client'

import Link from 'next/link'
import { Game } from '@/lib/types'
import { formatDate, formatTime, getShortName } from '@/lib/utils'
import { ProgressBar } from './ProgressBar'

interface GameCardProps {
  game: Game
  currentPlayerId: string
  isPast?: boolean
}

export function GameCard({ game, currentPlayerId, isPast = false }: GameCardProps) {
  const { day, weekday, month } = formatDate(game.date)
  const time = formatTime(game.time)
  const isOrganiser = game.created_by === currentPlayerId
  const isFull = game.spots_left === 0
  const isCancelled = game.status === 'cancelled'
  const playerCount = game.player_count ?? 0
  const organiserName = game.organiser ? getShortName(game.organiser.name) : ''

  if (isPast) {
    return (
      <Link href={`/games/${game.id}`} className="block">
        <div className="flex items-center justify-between py-3 px-0 border-b border-gray-100 last:border-0">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 w-10 flex-shrink-0">{day} {month}</span>
            <div>
              <p className="text-sm font-medium text-gray-900 truncate max-w-[160px]">{game.venue_name}</p>
              <p className="text-xs text-gray-500">{playerCount} played</p>
            </div>
          </div>
          <div className="flex-shrink-0">
            {game.status === 'finalized' && game.per_player_cost != null ? (
              game.current_player_entry ? (
                <span className="text-xs bg-green-700 text-white rounded-full px-2.5 py-1 font-medium whitespace-nowrap">
                  You owe RM {game.per_player_cost.toFixed(2)}
                </span>
              ) : null
            ) : isOrganiser ? (
              <Link
                href={`/games/${game.id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs border border-red-600 text-red-600 rounded-full px-2.5 py-1 font-medium whitespace-nowrap hover:bg-red-50 transition-colors"
              >
                Confirm price
              </Link>
            ) : null}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/games/${game.id}`} className="block">
      <div className={`border border-gray-200 rounded-xl p-4 mb-2.5 ${isCancelled ? 'opacity-50' : ''}`}>
        <div className="flex gap-3">
          {/* Date block */}
          <div className="flex flex-col items-center justify-start w-10 flex-shrink-0 pt-0.5">
            <span className="text-xs text-gray-500 uppercase leading-none">{weekday}</span>
            <span className="text-2xl font-bold text-gray-900 leading-tight">{day}</span>
            <span className="text-xs text-gray-500 leading-none">{month}</span>
          </div>

          {/* Middle content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm">{time}</span>
              {game.is_joined && !isCancelled && (
                <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">
                  You&apos;re in
                </span>
              )}
              {isOrganiser && !isCancelled && (
                <span className="text-xs bg-gray-900 text-white font-medium px-2 py-0.5 rounded-full">
                  Organiser
                </span>
              )}
              {isCancelled && (
                <span className="text-xs bg-red-100 text-red-600 font-medium px-2 py-0.5 rounded-full">
                  Cancelled
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 truncate">{game.venue_name}</p>
            <p className="text-xs text-gray-500">
              {playerCount} of {game.max_players} playing · {organiserName}
            </p>
          </div>

          {/* Right: spots */}
          <div className="flex flex-col items-end justify-start flex-shrink-0 pt-0.5">
            {isCancelled ? (
              <div className="text-right">
                <span className="text-gray-400 text-sm font-medium">—</span>
                <br />
                <span className="text-xs text-gray-400">Off</span>
              </div>
            ) : isFull ? (
              <div className="text-right">
                <span className="text-sm font-bold text-gray-900">Full</span>
                <br />
                <span className="text-xs text-gray-700 font-bold">{playerCount}/{game.max_players}</span>
              </div>
            ) : (
              <div className="text-right">
                <span className="text-2xl font-bold text-green-600">{game.spots_left}</span>
                <br />
                <span className="text-xs text-gray-500">spots left</span>
              </div>
            )}
          </div>
        </div>

        {!isCancelled && (
          <ProgressBar filled={playerCount} total={game.max_players} />
        )}
      </div>
    </Link>
  )
}
