import { useState } from 'react'
import DiagnosticForm from './components/DiagnosticForm'
import DiagnosticResult from './components/DiagnosticResult'
import HistoryDrawer from './components/HistoryDrawer'
import { DiagnosisResult, FormData } from './types'

function App() {
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vehicleInfo, setVehicleInfo] = useState<FormData | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    setResult(null)
    setVehicleInfo(formData)

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      setResult(data)

      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
    setVehicleInfo(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 text-white sticky top-0 z-10 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">OBD2 Diagnostic Tool</h1>
              <p className="text-xs text-gray-400 leading-tight">AI-powered engine code lookup</p>
            </div>
          </div>

          {/* History button */}
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white
                       transition-colors px-2 py-1.5 rounded-lg hover:bg-white/10"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">History</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-6">
        {!result && !loading && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
            <span className="text-amber-500 flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <p className="text-sm text-amber-800 leading-relaxed">
              Enter your vehicle details and the OBD2 code from your scanner to get a full diagnosis — including affected sensors, likely causes, and repair steps.
            </p>
          </div>
        )}

        <DiagnosticForm onSubmit={handleSubmit} loading={loading} />

        {error && (
          <div className="card p-4 border-red-100 bg-red-50 flex gap-3">
            <span className="text-red-500 flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-red-800">Diagnosis failed</p>
              <p className="text-sm text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {loading && vehicleInfo && (
          <div className="card p-6 flex flex-col items-center gap-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
              <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900">Analyzing {vehicleInfo.code.toUpperCase()}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
              </p>
              <p className="text-xs text-gray-400 mt-2">This usually takes 10–20 seconds…</p>
            </div>
          </div>
        )}

        {result && !loading && (
          <div id="results">
            <DiagnosticResult result={result} onReset={handleReset} />
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 mt-8">
        <div className="max-w-2xl mx-auto px-4 py-5 text-center">
          <p className="text-xs text-gray-400">
            For informational purposes only. Always consult a qualified mechanic for safety-critical repairs.
          </p>
        </div>
      </footer>

      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelect={(entry) => {
          setResult(entry.result)
          setVehicleInfo({ year: entry.year, make: entry.make, model: entry.model, code: entry.code })
          setTimeout(() => {
            document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 100)
        }}
      />
    </div>
  )
}

export default App
