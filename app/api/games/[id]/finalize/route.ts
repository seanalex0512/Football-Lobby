import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const db = getServiceSupabase()

  const { data: game } = await db.from('games').select('created_by').eq('id', id).single()
  if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  if (game.created_by !== session.playerId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { total_cost } = await req.json()
  if (total_cost == null || isNaN(Number(total_cost))) {
    return NextResponse.json({ error: 'total_cost is required' }, { status: 400 })
  }

  const { data: updated, error } = await db
    .from('games')
    .update({ status: 'finalized', total_cost: Number(total_cost), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to finalize game' }, { status: 500 })
  return NextResponse.json({ game: updated })
}
