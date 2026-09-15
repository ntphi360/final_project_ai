import {Eye, EyeOff, KeyRound} from 'lucide-react'
import {useEffect, useState} from 'react'

export default function ResetPasswordModal({user, loading, error, onCancel, onConfirm}) {
    const [password, setPassword] = useState('')
    const [show, setShow] = useState(false)
    useEffect(() => {
        if (user) {
            setPassword('');
            setShow(false)
        }
    }, [user])
    if (!user) return null

    return (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/40 p-4" role="presentation">
            <section className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl" role="dialog" aria-modal="true"
                     aria-labelledby="reset-password-title">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-100 text-blue-700"><KeyRound
                    size={23}/></span>
                <h2 id="reset-password-title" className="mt-4 text-lg font-bold text-slate-950">Đặt lại mật khẩu</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Đặt mật khẩu mới cho tài khoản <strong
                    className="text-slate-900">{user.fullName}</strong>.</p>
                <label className="mt-4 block"><span className="mb-1 block text-sm font-medium text-slate-700">Mật khẩu mới</span><span
                    className="relative block"><input autoFocus type={show ? 'text' : 'password'} value={password}
                                                      className="h-10 w-full rounded-md border border-slate-200 px-3 pr-10 text-sm outline-none focus:border-blue-500"
                                                      onChange={(event) => setPassword(event.target.value)}/><button
                    type="button" className="absolute right-1 top-1 grid h-8 w-8 place-items-center text-slate-400"
                    onClick={() => setShow((value) => !value)}>{show ? <EyeOff size={17}/> : <Eye size={17}/>}</button></span><span
                    className="mt-1 block text-xs text-slate-500">Tối thiểu 8 ký tự.</span></label>
                {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                <div className="mt-5 flex justify-end gap-2">
                    <button type="button" disabled={loading}
                            className="h-10 rounded-md border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                            onClick={onCancel}>Hủy
                    </button>
                    <button type="button" disabled={loading || password.length < 8}
                            className="h-10 rounded-md bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-400"
                            onClick={() => onConfirm(password)}>{loading ? 'Đang lưu...' : 'Đặt lại mật khẩu'}</button>
                </div>
            </section>
        </div>
    )
}
