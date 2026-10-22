'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'


export function LoginClient() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/signup'
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col justify-start pt-10">
      <div className="flex items-center gap-2 mb-8">
        <span className="w-2 h-2 rounded-full bg-green-600" />
        <span className="font-semibold text-sm">Football Lobby</span>
      </div>

      <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
      <p className="text-sm text-gray-500 mb-6">Try &quot;Sam K.&quot; with any 4+ character password.</p>

      {/* Tab toggle */}
      <div className="flex gap-0 mb-6">
        <button
          type="button"
          onClick={() => { setTab('login'); setError('') }}
          className={`flex-1 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
            tab === 'login'
              ? 'border-gray-900 text-gray-900 bg-white'
              : 'border-gray-200 text-gray-500 bg-white hover:text-gray-700'
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => { setTab('signup'); setError('') }}
          className={`flex-1 py-2.5 text-sm font-medium rounded-xl border transition-colors -ml-px ${
            tab === 'signup'
              ? 'border-gray-900 text-gray-900 bg-white'
              : 'border-gray-200 text-gray-500 bg-white hover:text-gray-700'
          }`}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="How the team knows you"
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white font-semibold py-3.5 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 mt-1"
        >
          {loading ? 'Loading…' : tab === 'login' ? 'Log in' : 'Sign up'}
        </button>
      </form>
    </div>
  )
}
