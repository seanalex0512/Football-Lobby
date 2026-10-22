import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { EditGameClient } from './EditGameClient'

export const instant = false

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params
  return <EditGameClient id={id} />
}
