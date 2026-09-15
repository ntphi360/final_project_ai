import {XCircle, X} from 'lucide-react'

export default function RejectWorkModal({open, reason, submitting = false, onReasonChange, onCancel, onConfirm}) {
    if (!open) return null

    const canSubmit = Boolean(reason.trim())

    return (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
             role="presentation" onMouseDown={onCancel}>
            <section className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
                     role="dialog" aria-modal="true" aria-labelledby="reject-work-title"
                     onMouseDown={(event) => event.stopPropagation()}>
                <button type="button" aria-label="Đóng modal"
                        className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
                        onClick={onCancel}><X size={19}/></button>
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-600"><XCircle
                    size={25}/></span>
                <h2 id="reject-work-title" className="mt-3 text-center text-lg font-bold text-slate-900">Từ chối công
                    việc</h2>
                <label className="mt-5 block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Lý do từ chối</span>
                    <textarea autoFocus maxLength={500} value={reason} placeholder="Nhập lý do từ chối..."
                              className="min-h-32 w-full resize-y rounded-md border border-slate-200 p-3 text-sm leading-6 outline-none placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                              onChange={(event) => onReasonChange(event.target.value)}/>
                    <span className="mt-1 block text-right text-xs text-slate-400">{reason.length}/500</span>
                </label>
                <div className="mt-5 grid grid-cols-2 gap-3">
                    <button type="button" disabled={submitting}
                            className="h-10 rounded-md border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={onCancel}>Hủy
                    </button>
                    <button type="button" disabled={!canSubmit || submitting}
                            className="h-10 rounded-md bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                            onClick={onConfirm}>{submitting ? 'Đang xử lý...' : 'Xác nhận từ chối'}</button>
                </div>
            </section>
        </div>
    )
}
