import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const granularityOptions = [
  { value: 'day', label: 'Theo ngày' },
  { value: 'month', label: 'Theo tháng' },
  { value: 'year', label: 'Theo năm' },
]

export default function CaseTrendChart({ data, granularity, onGranularityChange }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-sm font-bold text-slate-900">Xu hướng tiếp nhận và hoàn thành hồ sơ</h2><select aria-label="Chu kỳ thống kê" value={granularity} className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 outline-none focus:border-blue-500" onChange={(event) => onGranularityChange(event.target.value)}>{granularityOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></div>
      <div className="h-64 w-full">
        {data.length === 0
          ? <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">Chưa có dữ liệu xu hướng theo tháng.</div>
          : <ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} /><Tooltip /><Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} /><Line type="monotone" dataKey="received" name="Hồ sơ tiếp nhận" stroke="#1677ff" strokeWidth={2.5} dot={{ r: 3 }} /><Line type="monotone" dataKey="completed" name="Hồ sơ hoàn thành" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3 }} /></LineChart></ResponsiveContainer>}
      </div>
    </article>
  )
}
