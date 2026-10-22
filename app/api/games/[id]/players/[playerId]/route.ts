import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; playerId: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, playerId } = await params
  const db = getServiceSupabase()

  const { data: game } = await db.from('games').select('created_by').eq('id', id).single()
  if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  if (game.created_by !== session.playerId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (playerId === session.playerId) return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 })

  const { error } = await db
    .from('game_players')
    .delete()
    .eq('game_id', id)
    .eq('player_id', playerId)

  if (error) return NextResponse.json({ error: 'Failed to remove player' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
