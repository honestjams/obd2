import { DiagnosisResult } from '../types'

const severityConfig = {
  low: {
    label: 'Low Severity',
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    dot: 'bg-green-500',
    bar: 'bg-green-400',
    barWidth: 'w-1/4',
  },
  medium: {
    label: 'Medium Severity',
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    dot: 'bg-yellow-500',
    bar: 'bg-yellow-400',
    barWidth: 'w-2/4',
  },
  high: {
    label: 'High Severity',
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    bar: 'bg-orange-400',
    barWidth: 'w-3/4',
  },
  critical: {
    label: 'Critical',
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    dot: 'bg-red-500',
    bar: 'bg-red-500',
    barWidth: 'w-full',
  },
}

const difficultyConfig = {
  easy: { label: 'Easy DIY', color: 'text-green-600', icon: '🔧' },
  moderate: { label: 'Moderate DIY', color: 'text-yellow-600', icon: '🔧🔧' },
  difficult: { label: 'Difficult DIY', color: 'text-orange-600', icon: '🔧🔧🔧' },
  professional_only: { label: 'Professional Recommended', color: 'text-red-600', icon: '🏪' },
}

interface Props {
  result: DiagnosisResult
  onReset: () => void
}

export default function DiagnosticResult({ result, onReset }: Props) {
  const severity = severityConfig[result.severity] ?? severityConfig.medium
  const difficulty = difficultyConfig[result.diy_difficulty] ?? difficultyConfig.moderate

  return (
    <div className="space-y-4">
      {/* Code header card */}
      <div className="card overflow-hidden">
        {/* Severity bar */}
        <div className="h-1.5 bg-gray-100 w-full">
          <div className={`h-full ${severity.bar} ${severity.barWidth} transition-all`} />
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-2xl font-bold text-gray-900">{result.code}</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${severity.bg} ${severity.text} ${severity.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${severity.dot}`} />
                  {severity.label}
                </span>
              </div>
              <p className="mt-2 text-gray-700 text-sm leading-relaxed">{result.description}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">System</span>
              <p className="text-sm font-medium text-gray-800 mt-0.5">{result.system_affected}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Repair Difficulty</span>
              <p className={`text-sm font-medium mt-0.5 ${difficulty.color}`}>
                {difficulty.icon} {difficulty.label}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estimated cost */}
      <div className="card p-5">
        <p className="section-heading">Estimated Repair Cost</p>
        <p className="text-sm text-gray-800 font-medium">{result.estimated_repair_cost}</p>
      </div>

      {/* Symptoms */}
      {result.common_symptoms.length > 0 && (
        <div className="card p-5">
          <p className="section-heading">Common Symptoms</p>
          <ul className="space-y-2">
            {result.common_symptoms.map((symptom, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold mt-0.5">
                  !
                </span>
                {symptom}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sensors involved */}
      {result.sensors_involved.length > 0 && (
        <div className="card p-5">
          <p className="section-heading">Sensors &amp; Components Involved</p>
          <div className="space-y-3">
            {result.sensors_involved.map((sensor, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 border ${
                  sensor.likely_faulty
                    ? 'bg-red-50 border-red-100'
                    : 'bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-sm text-gray-900">{sensor.name}</span>
                  {sensor.likely_faulty && (
                    <span className="flex-shrink-0 text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">
                      Suspect
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {sensor.location}
                </p>
                <p className="text-xs text-gray-600 mt-1.5">{sensor.function}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Possible causes */}
      {result.possible_causes.length > 0 && (
        <div className="card p-5">
          <p className="section-heading">Possible Causes</p>
          <ol className="space-y-2.5">
            {result.possible_causes.map((cause, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold mt-0.5">
                  {i + 1}
                </span>
                {cause}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Diagnostic steps */}
      {result.diagnostic_steps.length > 0 && (
        <div className="card p-5">
          <p className="section-heading">How to Diagnose</p>
          <ol className="space-y-3">
            {result.diagnostic_steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {/* Strip leading "1. " numbering if Claude included it */}
                  {step.replace(/^\d+\.\s*/, '')}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Resolution steps */}
      {result.resolution_steps.length > 0 && (
        <div className="card p-5 border-green-100 bg-green-50/50">
          <p className="section-heading">How to Fix It</p>
          <ol className="space-y-3">
            {result.resolution_steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {step.replace(/^\d+\.\s*/, '')}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Additional notes */}
      {result.additional_notes && (
        <div className="card p-5 bg-blue-50/50 border-blue-100">
          <p className="section-heading">Vehicle-Specific Notes</p>
          <p className="text-sm text-gray-700 leading-relaxed">{result.additional_notes}</p>
        </div>
      )}

      {/* New search button */}
      <div className="pt-2 pb-4">
        <button
          onClick={onReset}
          className="w-full border-2 border-gray-200 text-gray-700 font-semibold py-3.5 px-6
                     rounded-xl hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100
                     transition-colors duration-150 text-sm
                     focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
        >
          Search Another Code
        </button>
      </div>
    </div>
  )
}
