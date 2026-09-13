import { AlertCircle, CheckCircle2, Eye, FileSpreadsheet, SkipForward } from 'lucide-react'
import { formatImportNumber } from '../../services/importService'

const items = [
  { key: 'totalRows', label: 'Tổng số dòng', icon: FileSpreadsheet, tone: 'bg-blue-50 text-blue-700' },
  { key: 'successRows', label: 'Thành công', icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
  { key: 'skippedRows', label: 'Bỏ qua', icon: SkipForward, tone: 'bg-amber-50 text-amber-700' },
  { key: 'errorRows', label: 'Lỗi', icon: AlertCircle, tone: 'bg-red-50 text-red-700' },
]

export default function ImportSummary({ result, onViewErrors }) {
  if (!result) return null

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-900">Kết quả import</h2>
        {result.errorRows > 0 && <button type="button" className="flex h-8 items-center gap-1.5 rounded-md border border-red-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50" onClick={onViewErrors}><Eye size={15} /> Xem lỗi</button>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.map(({ key, label, icon: Icon, tone }) => (
          <article className={`rounded-md p-3 ${tone}`} key={key}>
            <span className="flex items-center gap-1.5 text-xs font-semibold"><Icon size={15} /> {label}</span>
            <strong className="mt-1 block text-xl text-slate-950">{formatImportNumber(result[key])}</strong>
          </article>
        ))}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
        <div className="flex justify-between rounded-md bg-slate-50 px-3 py-2"><dt>Thêm mới</dt><dd className="font-bold text-slate-900">{formatImportNumber(result.insertedRows || 0)}</dd></div>
        <div className="flex justify-between rounded-md bg-slate-50 px-3 py-2"><dt>Cập nhật</dt><dd className="font-bold text-slate-900">{formatImportNumber(result.updatedRows || 0)}</dd></div>
        <div className="flex justify-between rounded-md bg-slate-50 px-3 py-2"><dt>Chưa ánh xạ</dt><dd className="font-bold text-slate-900">{formatImportNumber(result.unmappedRows || 0)}</dd></div>
        <div className="flex justify-between rounded-md bg-slate-50 px-3 py-2"><dt>Sai lĩnh vực</dt><dd className="font-bold text-slate-900">{formatImportNumber(result.fieldMismatchRows || 0)}</dd></div>
      </dl>
    </section>
  )
}
