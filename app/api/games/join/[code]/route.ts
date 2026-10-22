import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const db = getServiceSupabase()

  const { data: game, error } = await db
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

  if (error || !game) return NextResponse.json({ error: 'Game not found' }, { status: 404 })

  const playerCount = game.players?.length ?? 0
  const spotsLeft = game.max_players - playerCount

  return NextResponse.json({ ...game, player_count: playerCount, spots_left: spotsLeft })
}
