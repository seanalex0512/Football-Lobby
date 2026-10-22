import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { NewGameClient } from './NewGameClient'

export const instant = false

export default async function NewGamePage() {
  const session = await getSession()
  if (!session) redirect('/login')
  return <NewGameClient />
}
