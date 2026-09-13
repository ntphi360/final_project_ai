import { ClipboardList, Clock3, CircleCheck, XCircle } from 'lucide-react'

const cards = [
  { status: 'ALL', label: 'Tổng giao việc', icon: ClipboardList, tone: 'border-blue-100 bg-blue-50 text-blue-700', iconTone: 'bg-blue-100' },
  { status: 'PENDING', label: 'Chờ nhận', icon: Clock3, tone: 'border-amber-100 bg-amber-50 text-amber-700', iconTone: 'bg-amber-100' },
  { status: 'ACCEPTED', label: 'Đã nhận', icon: CircleCheck, tone: 'border-emerald-100 bg-emerald-50 text-emerald-700', iconTone: 'bg-emerald-100' },
  { status: 'REJECTED', label: 'Từ chối', icon: XCircle, tone: 'border-red-100 bg-red-50 text-red-700', iconTone: 'bg-red-100' },
]

export default function AssignmentTrackingSummary({ assignments }) {
  return (
    <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Tổng quan theo dõi giao việc">
      {cards.map(({ status, label, icon: Icon, tone, iconTone }) => {
        const count = status === 'ALL' ? assignments.length : assignments.filter((item) => item.status === status).length
        return (
          <article className={`flex min-h-24 items-center gap-4 rounded-lg border p-4 shadow-sm ${tone}`} key={status}>
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${iconTone}`}><Icon size={23} /></span>
            <div className="min-w-0"><span className="block truncate text-sm font-semibold">{label}</span><strong className="mt-1 block text-2xl font-bold text-slate-950">{count}</strong></div>
          </article>
        )
      })}
    </section>
  )
}
