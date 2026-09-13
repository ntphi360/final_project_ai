import { Mail, RotateCcw, Send, Smartphone, UserRound } from 'lucide-react'

export default function AssignmentForm({ form, officers, selectedCount, canSubmit, submitting = false, onChange, onReset, onSubmit }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Nội dung giao việc</h2>
          <p className="mt-1 text-sm text-slate-500">Thiết lập người nhận và nội dung cho {selectedCount} hồ sơ đã chọn.</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">Đã chọn {selectedCount} hồ sơ</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-slate-700">Phương thức thông báo</legend>
          <div className="flex h-10 items-center gap-6 rounded-md border border-slate-200 px-3">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.email} className="h-4 w-4 rounded border-slate-300 accent-blue-600" onChange={() => onChange('email', !form.email)} />
              <Mail size={16} className="text-blue-600" /> Email
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.sms} className="h-4 w-4 rounded border-slate-300 accent-blue-600" onChange={() => onChange('sms', !form.sms)} />
              <Smartphone size={16} className="text-blue-600" /> SMS
            </label>
          </div>
        </fieldset>

        <label>
          <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><UserRound size={16} /> Cán bộ xử lý</span>
          <select value={form.officerId} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" onChange={(event) => onChange('officerId', event.target.value)}>
            <option value="">Chọn cán bộ xử lý</option>
            {officers.map((officer) => <option value={officer.id} key={officer.id}>{officer.name} - {officer.department}</option>)}
          </select>
        </label>

        <label className="lg:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Tiêu đề giao việc</span>
          <input
            type="text"
            maxLength={200}
            value={form.title}
            placeholder="Xử lý hồ sơ được phân công"
            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            onChange={(event) => onChange('title', event.target.value)}
          />
          <span className="mt-1 block text-right text-xs text-slate-400">{form.title.length}/200</span>
        </label>

        <label className="lg:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Nội dung</span>
          <textarea
            maxLength={1000}
            value={form.content}
            placeholder="Nhập nội dung giao việc..."
            className="min-h-32 w-full resize-y rounded-md border border-slate-200 p-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            onChange={(event) => onChange('content', event.target.value)}
          />
          <span className="mt-1 block text-right text-xs text-slate-400">{form.content.length}/1000</span>
        </label>
      </div>

      <div className="mt-4 flex justify-end gap-3 border-t border-slate-100 pt-4">
        <button type="button" className="flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50" onClick={onReset}>
          <RotateCcw size={16} /> Bỏ chọn
        </button>
        <button type="button" disabled={!canSubmit || submitting} className="flex h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300" onClick={onSubmit}>
          <Send size={17} /> {submitting ? 'Đang giao...' : 'Giao việc'}
        </button>
      </div>
    </section>
  )
}
