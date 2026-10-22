'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { VenuePicker } from '@/components/VenuePicker'
import { DateTimePicker } from '@/components/DateTimePicker'
import { Venue, VENUES } from '@/lib/venues'

interface Props {
  id: string
}

export function EditGameClient({ id }: Props) {
  const router = useRouter()
  const [venue, setVenue] = useState<Venue | null>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [maxPlayers, setMaxPlayers] = useState('10')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/games/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setDate(data.date ?? '')
        setTime(data.time?.slice(0, 5) ?? '')
        setMaxPlayers(String(data.max_players ?? 10))
        const matched = VENUES.find((v) => v.name === data.venue_name)
        if (matched) {
          setVenue(matched)
        } else if (data.venue_name) {
          setVenue({ id: 'custom', name: data.venue_name, address: data.venue_address ?? '', area: 'Custom', hours: '', type: 'futsal' })
        }
        setFetching(false)
      })
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!venue) { setError('Please select a venue'); return }
    if (!date) { setError('Please pick a date'); return }
    if (!time) { setError('Please pick a kick-off time'); return }

    setLoading(true)
    const res = await fetch(`/api/games/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        time,
        venue_name: venue.name,
        venue_address: venue.address || null,
        max_players: Number(maxPlayers),
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? 'Failed to update game'); return }
    router.push(`/games/${id}`)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('Cancel this game? This cannot be undone.')) return
    setLoading(true)
    await fetch(`/api/games/${id}`, { method: 'DELETE' })
    router.push('/')
    router.refresh()
  }

  if (fetching) return <p className="text-sm text-gray-400 mt-10 text-center">Loading…</p>

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Link href={`/games/${id}`} className="text-sm text-gray-600 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition-colors">
          Cancel
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Edit game</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <VenuePicker value={venue} onChange={setVenue} />

        <DateTimePicker
          date={date}
          time={time}
          onDateChange={setDate}
          onTimeChange={setTime}
        />

        <div className="w-28">
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Max players</label>
          <input
            type="number"
            min="2"
            max="50"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white font-semibold py-3.5 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 mt-2"
        >
          {loading ? 'Saving…' : 'Save changes'}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="w-full border border-red-300 text-red-600 font-medium py-3.5 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-60"
        >
          Cancel game
        </button>
      </form>
    </>
  )
}
