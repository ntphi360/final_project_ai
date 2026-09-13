import { Eye, EyeOff, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { roleOptions } from '../../utils/user'

const emptyForm = { fullName: '', email: '', phoneNumber: '', role: 'OFFICER', officerId: '', password: '', isActive: true }

function FieldError({ message }) {
  return message ? <span className="mt-1 block text-xs text-red-600">{message}</span> : null
}

export default function UserFormModal({ open, mode, user, users, officers, saving, apiError, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(mode === 'edit' ? { ...user, phoneNumber: user.phoneNumber || '', officerId: user.officerId || '', password: '' } : emptyForm)
    setErrors({})
    setShowPassword(false)
  }, [mode, open, user])

  if (!open) return null

  const change = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  const submit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    const email = form.email.trim().toLowerCase()
    if (!form.fullName.trim()) nextErrors.fullName = 'Vui lòng nhập họ và tên.'
    if (!email) nextErrors.email = 'Vui lòng nhập email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Email không đúng định dạng.'
    else if (users.some((item) => item.email.toLowerCase() === email && item.id !== user?.id)) nextErrors.email = 'Email đã tồn tại trong hệ thống.'
    if (form.phoneNumber && !/^0\d{9}$/.test(form.phoneNumber)) nextErrors.phoneNumber = 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.'
    if (!form.role) nextErrors.role = 'Vui lòng chọn vai trò.'
    if (['SUPERVISOR', 'OFFICER'].includes(form.role) && !form.officerId) nextErrors.officerId = 'Vai trò này bắt buộc liên kết cán bộ.'
    if (mode === 'add' && form.password.length < 8) nextErrors.password = 'Mật khẩu tạm thời phải có ít nhất 8 ký tự.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    onSave({ ...form, fullName: form.fullName.trim(), email, officerId: form.officerId || null })
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="user-form-title">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 id="user-form-title" className="text-lg font-bold text-slate-950">{mode === 'add' ? 'Thêm người dùng' : 'Chỉnh sửa người dùng'}</h2><p className="mt-1 text-xs text-slate-500">{mode === 'add' ? 'Tạo tài khoản mới cho người dùng nội bộ.' : 'Cập nhật thông tin và quyền truy cập.'}</p></div><button type="button" aria-label="Đóng form người dùng" className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100" onClick={onClose}><X size={19} /></button></header>
        <form onSubmit={submit}>
          <div className="grid max-h-[70vh] gap-4 overflow-y-auto p-5 sm:grid-cols-2">
            <label><span className="mb-1 block text-sm font-medium text-slate-700">Họ và tên <b className="text-red-500">*</b></span><input value={form.fullName} className={`h-10 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${errors.fullName ? 'border-red-400' : 'border-slate-200 focus:border-blue-500'}`} onChange={(event) => change('fullName', event.target.value)} /><FieldError message={errors.fullName} /></label>
            <label><span className="mb-1 block text-sm font-medium text-slate-700">Email <b className="text-red-500">*</b></span><input type="email" value={form.email} className={`h-10 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${errors.email ? 'border-red-400' : 'border-slate-200 focus:border-blue-500'}`} onChange={(event) => change('email', event.target.value)} /><FieldError message={errors.email} /></label>
            <label><span className="mb-1 block text-sm font-medium text-slate-700">Số điện thoại</span><input value={form.phoneNumber} inputMode="numeric" className={`h-10 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${errors.phoneNumber ? 'border-red-400' : 'border-slate-200 focus:border-blue-500'}`} onChange={(event) => change('phoneNumber', event.target.value)} /><FieldError message={errors.phoneNumber} /></label>
            <label><span className="mb-1 block text-sm font-medium text-slate-700">Vai trò <b className="text-red-500">*</b></span><select value={form.role} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" onChange={(event) => change('role', event.target.value)}>{roleOptions.map((role) => <option value={role.value} key={role.value}>{role.label}</option>)}</select><FieldError message={errors.role} /></label>
            <label><span className="mb-1 block text-sm font-medium text-slate-700">Cán bộ liên kết {['SUPERVISOR', 'OFFICER'].includes(form.role) && <b className="text-red-500">*</b>}</span><select value={form.officerId} className={`h-10 w-full rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${errors.officerId ? 'border-red-400' : 'border-slate-200 focus:border-blue-500'}`} onChange={(event) => change('officerId', event.target.value)}><option value="">Không áp dụng</option>{officers.map((officer) => <option value={officer.id} key={officer.id}>{officer.name}</option>)}</select><FieldError message={errors.officerId} /></label>
            {mode === 'add' && <label className="sm:col-span-2"><span className="mb-1 block text-sm font-medium text-slate-700">Mật khẩu tạm thời <b className="text-red-500">*</b></span><span className="relative block"><input type={showPassword ? 'text' : 'password'} value={form.password} className={`h-10 w-full rounded-md border px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${errors.password ? 'border-red-400' : 'border-slate-200 focus:border-blue-500'}`} onChange={(event) => change('password', event.target.value)} /><button type="button" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} className="absolute right-2 top-1 grid h-8 w-8 place-items-center text-slate-400" onClick={() => setShowPassword((show) => !show)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span><FieldError message={errors.password} /></label>}
          </div>
          {apiError && <p className="mx-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{apiError}</p>}
          <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4"><button type="button" disabled={saving} className="h-10 rounded-md border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50" onClick={onClose}>Hủy</button><button type="submit" disabled={saving} className="h-10 rounded-md bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-400">{saving ? 'Đang lưu...' : mode === 'add' ? 'Thêm người dùng' : 'Lưu thay đổi'}</button></footer>
        </form>
      </section>
    </div>
  )
}
