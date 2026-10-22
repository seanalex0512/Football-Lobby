import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const db = getServiceSupabase()

  const { error } = await db
    .from('game_players')
    .delete()
    .eq('game_id', id)
    .eq('player_id', session.playerId)

  if (error) return NextResponse.json({ error: 'Failed to leave game' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
