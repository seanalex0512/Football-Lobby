import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const db = getServiceSupabase()

  const { data: result, error } = await db.rpc('join_game', {
    p_game_id: id,
    p_player_id: session.playerId,
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to join game' }, { status: 500 })
  }

  switch (result) {
    case 'ok':
      return NextResponse.json({ ok: true })
    case 'not_found':
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    case 'not_active':
      return NextResponse.json({ error: 'Game is not accepting players' }, { status: 400 })
    case 'full':
      return NextResponse.json({ error: 'Game is full' }, { status: 400 })
    case 'already_joined':
      return NextResponse.json({ error: 'Already joined' }, { status: 409 })
    default:
      return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
