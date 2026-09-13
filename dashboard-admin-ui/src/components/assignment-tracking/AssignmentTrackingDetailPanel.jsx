import {
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  FileText,
  RotateCcw,
  UserRound,
  X,
  XCircle,
} from 'lucide-react'
import { assignmentStatus, formatAssignmentDate } from '../assigned-work/AssignedWorkTable'

function DetailRow({ label, children }) {
  return (
    <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 py-2.5">
      <dt className="text-slate-500">{label}</dt>
      <dd className="min-w-0 font-medium text-slate-800">{children}</dd>
    </div>
  )
}

function ChannelBadges({ channels }) {
  if (!channels.length) return <span className="text-slate-500">Không gửi thông báo</span>

  return (
    <span className="flex flex-wrap gap-1.5">
      {channels.map((channel) => (
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700" key={channel}>{channel}</span>
      ))}
    </span>
  )
}

export default function AssignmentTrackingDetailPanel({ assignment, onClose, onReassign }) {
  if (!assignment) return null

  const status = assignmentStatus[assignment.status]

  return (
    <aside className="fixed inset-y-[70px] right-0 z-50 w-[min(460px,94vw)] overflow-y-auto border-l border-slate-200 bg-white shadow-2xl xl:sticky xl:top-[86px] xl:z-0 xl:h-[calc(100vh-102px)] xl:w-full xl:rounded-lg xl:border xl:shadow-sm" aria-label={`Chi tiết giao việc ${assignment.caseCode}`}>
      <header className="sticky top-0 z-10 flex h-12 items-center justify-between border-b border-slate-200 bg-white px-4">
        <h2 className="text-base font-bold text-slate-900">Chi tiết giao việc</h2>
        <button type="button" aria-label="Đóng panel" className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100" onClick={onClose}><X size={19} /></button>
      </header>

      <div className="space-y-3 p-4">
        <section className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-700"><FileText size={20} /></span>
          <div className="min-w-0 flex-1">
            <strong className="block text-sm text-slate-900">{assignment.caseCode}</strong>
            <span className="mt-1 block text-sm leading-5 text-slate-600">{assignment.procedureName}</span>
          </div>
          <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200">
          <h3 className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-800"><BriefcaseBusiness size={16} /> Thông tin giao việc</h3>
          <dl className="divide-y divide-slate-100 px-3 text-sm">
            <DetailRow label="Người giao"><span className="inline-flex items-center gap-1.5"><UserRound size={14} className="text-slate-400" />{assignment.assignerName}</span></DetailRow>
            <DetailRow label="Người nhận">{assignment.assigneeName}</DetailRow>
            <DetailRow label="Thời gian giao"><span className="inline-flex items-center gap-1.5 tabular-nums"><CalendarClock size={14} className="text-slate-400" />{formatAssignmentDate(assignment.assignedAt)}</span></DetailRow>
            <DetailRow label="Tiêu đề">{assignment.title}</DetailRow>
            <DetailRow label="Nội dung"><span className="whitespace-pre-wrap font-normal leading-6 text-slate-600">{assignment.content}</span></DetailRow>
            <DetailRow label="Kênh thông báo"><ChannelBadges channels={assignment.notificationChannels} /></DetailRow>
          </dl>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200">
          <h3 className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-800"><Bell size={16} /> Thông tin phản hồi</h3>
          <div className="p-3">
            {assignment.status === 'PENDING' && (
              <p className="rounded-md bg-amber-50 px-3 py-3 text-sm font-medium text-amber-700">Người nhận chưa phản hồi.</p>
            )}
            {assignment.status === 'ACCEPTED' && (
              <div className="rounded-md bg-emerald-50 px-3 py-3 text-emerald-700">
                <strong className="flex items-center gap-2 text-sm"><CheckCircle2 size={18} /> Đã xác nhận nhận việc</strong>
                <span className="mt-2 block text-sm tabular-nums">Thời gian nhận: {formatAssignmentDate(assignment.acceptedAt)}</span>
              </div>
            )}
            {assignment.status === 'REJECTED' && (
              <div className="space-y-3">
                <div className="rounded-md bg-red-50 px-3 py-3 text-red-700">
                  <strong className="flex items-center gap-2 text-sm"><XCircle size={18} /> Đã từ chối công việc</strong>
                  <span className="mt-2 block text-sm tabular-nums">Thời gian từ chối: {formatAssignmentDate(assignment.rejectedAt)}</span>
                  <p className="mt-2 text-sm leading-6"><span className="font-semibold">Lý do:</span> {assignment.rejectionReason || 'Không có lý do.'}</p>
                </div>
                <button type="button" className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-700" onClick={() => onReassign(assignment.caseCode)}><RotateCcw size={17} /> Giao lại</button>
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200">
          <h3 className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-800"><FileText size={16} /> Thông tin hồ sơ</h3>
          <dl className="divide-y divide-slate-100 px-3 text-sm">
            <DetailRow label="Mã hồ sơ">{assignment.caseCode}</DetailRow>
            <DetailRow label="Tên thủ tục">{assignment.procedureName}</DetailRow>
            <DetailRow label="Lĩnh vực">{assignment.fieldName}</DetailRow>
            <DetailRow label="Phòng ban">{assignment.departmentName}</DetailRow>
          </dl>
          <div className="p-3 pt-1">
            <button type="button" className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><ExternalLink size={16} /> Xem hồ sơ</button>
          </div>
        </section>
      </div>
    </aside>
  )
}
