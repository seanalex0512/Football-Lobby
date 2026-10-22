import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const db = getServiceSupabase()

  const { data: game, error } = await db
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

  if (error || !game) return NextResponse.json({ error: 'Game not found' }, { status: 404 })

  const playerCount = game.players?.length ?? 0
  const spotsLeft = game.max_players - playerCount
  const perPlayerCost =
    game.status === 'finalized' && game.total_cost != null && playerCount > 0
      ? Number(game.total_cost) / playerCount
      : null

  return NextResponse.json({
    ...game,
    player_count: playerCount,
    spots_left: spotsLeft,
    per_player_cost: perPlayerCost,
  })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const db = getServiceSupabase()

  const { data: game } = await db.from('games').select('created_by').eq('id', id).single()
  if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  if (game.created_by !== session.playerId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { date, time, venue_name, venue_address, max_players } = body

  const { data: updated, error } = await db
    .from('games')
    .update({ date, time, venue_name, venue_address: venue_address || null, max_players: Number(max_players), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to update game' }, { status: 500 })
  return NextResponse.json({ game: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const db = getServiceSupabase()

  const { data: game } = await db.from('games').select('created_by').eq('id', id).single()
  if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  if (game.created_by !== session.playerId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await db
    .from('games')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Failed to cancel game' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
