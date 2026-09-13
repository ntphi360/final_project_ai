import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { formatImportDate, formatImportNumber, importStatus } from '../../data/mockImports'

export default function ImportHistoryTable({ items, page, pageSize, onPageChange, onView }) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const pageItems = items.slice((page - 1) * pageSize, page * pageSize)
  const firstItem = items.length ? (page - 1) * pageSize + 1 : 0
  const lastItem = Math.min(page * pageSize, items.length)

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-base font-bold text-slate-900">Lịch sử import</h2>
        <p className="mt-1 text-xs text-slate-500">Các lần tải và xử lý dữ liệu gần đây.</p>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-[720px] table-fixed border-collapse text-sm text-slate-700">
          <thead className="bg-slate-50">
            <tr>
              <th className="h-10 w-40 border-b border-slate-200 px-3 normal-case">Thời gian</th>
              <th className="h-10 w-64 border-b border-slate-200 px-3 normal-case">Tên file</th>
              <th className="h-10 w-28 border-b border-slate-200 px-3 text-right normal-case">Số bản ghi</th>
              <th className="h-10 w-28 border-b border-slate-200 px-3 normal-case">Trạng thái</th>
              <th className="h-10 w-24 border-b border-slate-200 px-3 text-center normal-case">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item) => {
              const status = importStatus[item.status]
              return (
                <tr className="transition hover:bg-slate-50" key={item.id}>
                  <td className="h-12 border-b border-slate-100 px-3 tabular-nums">{formatImportDate(item.importedAt)}</td>
                  <td className="h-12 border-b border-slate-100 px-3"><span className="block truncate font-medium text-slate-800" title={item.fileName}>{item.fileName}</span></td>
                  <td className="h-12 border-b border-slate-100 px-3 text-right tabular-nums">{formatImportNumber(item.totalRows)}</td>
                  <td className="h-12 border-b border-slate-100 px-3"><span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span></td>
                  <td className="h-12 border-b border-slate-100 px-3 text-center"><button type="button" className="mx-auto flex h-8 w-20 items-center justify-center gap-1.5 rounded-md border border-blue-500 text-xs font-semibold text-blue-700 transition hover:bg-blue-50" onClick={() => onView(item.id)}><Eye size={15} /> Xem</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <footer className="flex min-h-14 flex-col gap-3 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <span>Hiển thị {firstItem} - {lastItem} của {items.length} lần import</span>
        <div className="flex items-center gap-1">
          <button type="button" disabled={page === 1} aria-label="Trang trước" className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300" onClick={() => onPageChange(page - 1)}><ChevronLeft size={17} /></button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => <button type="button" className={`grid h-9 w-9 place-items-center rounded-md border text-sm ${pageNumber === page ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 hover:bg-slate-50'}`} onClick={() => onPageChange(pageNumber)} key={pageNumber}>{pageNumber}</button>)}
          <button type="button" disabled={page === totalPages} aria-label="Trang sau" className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300" onClick={() => onPageChange(page + 1)}><ChevronRight size={17} /></button>
          <span className="ml-2 h-9 rounded-md border border-slate-200 px-3 leading-9">10 / trang</span>
        </div>
      </footer>
    </section>
  )
}
