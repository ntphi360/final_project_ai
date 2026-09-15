const styles = {
  Thấp: { className: 'low', dot: '#12a438' },
  'Trung bình': { className: 'medium', dot: '#f8b900' },
  Cao: { className: 'high', dot: '#ff7017' },
  'Rất cao': { className: 'critical', dot: '#ef3340' },
  'Chưa có AI': { className: '', dot: '#94a3b8' },
}

const labelsByRiskLevel = {
  VERY_HIGH: 'Rất cao',
  HIGH: 'Cao',
  MEDIUM: 'Trung bình',
  LOW: 'Thấp',
}

export default function RiskBadge({ level, riskLevel }) {
  const label = labelsByRiskLevel[riskLevel] || level || 'Chưa có AI'
  const style = styles[label] || styles['Chưa có AI']
  return (
    <span className={`risk-badge ${style.className}`}>
      <i style={{ backgroundColor: style.dot }} />
      {label}
    </span>
  )
}
