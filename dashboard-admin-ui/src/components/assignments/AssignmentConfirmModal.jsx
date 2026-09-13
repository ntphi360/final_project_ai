import { Send, X } from 'lucide-react'

export default function AssignmentConfirmModal({ open, count, officer, channels, onCancel, onConfirm }) {
  if (!open || !officer) return null

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={onCancel}>
      <section className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="assignment-confirm-title" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" aria-label="Đóng modal" className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100" onClick={onCancel}>
          <X size={19} />
        </button>
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-blue-50 text-blue-600"><Send size={23} /></span>
        <h2 id="assignment-confirm-title" className="mt-3 text-center text-lg font-bold text-slate-900">Xác nhận giao việc</h2>
        <p className="mt-3 text-center text-sm leading-6 text-slate-600">Bạn sắp giao <strong className="text-slate-900">{count} hồ sơ</strong> cho:</p>
        <div className="mt-2 rounded-lg bg-slate-50 p-3 text-center">
          <strong className="block text-sm text-slate-900">{officer.name}</strong>
          <span className="mt-1 block text-xs text-slate-500">{officer.department}</span>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between rounded-md bg-slate-50 px-3 py-2"><dt>Email</dt><dd className="font-semibold text-blue-700">{channels.email ? 'Có' : 'Không'}</dd></div>
          <div className="flex justify-between rounded-md bg-slate-50 px-3 py-2"><dt>SMS</dt><dd className="font-semibold text-blue-700">{channels.sms ? 'Có' : 'Không'}</dd></div>
        </dl>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" className="h-10 rounded-md border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition hover:bg-slate-50" onClick={onCancel}>Hủy</button>
          <button type="button" className="h-10 rounded-md bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700" onClick={onConfirm}>Xác nhận giao việc</button>
        </div>
      </section>
    </div>
  )
}
