import { ArrowUp } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer } from 'recharts'

export default function StatCard({ stat }) {
  const Icon = stat.icon
  const data = (stat.sparkline || []).map((value, index) => ({ index, value }))

  return (
    <article className="stat-card">
      <span className="stat-icon" style={{ color: stat.color, backgroundColor: `${stat.color}18` }}>
        <Icon size={26} strokeWidth={2.2} />
      </span>
      <div className="stat-copy">
        <span className="stat-label">{stat.label}</span>
        <strong>{stat.value}</strong>
        {stat.trend == null ? <span className="stat-trend"><em>{stat.note || 'Dữ liệu hiện tại'}</em></span> : <span className={`stat-trend ${stat.trendDirection === 'up-risk' ? 'is-risk' : ''}`}><ArrowUp size={15} strokeWidth={2.5} /><b>{stat.trend}%</b><em>so với tháng trước</em></span>}
      </div>
      <div className="sparkline" aria-hidden="true">
        {data.length > 0 && <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={stat.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>}
      </div>
    </article>
  )
}
