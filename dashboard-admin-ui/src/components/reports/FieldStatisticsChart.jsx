import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatApiNumber } from '../../services/serviceUtils'

export default function FieldStatisticsChart({ data }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-bold text-slate-900">Hồ sơ theo lĩnh vực</h2>
      <div className="mt-3 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} layout="vertical" margin={{ top: 0, right: 34, left: 12, bottom: 0 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} /><XAxis type="number" hide /><YAxis type="category" dataKey="name" width={82} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => formatApiNumber(value)} /><Bar dataKey="value" name="Hồ sơ" fill="#60a5fa" radius={[0, 4, 4, 0]} barSize={16}><LabelList dataKey="value" position="right" className="fill-slate-600 text-[10px]" formatter={formatApiNumber} /></Bar></BarChart></ResponsiveContainer></div>
    </article>
  )
}
