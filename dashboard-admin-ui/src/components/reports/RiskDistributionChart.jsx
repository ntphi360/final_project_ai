import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function RiskDistributionChart({ data }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-bold text-slate-900">Phân bố nguy cơ trễ hạn</h2>
           {data.length === 0 ? <div className="flex h-64 items-center justify-center text-sm text-slate-500">Chưa có dữ liệu dự đoán AI.</div> : <div className="mt-3 h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 24, right: 4, left: -24, bottom: 0 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="value" name="Số hồ sơ" radius={[5, 5, 0, 0]}>{data.map((item) => <Cell fill={item.color} key={item.name} />)}<LabelList dataKey="value" position="top" fill="#334155" fontSize={11} fontWeight={600} /></Bar></BarChart></ResponsiveContainer></div>}
    </article>
  )
}
