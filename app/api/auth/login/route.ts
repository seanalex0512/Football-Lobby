import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getServiceSupabase } from '@/lib/supabase'
import { createSession, getSessionCookieOptions } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const { allowed, retryAfterMs } = checkRateLimit(`login:${ip}`)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    )
  }

  const { name, password } = await req.json()

  if (!name?.trim() || !password) {
    return NextResponse.json({ error: 'Name and password are required' }, { status: 400 })
  }

  const db = getServiceSupabase()

  const { data: player } = await db
    .from('players')
    .select('id, name, password_hash')
    .ilike('name', name.trim())
    .maybeSingle()

  if (!player) {
    return NextResponse.json({ error: 'Invalid name or password' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, player.password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid name or password' }, { status: 401 })
  }

  const token = await createSession({ playerId: player.id, playerName: player.name })
  const opts = getSessionCookieOptions()

  const res = NextResponse.json({ player: { id: player.id, name: player.name } })
  res.cookies.set(opts.name, token, opts)
  return res
}
