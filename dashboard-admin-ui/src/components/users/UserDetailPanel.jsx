import {KeyRound, LockKeyhole, Mail, Pencil, Phone, ShieldCheck, UnlockKeyhole, UserRound, X} from 'lucide-react'
import {formatUserDate, getInitials, roleLabels} from '../../utils/user'

function DetailRow({label, children}) {
    return <div className="grid grid-cols-[130px_minmax(0,1fr)] gap-3 py-2.5">
        <dt className="text-slate-500">{label}</dt>
        <dd className="min-w-0 break-words font-medium text-slate-800">{children}</dd>
    </div>
}

export default function UserDetailPanel({user, currentUserId, onClose, onEdit, onToggleStatus, onResetPassword}) {
    if (!user) return null
    const isCurrentUser = user.id === currentUserId

    return (
        <aside
            className="fixed inset-y-[70px] right-0 z-50 w-[min(440px,94vw)] overflow-y-auto border-l border-slate-200 bg-white shadow-2xl"
            aria-label={`Chi tiết người dùng ${user.fullName}`}>
            <header
                className="sticky top-0 z-10 flex h-12 items-center justify-between border-b border-slate-200 bg-white px-4">
                <h2 className="text-base font-bold text-slate-900">Chi tiết người dùng</h2>
                <button type="button" aria-label="Đóng chi tiết người dùng"
                        className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
                        onClick={onClose}><X size={19}/></button>
            </header>
            <div className="space-y-4 p-4">
                <section className="flex flex-col items-center rounded-lg bg-blue-50 p-5 text-center"><span
                    className="grid h-16 w-16 place-items-center rounded-full bg-blue-600 text-xl font-bold text-white">{getInitials(user.fullName)}</span>
                    <h3 className="mt-3 text-lg font-bold text-slate-950">{user.fullName}</h3><span
                        className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><Mail size={14}/> {user.email}</span><span
                        className={`mt-3 rounded-full px-3 py-1 text-xs font-semibold ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{user.isActive ? 'Hoạt động' : 'Đã khóa'}</span>
                </section>
                <section className="overflow-hidden rounded-lg border border-slate-200"><h3
                    className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-800">
                    <UserRound size={16}/> Thông tin tài khoản</h3>
                    <dl className="divide-y divide-slate-100 px-3 text-sm"><DetailRow
                        label="Họ và tên">{user.fullName}</DetailRow><DetailRow
                        label="Email">{user.email}</DetailRow><DetailRow label="Số điện thoại"><span
                        className="inline-flex items-center gap-1.5"><Phone size={14}
                                                                            className="text-slate-400"/> {user.phoneNumber}</span></DetailRow><DetailRow
                        label="Vai trò">{roleLabels[user.role]}</DetailRow><DetailRow
                        label="Phòng ban">{user.departmentName || 'Không áp dụng'}</DetailRow><DetailRow
                        label="Ngày tạo">{formatUserDate(user.createdAt, true)}</DetailRow><DetailRow
                        label="Cập nhật gần nhất">{formatUserDate(user.updatedAt, true)}</DetailRow></dl>
                </section>
                <section className="space-y-2 rounded-lg border border-slate-200 p-3">
                    <button type="button"
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
                            onClick={onEdit}><Pencil size={17}/> Chỉnh sửa
                    </button>
                    <button type="button" disabled={isCurrentUser && user.isActive}
                            title={isCurrentUser && user.isActive ? 'Bạn không thể khóa tài khoản đang đăng nhập.' : undefined}
                            className={`flex h-10 w-full items-center justify-center gap-2 rounded-md border text-sm font-semibold ${user.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'} disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400`}
                            onClick={onToggleStatus}>{user.isActive ? <><LockKeyhole size={17}/> Khóa tài khoản</> : <>
                        <UnlockKeyhole size={17}/> Mở khóa tài khoản</>}</button>
                    {isCurrentUser && user.isActive &&
                        <p className="text-center text-xs text-slate-500">Bạn không thể khóa tài khoản đang đăng
                            nhập.</p>}
                    <button type="button"
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            onClick={onResetPassword}><KeyRound size={17}/> Đặt lại mật khẩu
                    </button>
                </section>
                <div
                    className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-500">
                    <ShieldCheck size={17} className="mt-0.5 shrink-0 text-blue-600"/> Tài khoản bị khóa sẽ không thể
                    truy cập hệ thống cho đến khi được mở khóa.
                </div>
            </div>
        </aside>
    )
}
