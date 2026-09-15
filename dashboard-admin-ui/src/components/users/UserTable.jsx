import {ChevronLeft, ChevronRight, Eye} from 'lucide-react'
import {formatUserDate, getInitials, roleLabels} from '../../utils/user'

const roleClasses = {
    ADMIN: 'bg-violet-50 text-violet-700',
    SUPERVISOR: 'bg-blue-50 text-blue-700',
    OFFICER: 'bg-cyan-50 text-cyan-700',
    VIEWER: 'bg-slate-100 text-slate-600'
}

function visiblePages(page, totalPages) {
    if (totalPages <= 5) return Array.from({length: totalPages}, (_, index) => index + 1)
    const start = Math.min(Math.max(page - 2, 1), totalPages - 4)
    return Array.from({length: 5}, (_, index) => start + index)
}

export default function UserTable({users, totalCount, page, pageSize, onPageChange, onPageSizeChange, onView}) {
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
    const firstItem = totalCount ? (page - 1) * pageSize + 1 : 0
    const lastItem = Math.min(page * pageSize, totalCount)

    return (
        <section className="min-w-0 max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="w-full max-w-full overflow-x-auto">
                <table className="min-w-[1120px] w-full table-fixed border-collapse text-sm text-slate-700">
                    <thead className="bg-slate-50">
                    <tr>
                        <th className="h-10 w-12 border-b border-slate-200 px-2 text-center normal-case">STT</th>
                        <th className="w-40 border-b border-slate-200 px-2 normal-case">Họ tên</th>
                        <th className="w-48 border-b border-slate-200 px-2 normal-case">Email</th>
                        <th className="w-28 border-b border-slate-200 px-2 normal-case">Số điện thoại</th>
                        <th className="w-32 border-b border-slate-200 px-2 normal-case">Vai trò</th>
                        <th className="w-52 border-b border-slate-200 px-2 normal-case">Phòng ban</th>
                        <th className="w-24 border-b border-slate-200 px-2 normal-case">Trạng thái</th>
                        <th className="w-24 border-b border-slate-200 px-2 normal-case">Ngày tạo</th>
                        <th className="w-20 border-b border-slate-200 px-2 text-center normal-case">Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>{users.map((user, index) => <tr className="cursor-pointer transition hover:bg-slate-50"
                                                           key={user.id} onClick={() => onView(user)}>
                        <td className="h-14 border-b border-slate-100 px-3 text-center">{(page - 1) * pageSize + index + 1}</td>
                        <td className="border-b border-slate-100 px-3"><span className="flex items-center gap-2.5"><span
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{getInitials(user.fullName)}</span><span
                            className="truncate font-semibold text-slate-900">{user.fullName}</span></span></td>
                        <td className="border-b border-slate-100 px-3"><span className="block truncate"
                                                                             title={user.email}>{user.email}</span></td>
                        <td className="border-b border-slate-100 px-3 tabular-nums">{user.phoneNumber}</td>
                        <td className="border-b border-slate-100 px-3"><span
                            className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${roleClasses[user.role]}`}>{roleLabels[user.role]}</span>
                        </td>
                        <td className="border-b border-slate-100 px-3"><span className="block truncate"
                                                                             title={user.departmentName || 'Không áp dụng'}>{user.departmentName || '—'}</span>
                        </td>
                        <td className="border-b border-slate-100 px-3"><span
                            className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{user.isActive ? 'Hoạt động' : 'Đã khóa'}</span>
                        </td>
                        <td className="border-b border-slate-100 px-3 tabular-nums">{formatUserDate(user.createdAt)}</td>
                        <td className="border-b border-slate-100 px-3 text-center">
                            <button type="button"
                                    className="mx-auto flex h-8 w-20 items-center justify-center gap-1.5 rounded-md border border-blue-500 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onView(user)
                                    }}><Eye size={15}/> Xem
                            </button>
                        </td>
                    </tr>)}</tbody>
                </table>
            </div>
            <footer
                className="flex min-h-14 flex-col gap-3 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                <span>Hiển thị {firstItem} - {lastItem} của {totalCount} người dùng</span>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1">
                        <button type="button" disabled={page === 1} aria-label="Trang trước"
                                className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                                onClick={() => onPageChange(page - 1)}><ChevronLeft size={17}/></button>
                        {visiblePages(page, totalPages).map((number) => <button type="button"
                                                                                className={`grid h-9 w-9 place-items-center rounded-md border ${number === page ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 hover:bg-slate-50'}`}
                                                                                onClick={() => onPageChange(number)}
                                                                                key={number}>{number}</button>)}
                        <button type="button" disabled={page === totalPages} aria-label="Trang sau"
                                className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                                onClick={() => onPageChange(page + 1)}><ChevronRight size={17}/></button>
                    </div>
                    <select value={pageSize} aria-label="Số người dùng mỗi trang"
                            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
                            onChange={(event) => onPageSizeChange(Number(event.target.value))}>{[10, 20, 50].map((size) =>
                        <option value={size} key={size}>{size} / trang</option>)}</select></div>
            </footer>
        </section>
    )
}
