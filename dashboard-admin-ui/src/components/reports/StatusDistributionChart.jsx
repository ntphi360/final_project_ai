import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatImportNumber } from '../../data/mockImports'

export default function StatusDistributionChart({ data, total }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-bold text-slate-900">Phân bố trạng thái hồ sơ</h2>
      <div className="mt-3 grid grid-cols-[minmax(150px,0.9fr)_minmax(150px,1fr)] items-center gap-2">
        <div className="relative h-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={2}>{data.map((item) => <Cell fill={item.color} key={item.name} />)}</Pie><Tooltip formatter={(value) => formatImportNumber(value)} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 grid place-content-center text-center"><strong className="text-xl text-slate-950">{formatImportNumber(total)}</strong><span className="text-xs text-slate-500">hồ sơ</span></div></div>
        <ul className="space-y-2">{data.map((item) => <li className="grid grid-cols-[10px_1fr] gap-x-2 text-xs" key={item.name}><span className={`mt-1 h-2.5 w-2.5 rounded-full ${item.dotClass}`} /><span className="text-slate-600">{item.name}<strong className="ml-1 text-slate-900">{formatImportNumber(item.value)}</strong><small className="ml-1 text-slate-400">({((item.value / total) * 100).toFixed(1)}%)</small></span></li>)}</ul>
      </div>
    </article>
  )
}
