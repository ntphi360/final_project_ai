import { formatApiNumber } from '../../services/serviceUtils'

export default function DepartmentStatisticsTable({ data }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-bold text-slate-900">Hiệu quả xử lý theo phòng ban</h2>
      <div className="overflow-x-auto">
        <table className="min-w-[450px] w-full table-fixed border-collapse text-[10px] text-slate-700">
          <thead className="bg-slate-50"><tr><th className="h-10 w-44 border-b border-slate-200 px-2 normal-case">Phòng ban</th><th className="border-b border-slate-200 px-1 text-right leading-3 normal-case">Tổng hồ sơ</th><th className="border-b border-slate-200 px-1 text-right leading-3 normal-case">Đang xử lý</th><th className="border-b border-slate-200 px-1 text-right leading-3 normal-case">Hoàn thành</th><th className="border-b border-slate-200 px-1 text-right leading-3 normal-case">Nguy cơ trễ hạn</th><th className="border-b border-slate-200 px-1 text-right leading-3 normal-case">Tỷ lệ hoàn thành</th></tr></thead>
          <tbody>{data.map((item) => <tr className="hover:bg-slate-50" key={item.name}><td className="h-11 border-b border-slate-100 px-2 font-medium text-slate-800">{item.name}</td><td className="border-b border-slate-100 px-1 text-right tabular-nums">{formatApiNumber(item.total)}</td><td className="border-b border-slate-100 px-1 text-right tabular-nums">{item.processing}</td><td className="border-b border-slate-100 px-1 text-right tabular-nums">{item.completed}</td><td className="border-b border-slate-100 px-1 text-right tabular-nums">{item.risk}</td><td className="border-b border-slate-100 px-1 text-right font-bold text-emerald-600">{item.rate}%</td></tr>)}{data.length === 0 && <tr><td colSpan="6" className="h-24 px-3 text-center text-sm text-slate-500">Chưa có dữ liệu thống kê theo phòng ban.</td></tr>}</tbody>
        </table>
      </div>
    </article>
  )
}
