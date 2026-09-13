import { ShieldCheck, UserCheck, UserCog, Users } from 'lucide-react'

const cards = [
  { id: 'total', label: 'Tổng người dùng', icon: Users, tone: 'bg-blue-100 text-blue-700' },
  { id: 'active', label: 'Đang hoạt động', icon: UserCheck, tone: 'bg-emerald-100 text-emerald-700' },
  { id: 'locked', label: 'Đã khóa', icon: ShieldCheck, tone: 'bg-red-100 text-red-700' },
  { id: 'officers', label: 'Cán bộ xử lý', icon: UserCog, tone: 'bg-violet-100 text-violet-700' },
]

export default function UserSummaryCards({ users }) {
  const counts = {
    total: users.length,
    active: users.filter((item) => item.isActive).length,
    locked: users.filter((item) => !item.isActive).length,
    officers: users.filter((item) => item.role === 'OFFICER').length,
  }

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Tổng quan người dùng">
      {cards.map(({ id, label, icon: Icon, tone }) => <article className="flex min-h-24 items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={id}><span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${tone}`}><Icon size={23} /></span><div><span className="text-sm font-medium text-slate-500">{label}</span><strong className="mt-1 block text-2xl text-slate-950">{counts[id]}</strong></div></article>)}
    </section>
  )
}
