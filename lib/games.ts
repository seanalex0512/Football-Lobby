import { getServiceSupabase } from '@/lib/supabase'
import { Game } from '@/lib/types'

export async function getGames(playerId: string): Promise<{ upcoming: Game[]; past: Game[] }> {
  const db = getServiceSupabase()
  const today = new Date().toISOString().split('T')[0]

  const { data: games, error } = await db
    .from('games')
    .select(`
      *,
      organiser:players!games_created_by_fkey(id, name),
      game_players(player_id, payment_status, payment_amount)
    `)

  if (error || !games) return { upcoming: [], past: [] }

  const enriched: Game[] = games.map((g) => {
    const playerCount = g.game_players?.length ?? 0
    const spotsLeft = g.max_players - playerCount
    const isJoined = g.game_players?.some((gp: { player_id: string }) => gp.player_id === playerId)
    const myEntry = g.game_players?.find((gp: { player_id: string }) => gp.player_id === playerId)
    const perPlayerCost =
      g.status === 'finalized' && g.total_cost != null && playerCount > 0
        ? Number(g.total_cost) / playerCount
        : null

    return {
      ...g,
      game_players: undefined,
      player_count: playerCount,
      spots_left: spotsLeft,
      is_joined: isJoined,
      per_player_cost: perPlayerCost,
      current_player_entry: myEntry ?? null,
    }
  })

  const upcoming = enriched
    .filter((g) => g.date >= today)
    .sort((a, b) => {
      if (a.status === 'cancelled' && b.status !== 'cancelled') return 1
      if (a.status !== 'cancelled' && b.status === 'cancelled') return -1
      if (a.date !== b.date) return a.date < b.date ? -1 : 1
      return a.time < b.time ? -1 : 1
    })

  const past = enriched
    .filter((g) => g.date < today)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date > b.date ? -1 : 1
      return a.time > b.time ? -1 : 1
    })

  return { upcoming, past }
}
