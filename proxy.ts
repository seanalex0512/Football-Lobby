import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'

const PUBLIC_PATHS = ['/login', '/join']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  if (isPublic) return NextResponse.next()

  // API routes handle auth themselves
  if (pathname.startsWith('/api/')) return NextResponse.next()

  const token = req.cookies.get('fl_session')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const session = await verifySession(token)
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
