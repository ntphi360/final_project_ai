import { AlertTriangle, Check, CircleAlert } from 'lucide-react'

const levels = [
  { label: 'Rất cao', key: 'critical', icon: AlertTriangle },
  { label: 'Cao', key: 'high', icon: CircleAlert },
  { label: 'Trung bình', key: 'medium', icon: AlertTriangle },
  { label: 'Thấp', key: 'low', icon: Check },
]

export default function RiskSummaryCards({ cases }) {
  const total = cases.length

  return (
    <section className="case-risk-summary" aria-label="Thống kê mức độ rủi ro">
      {levels.map(({ label, key, icon: Icon }) => {
        const count = cases.filter((item) => item.priority === label).length
        const percent = total ? ((count / total) * 100).toFixed(1) : '0,0'

        return (
          <article className={`case-risk-card ${key}`} key={label}>
            <span className="case-risk-icon"><Icon size={23} strokeWidth={2.4} /></span>
            <div>
              <span>{label}</span>
              <strong>{count}</strong>
              <small>{String(percent).replace('.', ',')}%</small>
            </div>
          </article>
        )
      })}
    </section>
  )
}
