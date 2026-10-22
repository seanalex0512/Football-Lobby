import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'
import { getGames } from '@/lib/games'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { upcoming, past } = await getGames(session.playerId)
  return NextResponse.json({ upcoming, past })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { date, time, venue_name, venue_address, total_cost, max_players } = body

  if (!date || !time || !venue_name) {
    return NextResponse.json({ error: 'Date, time, and venue name are required' }, { status: 400 })
  }

  const join_code = nanoid(8)
  const db = getServiceSupabase()

  const { data: game, error } = await db
    .from('games')
    .insert({
      date,
      time,
      venue_name,
      venue_address: venue_address || null,
      total_cost: total_cost ? Number(total_cost) : null,
      max_players: Number(max_players) || 10,
      status: 'active',
      join_code,
      created_by: session.playerId,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 })
  }

  // Auto-join the organiser
  await db.from('game_players').insert({
    game_id: game.id,
    player_id: session.playerId,
    payment_status: 'unpaid',
  })

  return NextResponse.json({ game }, { status: 201 })
}

function nanoid(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const maxValid = 248 // largest multiple of 62 <= 256, avoids modulo bias
  const result: string[] = []
  while (result.length < length) {
    const bytes = new Uint8Array(length * 2)
    crypto.getRandomValues(bytes)
    for (const b of bytes) {
      if (b < maxValid && result.length < length) {
        result.push(chars[b % chars.length])
      }
    }
  }
  return result.join('')
}
