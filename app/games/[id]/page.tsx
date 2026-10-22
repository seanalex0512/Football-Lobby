import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'

export const instant = false
import { getServiceSupabase } from '@/lib/supabase'
import { GameDetailClient } from './GameDetailClient'

async function getGame(id: string) {
  const db = getServiceSupabase()
  const { data, error } = await db
    .from('games')
    .select(`
      *,
      organiser:players!games_created_by_fkey(id, name),
      players:game_players(
        id, game_id, player_id, payment_status, payment_amount, payment_date, joined_at,
        player:players(id, name)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params
  const game = await getGame(id)
  if (!game) notFound()

  return <GameDetailClient game={game} currentPlayerId={session.playerId} />
}
