'use client'

import { useState, useRef, useEffect } from 'react'
import { VENUES, AREAS, Venue } from '@/lib/venues'

interface VenuePickerProps {
  value: Venue | null
  onChange: (venue: Venue | null) => void
}

export function VenuePicker({ value, onChange }: VenuePickerProps) {
  const [open, setOpen] = useState(false)
  const [area, setArea] = useState('All')
  const [search, setSearch] = useState('')
  const [custom, setCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const filtered = VENUES.filter((v) => {
    const matchArea = area === 'All' || v.area === area
    const matchSearch =
      search.trim() === '' ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.area.toLowerCase().includes(search.toLowerCase())
    return matchArea && matchSearch
  })

  function selectVenue(v: Venue) {
    onChange(v)
    setOpen(false)
    setSearch('')
    setCustom(false)
  }

  function handleCustom() {
    setCustom(true)
    setOpen(false)
  }

  function applyCustom() {
    if (!customName.trim()) return
    onChange({
      id: 'custom',
      name: customName.trim(),
      address: '',
      area: 'Custom',
      hours: '',
      type: 'futsal',
    })
    setCustom(false)
  }

  function clear() {
    onChange(null)
    setCustom(false)
    setCustomName('')
    setSearch('')
  }

  const typeLabel = (type: Venue['type']) =>
    type === 'futsal' ? 'Futsal' : type === 'football' ? 'Football' : 'Futsal & Football'

  // Selected state
  if (value && !open) {
    return (
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">Venue</label>
        <div
          className="border border-green-600 rounded-xl p-3 cursor-pointer hover:bg-green-50 transition-colors"
          onClick={() => setOpen(true)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{value.name}</p>
              {value.address && (
                <p className="text-xs text-gray-500 truncate mt-0.5">{value.address}</p>
              )}
              {value.hours && (
                <p className="text-xs text-green-700 mt-1 font-medium">{value.hours}</p>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clear() }}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0 mt-0.5"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Custom venue entry
  if (custom) {
    return (
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">Venue</label>
        <div className="border border-gray-200 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-2">Enter venue name</p>
          <div className="flex gap-2">
            <input
              type="text"
              autoFocus
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyCustom()}
              placeholder="e.g. Padang Sri Bahari"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
            <button
              type="button"
              onClick={applyCustom}
              className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg"
            >
              Set
            </button>
            <button
              type="button"
              onClick={() => setCustom(false)}
              className="border border-gray-200 text-gray-500 text-sm px-3 py-2 rounded-lg"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={ref}>
      <label className="text-sm font-medium text-gray-700 block mb-1.5">Venue</label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-left text-gray-400 hover:border-gray-400 transition-colors flex items-center justify-between"
      >
        <span>Select a venue in Penang…</span>
        <span className="text-gray-300">▾</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="mt-1 border border-gray-200 rounded-xl bg-white shadow-lg overflow-hidden z-50 relative">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search venues…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </div>

          {/* Area tabs */}
          <div className="flex gap-1 px-3 py-2 border-b border-gray-100 overflow-x-auto scrollbar-hide">
            {AREAS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setArea(a)}
                className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                  area === a
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          {/* Venue list */}
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No venues found</p>
            ) : (
              filtered.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => selectVenue(v)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{v.name}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{v.address}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {typeLabel(v.type)}
                      </span>
                      {v.hours && (
                        <span className="text-xs text-green-700 font-medium whitespace-nowrap">
                          {v.hours}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Custom option */}
          <div className="border-t border-gray-100">
            <button
              type="button"
              onClick={handleCustom}
              className="w-full text-left px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <span className="text-gray-400">＋</span> Other / enter custom venue
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
