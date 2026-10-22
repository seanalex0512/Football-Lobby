import { NextResponse } from 'next/server'
import { getSessionCookieOptions } from '@/lib/auth'

export async function POST() {
  const opts = getSessionCookieOptions()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(opts.name, '', { ...opts, maxAge: 0 })
  return res
}
