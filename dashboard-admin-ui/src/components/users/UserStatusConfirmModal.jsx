import { AlertTriangle, LockKeyhole, UnlockKeyhole } from 'lucide-react'

export default function UserStatusConfirmModal({ user, onCancel, onConfirm }) {
  if (!user) return null
  const locking = user.isActive

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/40 p-4" role="presentation">
      <section className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="status-confirm-title">
        <span className={`grid h-12 w-12 place-items-center rounded-full ${locking ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>{locking ? <LockKeyhole size={23} /> : <UnlockKeyhole size={23} />}</span>
        <h2 id="status-confirm-title" className="mt-4 text-lg font-bold text-slate-950">{locking ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Bạn có chắc chắn muốn {locking ? 'khóa' : 'mở khóa'} tài khoản <strong className="text-slate-900">{user.fullName}</strong>?</p>
        {locking && <p className="mt-3 flex gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-700"><AlertTriangle size={16} className="mt-0.5 shrink-0" /> Người dùng sẽ không thể truy cập hệ thống sau khi bị khóa.</p>}
        <div className="mt-5 flex justify-end gap-2"><button type="button" className="h-10 rounded-md border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50" onClick={onCancel}>Hủy</button><button type="button" className={`h-10 rounded-md px-5 text-sm font-semibold text-white ${locking ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`} onClick={onConfirm}>Xác nhận</button></div>
      </section>
    </div>
  )
}
