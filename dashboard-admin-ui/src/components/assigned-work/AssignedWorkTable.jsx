import {ChevronLeft, ChevronRight, Eye} from 'lucide-react'

export const assignmentStatus = {
    PENDING: {label: 'Chờ nhận', className: 'bg-amber-50 text-amber-700'},
    ACCEPTED: {label: 'Đã nhận', className: 'bg-emerald-50 text-emerald-700'},
    REJECTED: {label: 'Từ chối', className: 'bg-red-50 text-red-700'},
}

export function formatAssignmentDate(value) {
    if (!value) return '—'
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value))
}

function visiblePages(page, totalPages) {
    if (totalPages <= 5) return Array.from({length: totalPages}, (_, index) => index + 1)
    const start = Math.min(Math.max(page - 2, 1), totalPages - 4)
    return Array.from({length: 5}, (_, index) => start + index)
}

export default function AssignedWorkTable({
                                              assignments,
                                              totalCount,
                                              page,
                                              pageSize,
                                              onView,
                                              onPageChange,
                                              onPageSizeChange
                                          }) {
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
    const firstItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
    const lastItem = Math.min(page * pageSize, totalCount)

    return (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="w-full overflow-x-auto">
                <table className="min-w-[1080px] table-fixed border-collapse text-sm text-slate-700">
                    <thead className="bg-slate-50">
                    <tr>
                        <th className="h-10 w-14 border-b border-slate-200 px-3 text-center normal-case">STT</th>
                        <th className="h-10 w-24 border-b border-slate-200 px-3 normal-case">Mã hồ sơ</th>
                        <th className="h-10 w-64 border-b border-slate-200 px-3 normal-case">Tên thủ tục</th>
                        <th className="h-10 w-36 border-b border-slate-200 px-3 normal-case">Người giao</th>
                        <th className="h-10 w-40 border-b border-slate-200 px-3 normal-case">Thời gian giao</th>
                        <th className="h-10 w-28 border-b border-slate-200 px-3 normal-case">Trạng thái</th>
                        <th className="h-10 w-40 border-b border-slate-200 px-3 normal-case">Thời gian phản hồi</th>
                        <th className="h-10 w-24 border-b border-slate-200 px-3 text-center normal-case">Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    {assignments.map((item, index) => {
                        const status = assignmentStatus[item.status]
                        const responseAt = item.status === 'ACCEPTED' ? item.acceptedAt : item.status === 'REJECTED' ? item.rejectedAt : null
                        return (
                            <tr className="cursor-pointer bg-white transition hover:bg-slate-50" key={item.id}
                                onClick={() => onView(item.id)}>
                                <td className="h-12 border-b border-slate-100 px-3 text-center">{(page - 1) * pageSize + index + 1}</td>
                                <td className="h-12 border-b border-slate-100 px-3 font-semibold text-blue-700">{item.caseCode}</td>
                                <td className="h-12 border-b border-slate-100 px-3"><span className="block truncate"
                                                                                          title={item.procedureName}>{item.procedureName}</span>
                                </td>
                                <td className="h-12 border-b border-slate-100 px-3"><span
                                    className="block truncate">{item.assignerName}</span></td>
                                <td className="h-12 border-b border-slate-100 px-3 tabular-nums">{formatAssignmentDate(item.assignedAt)}</td>
                                <td className="h-12 border-b border-slate-100 px-3"><span
                                    className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
                                </td>
                                <td className="h-12 border-b border-slate-100 px-3 tabular-nums">{formatAssignmentDate(responseAt)}</td>
                                <td className="h-12 border-b border-slate-100 px-3 text-center">
                                    <button
                                        type="button"
                                        className="mx-auto flex h-8 w-20 items-center justify-center gap-1.5 rounded-md border border-blue-500 bg-white text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            onView(item.id)
                                        }}
                                    >
                                        <Eye size={15}/> Xem
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                    {assignments.length === 0 && <tr>
                        <td className="h-24 text-center text-sm text-slate-500" colSpan="8">Không tìm thấy công việc phù
                            hợp.
                        </td>
                    </tr>}
                    </tbody>
                </table>
            </div>
            <footer
                className="flex min-h-14 flex-col gap-3 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                <span>Hiển thị {firstItem} - {lastItem} của {totalCount} công việc</span>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1">
                        <button type="button" disabled={page === 1} aria-label="Trang trước"
                                className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                                onClick={() => onPageChange(page - 1)}><ChevronLeft size={17}/></button>
                        {visiblePages(page, totalPages).map((pageNumber) => (
                            <button type="button"
                                    className={`grid h-9 w-9 place-items-center rounded-md border text-sm ${pageNumber === page ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                                    onClick={() => onPageChange(pageNumber)} key={pageNumber}>{pageNumber}</button>
                        ))}
                        <button type="button" disabled={page === totalPages} aria-label="Trang sau"
                                className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                                onClick={() => onPageChange(page + 1)}><ChevronRight size={17}/></button>
                    </div>
                    <select value={pageSize} aria-label="Số công việc mỗi trang"
                            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                            onChange={(event) => onPageSizeChange(Number(event.target.value))}>
                        {[10, 20, 50].map((size) => <option value={size} key={size}>{size} / trang</option>)}
                    </select>
                </div>
            </footer>
        </section>
    )
}
