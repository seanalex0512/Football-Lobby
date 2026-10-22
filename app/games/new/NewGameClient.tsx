'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { VenuePicker } from '@/components/VenuePicker'
import { DateTimePicker } from '@/components/DateTimePicker'
import { Venue } from '@/lib/venues'

export function NewGameClient() {
  const router = useRouter()
  const [venue, setVenue] = useState<Venue | null>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [form, setForm] = useState({ total_cost: '0', max_players: '10' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!venue) { setError('Please select a venue'); return }
    if (!date) { setError('Please pick a date'); return }
    if (!time) { setError('Please pick a kick-off time'); return }

    setLoading(true)
    const res = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        date,
        time,
        venue_name: venue.name,
        venue_address: venue.address || null,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? 'Failed to create game'); return }
    router.push(`/games/${data.game.id}`)
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-sm text-gray-600 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition-colors">
          Cancel
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">New game</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <VenuePicker value={venue} onChange={setVenue} />

        <DateTimePicker
          date={date}
          time={time}
          onDateChange={setDate}
          onTimeChange={setTime}
        />

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Total pitch cost</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">RM</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.total_cost}
                onChange={(e) => update('total_cost', e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
              />
            </div>
          </div>
          <div className="w-28">
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Max players</label>
            <input
              type="number"
              min="2"
              max="50"
              value={form.max_players}
              onChange={(e) => update('max_players', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 -mt-1">
          The per-player price is set after the game, split between everyone who played. You&apos;ll confirm it from the game page.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white font-semibold py-3.5 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 mt-2"
        >
          {loading ? 'Creating…' : 'Create game'}
        </button>
      </form>
    </>
  )
}
