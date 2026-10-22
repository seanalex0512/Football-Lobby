'use client'

import { useState, useRef, useEffect } from 'react'

interface DateTimePickerProps {
  date: string
  time: string
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = ['00', '15', '30', '45']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function formatDisplay(date: string, time: string) {
  if (!date && !time) return null
  const parts: string[] = []
  if (date) {
    const d = new Date(date + 'T00:00:00')
    parts.push(d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }))
  }
  if (time) parts.push(time.slice(0, 5))
  return parts.join(' · ')
}

export function DateTimePicker({ date, time, onDateChange, onTimeChange }: DateTimePickerProps) {
  const today = new Date()
  const [view, setView] = useState<'date' | 'time'>('date')
  const [open, setOpen] = useState(false)
  const [calYear, setCalYear] = useState(date ? new Date(date).getFullYear() : today.getFullYear())
  const [calMonth, setCalMonth] = useState(date ? new Date(date).getMonth() : today.getMonth())
  const ref = useRef<HTMLDivElement>(null)

  const selectedHour = time ? parseInt(time.slice(0, 2)) : null
  const selectedMinute = time ? time.slice(3, 5) : null

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  function selectDate(day: number) {
    const d = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    onDateChange(d)
    setView('time')
  }

  function selectTime(h: number, m: string) {
    onTimeChange(`${String(h).padStart(2, '0')}:${m}`)
    setOpen(false)
    setView('date')
  }

  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay = new Date(calYear, calMonth, 1).getDay()
  const displayDate = formatDisplay(date, time)

  return (
    <div ref={ref}>
      <label className="text-sm font-medium text-gray-700 block mb-1.5">Date &amp; kick-off time</label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen(!open); setView('date') }}
        className={`w-full border rounded-xl px-4 py-3 text-sm text-left flex items-center justify-between transition-colors ${
          displayDate
            ? 'border-green-600 text-gray-900 font-medium'
            : 'border-gray-200 text-gray-400'
        }`}
      >
        <span>{displayDate ?? 'Pick date & kick-off time…'}</span>
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {open && (
        <div className="mt-1 border border-gray-200 rounded-xl bg-white shadow-lg overflow-hidden z-50 relative">
          {/* Tab switcher */}
          <div className="flex border-b border-gray-100">
            <button
              type="button"
              onClick={() => setView('date')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                view === 'date' ? 'text-gray-900 border-b-2 border-gray-900 -mb-px' : 'text-gray-400'
              }`}
            >
              {date
                ? new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                : 'Date'}
            </button>
            <button
              type="button"
              onClick={() => setView('time')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                view === 'time' ? 'text-gray-900 border-b-2 border-gray-900 -mb-px' : 'text-gray-400'
              }`}
            >
              {time ? time.slice(0, 5) : 'Time'}
            </button>
          </div>

          {/* Calendar view */}
          {view === 'date' && (
            <div className="p-3">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600">
                  ‹
                </button>
                <span className="text-sm font-semibold">{MONTHS[calMonth]} {calYear}</span>
                <button type="button" onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600">
                  ›
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
                ))}
              </div>

              {/* Date grid */}
              <div className="grid grid-cols-7 gap-y-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const thisDate = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const isSelected = date === thisDate
                  const isToday = thisDate === today.toISOString().split('T')[0]
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => selectDate(day)}
                      className={`h-8 w-8 mx-auto flex items-center justify-center rounded-full text-sm transition-colors ${
                        isSelected
                          ? 'bg-gray-900 text-white font-semibold'
                          : isToday
                          ? 'border border-gray-300 text-gray-900 font-medium hover:bg-gray-100'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Time view */}
          {view === 'time' && (
            <div className="p-3">
              <p className="text-xs text-gray-400 mb-3 text-center">Select kick-off time</p>
              <div className="max-h-56 overflow-y-auto">
                <div className="grid grid-cols-4 gap-1.5">
                  {HOURS.map(h =>
                    MINUTES.map(m => {
                      const isSelected = selectedHour === h && selectedMinute === m
                      const label = `${String(h).padStart(2, '0')}:${m}`
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => selectTime(h, m)}
                          className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {label}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
