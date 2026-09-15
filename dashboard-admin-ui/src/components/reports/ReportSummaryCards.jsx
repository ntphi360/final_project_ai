import {AlertTriangle, Check, CircleUserRound, Clock3, FileText, Hourglass} from 'lucide-react'
import {formatApiNumber} from '../../services/serviceUtils'

const icons = {
    total: FileText,
    processing: Clock3,
    completed: Check,
    risk: AlertTriangle,
    waiting: Hourglass,
    confirmed: CircleUserRound
}
const tones = {
    blue: 'bg-blue-100 text-blue-700', amber: 'bg-amber-100 text-amber-700', emerald: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700', violet: 'bg-violet-100 text-violet-700', cyan: 'bg-cyan-100 text-cyan-700',
}

export default function ReportSummaryCards({data}) {
    return (
        <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6" aria-label="Chỉ số báo cáo tổng quan">
            {data.map((item) => {
                const Icon = icons[item.id]
                const positive = (item.direction === 'up' && item.id !== 'risk' && item.id !== 'processing') || item.direction === 'down'
                return (
                    <article
                        className="flex min-h-28 items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                        key={item.id}>
                        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${tones[item.tone]}`}><Icon
                            size={21}/></span>
                        <div className="min-w-0"><span
                            className="block truncate text-xs font-medium text-slate-500">{item.label}</span><strong
                            className="mt-1 block text-xl text-slate-950">{formatApiNumber(item.value)}</strong>{item.change == null ?
                            <small className="mt-2 block truncate text-[10px] text-slate-400">Dữ liệu hiện
                                tại</small> : <><span
                                className={`mt-1 block text-xs font-semibold ${positive ? 'text-emerald-600' : 'text-red-500'}`}>{item.direction === 'up' ? '↑' : '↓'} {item.change}%</span><small
                                className="block truncate text-[10px] text-slate-400">so với kỳ trước</small></>}</div>
                    </article>
                )
            })}
        </section>
    )
}
