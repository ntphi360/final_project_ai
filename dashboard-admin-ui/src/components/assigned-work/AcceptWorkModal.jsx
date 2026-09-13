import { CheckCircle2, X } from 'lucide-react'

export default function AcceptWorkModal({ open, submitting = false, onCancel, onConfirm }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={onCancel}>
      <section className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="accept-work-title" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" aria-label="Đóng modal" className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100" onClick={onCancel}><X size={19} /></button>
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 size={25} /></span>
        <h2 id="accept-work-title" className="mt-3 text-center text-lg font-bold text-slate-900">Xác nhận nhận việc</h2>
        <p className="mt-3 text-center text-sm leading-6 text-slate-600">Bạn có chắc chắn muốn nhận công việc này?</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" disabled={submitting} className="h-10 rounded-md border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60" onClick={onCancel}>Hủy</button>
          <button type="button" disabled={submitting} className="h-10 rounded-md bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300" onClick={onConfirm}>{submitting ? 'Đang xử lý...' : 'Xác nhận nhận việc'}</button>
        </div>
      </section>
    </div>
  )
}
