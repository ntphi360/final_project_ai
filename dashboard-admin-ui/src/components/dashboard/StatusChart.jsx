import { ChartNoAxesCombined } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import SectionHeading from './SectionHeading'

export default function StatusChart({ data }) {
  return (
    <article className="dashboard-card status-card">
      <SectionHeading
        icon={ChartNoAxesCombined}
        iconColor="#0877ed"
        title="Tình trạng hồ sơ"
        subtitle="Tổng 1.248 hồ sơ"
      />
      <div className="status-content">
        <div className="donut-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="56%"
                outerRadius="78%"
                paddingAngle={1}
                stroke="#fff"
                strokeWidth={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} hồ sơ`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center">
            <strong>1.248</strong>
            <span>hồ sơ</span>
          </div>
        </div>
        <div className="status-legend">
          {data.map((item) => (
            <div className="legend-item" key={item.name}>
              <i style={{ backgroundColor: item.color }} />
              <span>
                {item.name}
                <strong>
                  {item.value} ({item.percent}%)
                </strong>
              </span>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}
