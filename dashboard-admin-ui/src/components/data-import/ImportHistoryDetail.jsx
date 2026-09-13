import { AlertCircle, CalendarClock, CheckCircle2, FileSpreadsheet, SkipForward, X } from 'lucide-react'
import { formatImportDate, formatImportNumber, importStatus } from '../../data/mockImports'

const rows = [
  { key: 'totalRows', label: 'Tổng số bản ghi', icon: FileSpreadsheet },
  { key: 'successRows', label: 'Thành công', icon: CheckCircle2 },
  { key: 'skippedRows', label: 'Bỏ qua', icon: SkipForward },
  { key: 'errorRows', label: 'Lỗi', icon: AlertCircle },
]

export default function ImportHistoryDetail({ item, onClose, onViewErrors }) {
  if (!item) return null
  const status = importStatus[item.status]

  return (
    <aside className="fixed inset-y-[70px] right-0 z-50 w-[min(440px,94vw)] overflow-y-auto border-l border-slate-200 bg-white shadow-2xl" aria-label={`Chi tiết import ${item.fileName}`}>
      <header className="sticky top-0 flex h-12 items-center justify-between border-b border-slate-200 bg-white px-4">
        <h2 className="text-base font-bold text-slate-900">Chi tiết import</h2>
        <button type="button" aria-label="Đóng chi tiết import" className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100" onClick={onClose}><X size={19} /></button>
      </header>
      <div className="space-y-4 p-4">
        <section className="rounded-lg bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-600"><FileSpreadsheet size={21} /></span>
            <div className="min-w-0 flex-1"><strong className="block break-words text-sm text-slate-900">{item.fileName}</strong><span className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><CalendarClock size={14} /> {formatImportDate(item.importedAt)}</span></div>
            <span className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
          </div>
        </section>
        <section className="overflow-hidden rounded-lg border border-slate-200">
          <h3 className="border-b border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-800">Kết quả xử lý</h3>
          <dl className="divide-y divide-slate-100 px-3">
            {rows.map(({ key, label, icon: Icon }) => (
              <div className="flex items-center justify-between gap-3 py-3 text-sm" key={key}>
                <dt className="flex items-center gap-2 text-slate-500"><Icon size={16} /> {label}</dt>
                <dd className="font-bold tabular-nums text-slate-900">{formatImportNumber(item[key])}</dd>
              </div>
            ))}
          </dl>
        </section>
        {item.errorRows > 0 && <button type="button" className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 text-sm font-semibold text-red-700 hover:bg-red-100" onClick={() => onViewErrors(item.errors)}><AlertCircle size={17} /> Xem lỗi</button>}
      </div>
    </aside>
  )
}
