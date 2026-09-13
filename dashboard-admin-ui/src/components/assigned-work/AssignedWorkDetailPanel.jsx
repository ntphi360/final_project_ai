import { Bell, BriefcaseBusiness, CalendarClock, Check, Eye, FileText, MapPin, UserRound, X } from 'lucide-react'
import { assignmentStatus, formatAssignmentDate } from './AssignedWorkTable'

function channelLabel(channels) {
  if (!channels.length) return 'Không gửi thông báo'
  return channels.join(' + ')
}

export default function AssignedWorkDetailPanel({ assignment, onClose, onAccept, onReject }) {
  if (!assignment) return null

  const status = assignmentStatus[assignment.status]

  return (
    <aside className="fixed inset-y-[70px] right-0 z-50 w-[min(430px,94vw)] overflow-y-auto border-l border-slate-200 bg-white shadow-2xl xl:sticky xl:top-[86px] xl:z-0 xl:h-[calc(100vh-102px)] xl:w-full xl:rounded-lg xl:border xl:shadow-sm" aria-label={`Chi tiết công việc ${assignment.caseCode}`}>
      <header className="sticky top-0 z-10 flex h-12 items-center justify-between border-b border-slate-200 bg-white px-4">
        <h2 className="text-base font-bold text-slate-900">Chi tiết công việc</h2>
        <button type="button" aria-label="Đóng panel" className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100" onClick={onClose}><X size={19} /></button>
      </header>

      <div className="space-y-3 p-4">
        <section className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-700"><FileText size={20} /></span>
          <div className="min-w-0 flex-1">
            <strong className="block text-sm text-slate-900">Mã hồ sơ: {assignment.caseCode}</strong>
            <span className="mt-1 block text-sm leading-5 text-slate-600">{assignment.procedureName}</span>
          </div>
          <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200">
          <h3 className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-800"><BriefcaseBusiness size={16} /> Thông tin công việc</h3>
          <dl className="divide-y divide-slate-100 px-3 text-sm">
            <div className="grid grid-cols-[120px_1fr] gap-3 py-2.5"><dt className="text-slate-500">Lĩnh vực</dt><dd className="min-w-0 font-medium text-slate-800">{assignment.fieldName}</dd></div>
            <div className="grid grid-cols-[120px_1fr] gap-3 py-2.5"><dt className="text-slate-500">Phòng ban</dt><dd className="min-w-0 font-medium text-slate-800">{assignment.departmentName}</dd></div>
            <div className="grid grid-cols-[120px_1fr] gap-3 py-2.5"><dt className="flex items-center gap-1.5 text-slate-500"><UserRound size={14} /> Người giao</dt><dd className="font-medium text-slate-800">{assignment.assignerName}</dd></div>
            <div className="grid grid-cols-[120px_1fr] gap-3 py-2.5"><dt className="flex items-center gap-1.5 text-slate-500"><CalendarClock size={14} /> Thời gian giao</dt><dd className="font-medium tabular-nums text-slate-800">{formatAssignmentDate(assignment.assignedAt)}</dd></div>
            <div className="grid grid-cols-[120px_1fr] gap-3 py-2.5"><dt className="flex items-center gap-1.5 text-slate-500"><Bell size={14} /> Kênh thông báo</dt><dd className="font-medium text-slate-800">{channelLabel(assignment.notificationChannels)}</dd></div>
          </dl>
        </section>

        <section className="rounded-lg border border-slate-200 p-3">
          <h3 className="text-sm font-bold text-slate-800">Tiêu đề giao việc</h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">{assignment.title}</p>
          <h3 className="mt-4 text-sm font-bold text-slate-800">Nội dung giao việc</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{assignment.content}</p>
        </section>

        {assignment.status === 'PENDING' && (
          <section className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 p-3">
            <button type="button" className="flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-semibold text-white transition hover:bg-emerald-700" onClick={onAccept}><Check size={17} /> Xác nhận nhận việc</button>
            <button type="button" className="flex h-10 items-center justify-center gap-2 rounded-md border border-red-300 bg-white px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50" onClick={onReject}><X size={17} /> Từ chối</button>
          </section>
        )}

        {assignment.status === 'ACCEPTED' && (
          <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <strong className="block text-sm text-emerald-800">Đã nhận công việc lúc:</strong>
            <span className="mt-1 block text-sm tabular-nums text-emerald-700">{formatAssignmentDate(assignment.acceptedAt)}</span>
            <button type="button" className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-md border border-emerald-300 bg-white text-sm font-semibold text-emerald-700 hover:bg-emerald-100"><Eye size={16} /> Xem hồ sơ</button>
          </section>
        )}

        {assignment.status === 'REJECTED' && (
          <section className="rounded-lg border border-red-200 bg-red-50 p-3">
            <strong className="block text-sm text-red-800">Lý do từ chối</strong>
            <p className="mt-2 text-sm leading-6 text-red-700">{assignment.rejectionReason}</p>
            <span className="mt-2 block text-xs tabular-nums text-red-500">Từ chối lúc {formatAssignmentDate(assignment.rejectedAt)}</span>
          </section>
        )}

        <section className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm leading-6 text-blue-800">
          Email/SMS chỉ dùng để thông báo. Việc xác nhận hoặc từ chối được thực hiện trong hệ thống.
        </section>
      </div>
    </aside>
  )
}
