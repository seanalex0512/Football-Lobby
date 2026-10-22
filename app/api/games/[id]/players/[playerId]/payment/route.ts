import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; playerId: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, playerId } = await params
  const db = getServiceSupabase()

  const { data: game } = await db.from('games').select('created_by, total_cost').eq('id', id).single()
  if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  if (game.created_by !== session.playerId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { payment_status } = await req.json()

  const update: Record<string, unknown> = { payment_status }
  if (payment_status === 'paid') {
    update.payment_date = new Date().toISOString()
    // payment_amount is set when we know per-player cost
    if (game.total_cost != null) {
      const { count } = await db
        .from('game_players')
        .select('id', { count: 'exact', head: true })
        .eq('game_id', id)
      update.payment_amount = count ? Number(game.total_cost) / count : null
    }
  } else {
    update.payment_date = null
    update.payment_amount = null
  }

  const { data, error } = await db
    .from('game_players')
    .update(update)
    .eq('game_id', id)
    .eq('player_id', playerId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  return NextResponse.json({ entry: data })
}
