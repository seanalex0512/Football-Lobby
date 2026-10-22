'use client'

interface ProgressBarProps {
  filled: number
  total: number
}

export function ProgressBar({ filled, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.min((filled / total) * 100, 100) : 0
  return (
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2.5">
      <div
        className="h-full bg-green-600 rounded-full transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
