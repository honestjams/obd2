import { useEffect, useState } from 'react'
import { DiagnosisResult } from '../types'

interface HistoryEntry {
  id: string
  created_at: string
  year: string
  make: string
  model: string
  code: string
  result: DiagnosisResult
}

const severityDot: Record<string, string> = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
}

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (entry: HistoryEntry) => void
}

export default function HistoryDrawer({ open, onClose, onSelect }: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setError(null)
    fetch('/api/history')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setEntries(data)
        else setError('Failed to load history')
      })
      .catch(() => setError('Failed to load history'))
      .finally(() => setLoading(false))
  }, [open])

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-30 w-full max-w-sm bg-white shadow-2xl
                    flex flex-col transition-transform duration-300
                    ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Lookups</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400
                       hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 rounded-full border-4 border-gray-100 border-t-amber-500 animate-spin" />
            </div>
          )}

          {error && (
            <p className="text-center text-sm text-red-500 py-10 px-6">{error}</p>
          )}

          {!loading && !error && entries.length === 0 && (
            <div className="text-center py-16 px-6">
              <p className="text-gray-400 text-sm">No lookups yet.</p>
              <p className="text-gray-400 text-xs mt-1">Diagnose a code to see it here.</p>
            </div>
          )}

          {!loading && entries.map(entry => (
            <button
              key={entry.id}
              onClick={() => { onSelect(entry); onClose(); }}
              className="w-full text-left px-5 py-4 border-b border-gray-50
                         hover:bg-amber-50 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-gray-900">{entry.code}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${severityDot[entry.result.severity] ?? 'bg-gray-400'}`} />
                  <span className="text-xs text-gray-400 capitalize">{entry.result.severity}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-0.5">
                {entry.year} {entry.make} {entry.model}
              </p>
              <p className="text-xs text-gray-400 mt-1 line-clamp-1">{entry.result.description}</p>
              <p className="text-xs text-gray-300 mt-1">
                {new Date(entry.created_at).toLocaleDateString(undefined, {
                  month: 'short', day: 'numeric', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
