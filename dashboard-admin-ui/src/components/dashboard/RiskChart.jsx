import { BriefcaseBusiness } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import SectionHeading from './SectionHeading'

export default function RiskChart({ data, predictionCount = 0, onSelectRisk }) {
  const hasData = data.some((item) => item.value > 0)

  return (
    <article className="dashboard-card risk-chart-card">
      <SectionHeading
        icon={BriefcaseBusiness}
        iconColor="#16b88d"
        title="Nguy cơ trễ hạn (hồ sơ đang xử lý)"
        subtitle={`${predictionCount} hồ sơ đã được phân loại`}
      />
      {!hasData ? <div className="flex h-64 items-center justify-center px-6 text-center text-sm text-slate-500">Chưa có hồ sơ đủ dữ liệu để phân loại nguy cơ.</div> : <div className="risk-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 8, left: -14, bottom: 0 }}>
            <CartesianGrid stroke="#e6edf6" vertical={false} />
            <XAxis dataKey="name" axisLine={{ stroke: '#b9c9dc' }} tickLine={false} tick={{ fill: '#16335d', fontSize: 12 }} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#35547d', fontSize: 12 }} />
            <Tooltip cursor={{ fill: '#f5f8fc' }} formatter={(value) => [`${value} hồ sơ`, 'Số hồ sơ']} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={58}>
              {data.map((entry) => (
                <Cell
                  className="cursor-pointer"
                  key={entry.name}
                  fill={entry.color}
                  onClick={() => onSelectRisk?.(entry.level)}
                />
              ))}
              <LabelList dataKey="value" position="top" fill="#081b38" fontSize={14} fontWeight={700} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>}
    </article>
  )
}
