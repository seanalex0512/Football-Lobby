import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { getGames } from '@/lib/games'

export const instant = false
import { TopBar } from '@/components/TopBar'
import { GameCard } from '@/components/GameCard'

export default async function HomePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const { upcoming, past } = await getGames(session.playerId)

  return (
    <>
      <TopBar playerName={session.playerName} />

      <div className="flex items-center justify-between mb-5">
        <h1 className="text-3xl font-bold">Games</h1>
        <Link
          href="/games/new"
          className="bg-green-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-green-700 transition-colors"
        >
          + New game
        </Link>
      </div>

      {/* Upcoming */}
      <section className="mb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-3">Upcoming · {upcoming.length}</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-gray-400">No upcoming games</p>
        ) : (
          upcoming.map((game) => (
            <GameCard key={game.id} game={game} currentPlayerId={session.playerId} />
          ))
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-gray-500 mb-3">Past · {past.length}</h2>
          <div className="border border-gray-200 rounded-xl px-4">
            {past.map((game) => (
              <GameCard key={game.id} game={game} currentPlayerId={session.playerId} isPast />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
