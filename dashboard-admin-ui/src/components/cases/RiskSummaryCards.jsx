import { AlertTriangle, Check, CircleAlert } from 'lucide-react'

const levels = [
  { level: 'VERY_HIGH', label: 'Rất cao', key: 'critical', icon: AlertTriangle },
  { level: 'HIGH', label: 'Cao', key: 'high', icon: CircleAlert },
  { level: 'MEDIUM', label: 'Trung bình', key: 'medium', icon: AlertTriangle },
  { level: 'LOW', label: 'Thấp', key: 'low', icon: Check },
]

export default function RiskSummaryCards({ cases }) {
  return (
    <section className="case-risk-summary" aria-label="Thống kê mức độ rủi ro">
      {levels.map(({ level, label, key, icon: Icon }) => {
        const count = cases.filter((item) => item.riskLevel === level).length
        return (
          <article className={`case-risk-card ${key}`} key={label}>
            <span className="case-risk-icon"><Icon size={23} strokeWidth={2.4} /></span>
            <div>
              <span>{label}</span>
              <strong>{count}</strong>
              <small>Hồ sơ đang xử lý</small>
            </div>
          </article>
        )
      })}
    </section>
  )
}
