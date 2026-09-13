import { Eye } from 'lucide-react'

const riskClasses = {
  'Rất cao': 'bg-red-50 text-red-700',
  Cao: 'bg-orange-50 text-orange-700',
  'Trung bình': 'bg-amber-50 text-amber-700',
  Thấp: 'bg-emerald-50 text-emerald-700',
}

export default function AttentionCasesTable({ cases, onView }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 px-4 py-3"><h2 className="text-base font-bold text-slate-900">Hồ sơ cần chú ý</h2><p className="mt-1 text-xs text-slate-500">Các hồ sơ có nguy cơ trễ hạn hoặc cần phản hồi sớm.</p></header>
      <div className="overflow-x-auto">
        <table className="min-w-[1000px] w-full table-fixed border-collapse text-sm text-slate-700">
          <thead className="bg-slate-50"><tr><th className="h-10 w-14 border-b border-slate-200 px-3 text-center normal-case">STT</th><th className="w-24 border-b border-slate-200 px-3 normal-case">Mã hồ sơ</th><th className="w-72 border-b border-slate-200 px-3 normal-case">Tên thủ tục</th><th className="w-40 border-b border-slate-200 px-3 normal-case">Cán bộ phụ trách</th><th className="w-32 border-b border-slate-200 px-3 normal-case">Thời gian còn lại</th><th className="w-32 border-b border-slate-200 px-3 normal-case">Nguy cơ trễ hạn</th><th className="w-32 border-b border-slate-200 px-3 normal-case">Trạng thái</th><th className="w-24 border-b border-slate-200 px-3 text-center normal-case">Thao tác</th></tr></thead>
          <tbody>{cases.map((item, index) => <tr className="hover:bg-slate-50" key={item.id}><td className="h-12 border-b border-slate-100 px-3 text-center">{index + 1}</td><td className="border-b border-slate-100 px-3 font-semibold text-blue-700">{item.id}</td><td className="border-b border-slate-100 px-3"><span className="block truncate" title={item.procedure}>{item.procedure}</span></td><td className="border-b border-slate-100 px-3">{item.officer}</td><td className={`border-b border-slate-100 px-3 font-semibold ${item.remainingHours <= 24 ? 'text-red-600' : 'text-orange-600'}`}>{item.remaining}</td><td className="border-b border-slate-100 px-3"><span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${riskClasses[item.risk]}`}>{item.risk}</span></td><td className="border-b border-slate-100 px-3"><span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${item.status === 'Chờ xác nhận' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>{item.status}</span></td><td className="border-b border-slate-100 px-3 text-center"><button type="button" className="mx-auto flex h-8 w-20 items-center justify-center gap-1.5 rounded-md border border-blue-500 text-xs font-semibold text-blue-700 hover:bg-blue-50" onClick={() => onView(item.id)}><Eye size={15} /> Xem</button></td></tr>)}{cases.length === 0 && <tr><td className="h-24 text-center text-sm text-slate-500" colSpan="8">Chưa có hồ sơ cần chú ý.</td></tr>}</tbody>
        </table>
      </div>
    </section>
  )
}
