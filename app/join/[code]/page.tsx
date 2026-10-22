import { notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'

export const instant = false
import { getServiceSupabase } from '@/lib/supabase'
import { JoinPageClient } from './JoinPageClient'

async function getGameByCode(code: string) {
  const db = getServiceSupabase()
  const { data, error } = await db
    .from('games')
    .select(`
      *,
      organiser:players!games_created_by_fkey(id, name),
      players:game_players(
        id, player_id,
        player:players(id, name)
      )
    `)
    .eq('join_code', code)
    .single()

  if (error || !data) return null

  const playerCount = data.players?.length ?? 0
  return { ...data, player_count: playerCount, spots_left: data.max_players - playerCount }
}

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const game = await getGameByCode(code)
  if (!game) notFound()

  const session = await getSession()
  const currentPlayerId = session?.playerId ?? null
  const isJoined = currentPlayerId
    ? game.players.some((p: { player_id: string }) => p.player_id === currentPlayerId)
    : false

  return <JoinPageClient game={game} currentPlayerId={currentPlayerId} isJoined={isJoined} />
}
