import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef } from 'react'

function formatDate(value) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function statusClass(status) {
  if (status === 'Đã xác nhận') return 'bg-emerald-50 text-emerald-700'
  if (status === 'Chờ xác nhận') return 'bg-amber-50 text-amber-700'
  return 'bg-blue-50 text-blue-700'
}

function visiblePages(page, totalPages) {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1)
  const start = Math.min(Math.max(page - 2, 1), totalPages - 4)
  return Array.from({ length: 5 }, (_, index) => start + index)
}

export default function AssignmentCaseTable({
  cases,
  totalCount,
  page,
  pageSize,
  selectedIds,
  onToggleCase,
  onTogglePage,
  onPageChange,
  onPageSizeChange,
}) {
  const headerCheckbox = useRef(null)
  const selectedOnPage = cases.filter((item) => selectedIds.includes(item.id)).length
  const allSelected = cases.length > 0 && selectedOnPage === cases.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const firstItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const lastItem = Math.min(page * pageSize, totalCount)

  useEffect(() => {
    if (headerCheckbox.current) {
      headerCheckbox.current.indeterminate = selectedOnPage > 0 && !allSelected
    }
  }, [allSelected, selectedOnPage])

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {selectedIds.length > 0 && (
        <div className="border-b border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700">
          Đã chọn {selectedIds.length} hồ sơ
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <table className="min-w-[1050px] table-fixed border-collapse text-sm text-slate-700">
          <thead className="bg-slate-50">
            <tr>
              <th className="h-10 w-12 border-b border-slate-200 px-3 text-center normal-case">
                <input
                  ref={headerCheckbox}
                  type="checkbox"
                  checked={allSelected}
                  aria-label="Chọn tất cả hồ sơ trên trang"
                  className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                  onChange={onTogglePage}
                />
              </th>
              <th className="h-10 w-24 border-b border-slate-200 px-3 normal-case">Mã hồ sơ</th>
              <th className="h-10 w-64 border-b border-slate-200 px-3 normal-case">Tên thủ tục</th>
              <th className="h-10 w-28 border-b border-slate-200 px-3 normal-case">Lĩnh vực</th>
              <th className="h-10 w-24 border-b border-slate-200 px-3 normal-case">Phòng ban</th>
              <th className="h-10 w-40 border-b border-slate-200 px-3 normal-case">Cán bộ hiện tại</th>
              <th className="h-10 w-28 border-b border-slate-200 px-3 normal-case">Hạn xử lý</th>
              <th className="h-10 w-32 border-b border-slate-200 px-3 normal-case">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((item) => (
              <tr className={`transition hover:bg-slate-50 ${selectedIds.includes(item.id) ? 'bg-blue-50/70' : 'bg-white'}`} key={item.id}>
                <td className="h-12 border-b border-slate-100 px-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    aria-label={`Chọn hồ sơ ${item.id}`}
                    className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                    onChange={() => onToggleCase(item.id)}
                  />
                </td>
                <td className="h-12 border-b border-slate-100 px-3 font-semibold text-blue-700">{item.caseCode}</td>
                <td className="h-12 border-b border-slate-100 px-3">
                  <span className="block truncate" title={item.procedure}>{item.procedure}</span>
                </td>
                <td className="h-12 border-b border-slate-100 px-3"><span className="block truncate">{item.field}</span></td>
                <td className="h-12 border-b border-slate-100 px-3"><span className="block truncate">{item.department}</span></td>
                <td className="h-12 border-b border-slate-100 px-3"><span className="block truncate">{item.officer}</span></td>
                <td className="h-12 border-b border-slate-100 px-3 tabular-nums">{formatDate(item.deadlineAt)}</td>
                <td className="h-12 border-b border-slate-100 px-3">
                  <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${statusClass(item.status)}`}>{item.status}</span>
                </td>
              </tr>
            ))}
            {cases.length === 0 && (
              <tr><td className="h-24 text-center text-sm text-slate-500" colSpan="8">Không tìm thấy hồ sơ phù hợp.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="flex min-h-14 flex-col gap-3 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <span>Hiển thị {firstItem} - {lastItem} của {totalCount} hồ sơ</span>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <button type="button" disabled={page === 1} aria-label="Trang trước" className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300" onClick={() => onPageChange(page - 1)}>
              <ChevronLeft size={17} />
            </button>
            {visiblePages(page, totalPages).map((pageNumber) => (
              <button
                type="button"
                className={`grid h-9 w-9 place-items-center rounded-md border text-sm ${pageNumber === page ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                onClick={() => onPageChange(pageNumber)}
                key={pageNumber}
              >
                {pageNumber}
              </button>
            ))}
            <button type="button" disabled={page === totalPages} aria-label="Trang sau" className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300" onClick={() => onPageChange(page + 1)}>
              <ChevronRight size={17} />
            </button>
          </div>
          <select value={pageSize} aria-label="Số hồ sơ mỗi trang" className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500" onChange={(event) => onPageSizeChange(Number(event.target.value))}>
            {[10, 20, 50].map((size) => <option value={size} key={size}>{size} / trang</option>)}
          </select>
        </div>
      </footer>
    </section>
  )
}
