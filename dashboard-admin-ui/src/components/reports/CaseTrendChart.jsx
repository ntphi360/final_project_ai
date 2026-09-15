import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function CaseTrendChart({ data }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-sm font-bold text-slate-900">Xu hướng tiếp nhận và hoàn thành hồ sơ</h2><span className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-500">Theo tháng</span></div>
      <div className="h-64 w-full">
        {data.length === 0
          ? <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">Chưa có dữ liệu xu hướng theo tháng.</div>
          : <ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} /><Tooltip /><Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} /><Line type="monotone" dataKey="received" name="Hồ sơ tiếp nhận" stroke="#1677ff" strokeWidth={2.5} dot={{ r: 3 }} /><Line type="monotone" dataKey="completed" name="Hồ sơ hoàn thành" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3 }} /></LineChart></ResponsiveContainer>}
      </div>
    </article>
  )
}
