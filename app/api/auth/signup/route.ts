import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getServiceSupabase } from '@/lib/supabase'
import { createSession, getSessionCookieOptions } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const { allowed, retryAfterMs } = checkRateLimit(`signup:${ip}`)
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
  if (password.length < 4) {
    return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 })
  }

  const db = getServiceSupabase()

  const { data: existing } = await db
    .from('players')
    .select('id')
    .ilike('name', name.trim())
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'That name is already taken' }, { status: 409 })
  }

  const password_hash = await bcrypt.hash(password, 10)

  const { data: player, error } = await db
    .from('players')
    .insert({ name: name.trim(), password_hash })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }

  const token = await createSession({ playerId: player.id, playerName: player.name })
  const opts = getSessionCookieOptions()

  const res = NextResponse.json({ player: { id: player.id, name: player.name } })
  res.cookies.set(opts.name, token, opts)
  return res
}
