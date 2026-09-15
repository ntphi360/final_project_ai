const riskColors = {
  LOW: '#16b779',
  MEDIUM: '#f4b000',
  HIGH: '#f97316',
  VERY_HIGH: '#ef3340',
}

export function getRiskProgressState(value) {
  const numericValue = value == null || value === '' ? Number.NaN : Number(value)
  const isValid = Number.isFinite(numericValue)
  const safePercentage = isValid ? Math.max(numericValue, 0) : 0

  return {
    isValid,
    progressWidth: Math.min(safePercentage, 100),
    text: isValid ? `${numericValue.toFixed(2)}%` : '—',
  }
}

export default function RiskProgressBar({
  value,
  riskLevel,
  variant = 'case',
  footer = null,
}) {
  const { progressWidth, text } = getRiskProgressState(value)
  const color = riskColors[riskLevel] || '#94a3b8'
  const progress = (
    <span className="overflow-hidden" aria-hidden="true">
      <i style={{ width: `${progressWidth}%`, backgroundColor: color }} />
    </span>
  )

  if (variant === 'dashboard') {
    return (
      <div className="risk-meter">
        {progress}
        <div>
          <b style={{ color }}>{text}</b>
          {footer}
        </div>
      </div>
    )
  }

  if (variant === 'detail') {
    return (
      <>
        <strong style={{ color }}>{text}</strong>
        <div className="detail-risk-progress overflow-hidden">
          <i style={{ width: `${progressWidth}%`, backgroundColor: color }} />
        </div>
      </>
    )
  }

  return (
    <div className="case-risk-meter" style={{ '--risk-color': color }}>
      <b>{text}</b>
      {progress}
      {footer}
    </div>
  )
}
