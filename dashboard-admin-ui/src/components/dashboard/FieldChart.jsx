import { Box, ArrowRight } from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import SectionHeading from './SectionHeading'

export default function FieldChart({ data }) {
  return (
    <article className="dashboard-card field-card">
      <SectionHeading
        icon={Box}
        iconColor="#0877ed"
        title="Hồ sơ theo lĩnh vực"
        subtitle="Top 5 lĩnh vực có số lượng hồ sơ nhiều nhất"
      />
      {data.length === 0 ? <div className="flex h-64 items-center justify-center text-sm text-slate-500">Chưa có dữ liệu lĩnh vực.</div> : <div className="field-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 44, left: 3, bottom: 0 }} barCategoryGap={14}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip cursor={{ fill: '#f6f9fd' }} />
            <Bar dataKey="value" radius={[0, 5, 5, 0]} barSize={5}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
              <LabelList content={(props) => <FieldLabel {...props} data={data} />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>}
      <button type="button" className="detail-link">
        Xem chi tiết <ArrowRight size={16} />
      </button>
    </article>
  )
}

function FieldLabel({ x, y, width, value, index, data }) {
  return (
    <g>
      <text x={x} y={y - 6} fill="#263f67" fontSize="12">
        {data[index]?.name}
      </text>
      <text x={x + width + 34} y={y - 6} textAnchor="end" fill="#0c1f3d" fontSize="12" fontWeight="700">
        {value}
      </text>
    </g>
  )
}
