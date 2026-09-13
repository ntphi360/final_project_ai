import { KeyRound } from 'lucide-react'

export default function ResetPasswordModal({ user, onCancel, onConfirm }) {
  if (!user) return null

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/40 p-4" role="presentation">
      <section className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="reset-password-title">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-100 text-blue-700"><KeyRound size={23} /></span>
        <h2 id="reset-password-title" className="mt-4 text-lg font-bold text-slate-950">Đặt lại mật khẩu</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Tạo mật khẩu tạm thời mới cho tài khoản <strong className="text-slate-900">{user.fullName}</strong>?</p>
        <p className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-700">Đây là thao tác mock frontend, chưa gửi email hoặc cập nhật backend.</p>
        <div className="mt-5 flex justify-end gap-2"><button type="button" className="h-10 rounded-md border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50" onClick={onCancel}>Hủy</button><button type="button" className="h-10 rounded-md bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700" onClick={onConfirm}>Tạo mật khẩu</button></div>
      </section>
    </div>
  )
}
