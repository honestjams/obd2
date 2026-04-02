import { useState } from 'react'
import { FormData } from '../types'

const CAR_MAKES = [
  'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Buick',
  'Cadillac', 'Chevrolet', 'Chrysler', 'Citroën', 'Dodge', 'Ferrari', 'Fiat',
  'Ford', 'Genesis', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jaguar', 'Jeep',
  'Kia', 'Lamborghini', 'Land Rover', 'Lexus', 'Lincoln', 'Lotus', 'Maserati',
  'Mazda', 'McLaren', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan', 'Oldsmobile',
  'Peugeot', 'Plymouth', 'Pontiac', 'Porsche', 'Ram', 'Renault', 'Rolls-Royce',
  'Saturn', 'Subaru', 'Suzuki', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo',
]

const CURRENT_YEAR = new Date().getFullYear()

interface Props {
  onSubmit: (data: FormData) => void
  loading: boolean
}

export default function DiagnosticForm({ onSubmit, loading }: Props) {
  const [formData, setFormData] = useState<FormData>({
    year: '',
    make: '',
    model: '',
    code: '',
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {}

    const year = parseInt(formData.year)
    if (!formData.year || isNaN(year) || year < 1980 || year > CURRENT_YEAR + 1) {
      newErrors.year = `Enter a year between 1980 and ${CURRENT_YEAR + 1}`
    }

    if (!formData.make.trim()) {
      newErrors.make = 'Enter a car brand'
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Enter a model name'
    }

    const codePattern = /^[PBCU][0-9A-Z]{4}$/i
    const cleanCode = formData.code.trim().replace(/\s/g, '')
    if (!cleanCode) {
      newErrors.code = 'Enter an OBD2 code'
    } else if (!codePattern.test(cleanCode)) {
      newErrors.code = 'Code format: P0XXX, B0XXX, C0XXX, or U0XXX'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit({
        ...formData,
        code: formData.code.trim().toUpperCase(),
        make: formData.make.trim(),
        model: formData.model.trim(),
      })
    }
  }

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card p-5 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Vehicle Details</h2>
        <p className="text-sm text-gray-500 mt-0.5">Enter your car info and the code from your scanner</p>
      </div>

      {/* Year + Make row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="year" className="label">Year</label>
          <input
            id="year"
            type="number"
            inputMode="numeric"
            placeholder="e.g. 2003"
            min={1980}
            max={CURRENT_YEAR + 1}
            value={formData.year}
            onChange={handleChange('year')}
            disabled={loading}
            className={`input-field ${errors.year ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''}`}
          />
          {errors.year && (
            <p className="mt-1.5 text-xs text-red-600">{errors.year}</p>
          )}
        </div>

        <div>
          <label htmlFor="make" className="label">Brand / Make</label>
          <input
            id="make"
            type="text"
            placeholder="e.g. Nissan"
            list="makes-list"
            value={formData.make}
            onChange={handleChange('make')}
            disabled={loading}
            autoComplete="off"
            className={`input-field ${errors.make ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''}`}
          />
          <datalist id="makes-list">
            {CAR_MAKES.map(m => <option key={m} value={m} />)}
          </datalist>
          {errors.make && (
            <p className="mt-1.5 text-xs text-red-600">{errors.make}</p>
          )}
        </div>
      </div>

      {/* Model */}
      <div>
        <label htmlFor="model" className="label">Model</label>
        <input
          id="model"
          type="text"
          placeholder="e.g. 350Z"
          value={formData.model}
          onChange={handleChange('model')}
          disabled={loading}
          autoComplete="off"
          className={`input-field ${errors.model ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''}`}
        />
        {errors.model && (
          <p className="mt-1.5 text-xs text-red-600">{errors.model}</p>
        )}
      </div>

      {/* OBD2 Code */}
      <div>
        <label htmlFor="code" className="label">OBD2 Code</label>
        <input
          id="code"
          type="text"
          placeholder="e.g. P0300"
          value={formData.code}
          onChange={handleChange('code')}
          disabled={loading}
          autoCapitalize="characters"
          autoComplete="off"
          maxLength={6}
          className={`input-field font-mono tracking-widest uppercase ${errors.code ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''}`}
        />
        <p className="mt-1.5 text-xs text-gray-400">P, B, C, or U codes — e.g. P0300, P0171</p>
        {errors.code && (
          <p className="mt-1 text-xs text-red-600">{errors.code}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white font-semibold
                   py-4 px-6 rounded-xl transition-colors duration-150 disabled:opacity-50
                   disabled:cursor-not-allowed text-base shadow-sm shadow-amber-500/25
                   focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Diagnosing…
          </span>
        ) : (
          'Diagnose Code'
        )}
      </button>
    </form>
  )
}
