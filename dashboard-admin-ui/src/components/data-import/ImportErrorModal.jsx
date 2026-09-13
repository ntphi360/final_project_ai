import { AlertTriangle, X } from 'lucide-react'

export default function ImportErrorModal({ open, errors, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="import-errors-title">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 id="import-errors-title" className="flex items-center gap-2 text-base font-bold text-slate-900"><AlertTriangle size={19} className="text-red-500" /> Danh sách lỗi</h2>
          <button type="button" aria-label="Đóng danh sách lỗi" className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100" onClick={onClose}><X size={18} /></button>
        </header>
        <div className="max-h-[55vh] overflow-y-auto p-5">
          <table className="w-full border-collapse text-sm text-slate-700">
            <thead className="bg-slate-50"><tr><th className="h-10 w-20 border border-slate-200 px-3 text-center normal-case">Dòng</th><th className="h-10 border border-slate-200 px-3 normal-case">Lỗi</th></tr></thead>
            <tbody>{errors.map((error, index) => <tr key={`${error.row}-${index}`}><td className="h-11 border border-slate-200 px-3 text-center font-semibold text-red-600">{error.row}</td><td className="h-11 border border-slate-200 px-3">{error.message}</td></tr>)}</tbody>
          </table>
        </div>
        <footer className="flex justify-end border-t border-slate-200 px-5 py-3"><button type="button" className="h-9 rounded-md bg-slate-800 px-5 text-sm font-semibold text-white hover:bg-slate-900" onClick={onClose}>Đóng</button></footer>
      </section>
    </div>
  )
}
