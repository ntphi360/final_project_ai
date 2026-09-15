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

export default function RiskChart({ data, predictionCount = 0 }) {
  return (
    <article className="dashboard-card risk-chart-card">
      <SectionHeading
        icon={BriefcaseBusiness}
        iconColor="#16b88d"
        title="Nguy cơ trễ hạn (hồ sơ đang xử lý)"
        subtitle={`${predictionCount} hồ sơ đã có dự đoán AI`}
      />
      {data.length === 0 ? <div className="flex h-64 items-center justify-center px-6 text-center text-sm text-slate-500">Chưa có quy tắc phân loại mức nguy cơ để hiển thị biểu đồ.</div> : <div className="risk-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 8, left: -14, bottom: 0 }}>
            <CartesianGrid stroke="#e6edf6" vertical={false} />
            <XAxis dataKey="name" axisLine={{ stroke: '#b9c9dc' }} tickLine={false} tick={{ fill: '#16335d', fontSize: 12 }} />
            <YAxis domain={[0, 80]} ticks={[0, 20, 40, 60, 80]} axisLine={false} tickLine={false} tick={{ fill: '#35547d', fontSize: 12 }} />
            <Tooltip cursor={{ fill: '#f5f8fc' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={58}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
              <LabelList dataKey="value" position="top" fill="#081b38" fontSize={14} fontWeight={700} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>}
    </article>
  )
}
