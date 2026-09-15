import {Building2, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail} from 'lucide-react'
import {useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Navigate, useLocation, useNavigate} from 'react-router-dom'
import {clearAuthError, login} from '../features/auth/authSlice'

export default function Login() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const {isAuthenticated, loading, error} = useSelector((state) => state.auth)
    const [form, setForm] = useState({email: '', password: ''})
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => () => {
        dispatch(clearAuthError())
    }, [dispatch])
    if (isAuthenticated) return <Navigate to="/dashboard" replace/>

    const submit = async (event) => {
        event.preventDefault()
        try {
            await dispatch(login({email: form.email.trim(), password: form.password})).unwrap()
            navigate(location.state?.from?.pathname || '/dashboard', {replace: true})
        } catch { /* error is rendered from Redux */
        }
    }

    return (
        <main
            className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_48%,#eef2ff_100%)] p-4">
            <section
                className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <header className="bg-gradient-to-br from-slate-950 to-blue-900 px-7 py-7 text-white">
                    <span className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-white/10"><Building2
                        size={28}/></span>
                    <h1 className="text-2xl font-bold">Đăng nhập hệ thống</h1>
                    <p className="mt-1 text-sm text-blue-100">Giám sát và quản lý hồ sơ hành chính</p>
                </header>
                <form className="space-y-4 p-7" onSubmit={submit}>
                    {error &&
                        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}
                    <label className="block"><span
                        className="mb-1.5 block text-sm font-semibold text-slate-700">Email</span><span
                        className="relative block"><Mail size={17}
                                                         className="absolute left-3 top-3 text-slate-400"/><input
                        required type="email" autoComplete="email" value={form.email}
                        className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        onChange={(event) => setForm((current) => ({
                            ...current,
                            email: event.target.value
                        }))}/></span></label>
                    <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Mật khẩu</span><span
                        className="relative block"><LockKeyhole size={17}
                                                                className="absolute left-3 top-3 text-slate-400"/><input
                        required type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                        value={form.password}
                        className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-11 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        onChange={(event) => setForm((current) => ({...current, password: event.target.value}))}/><button
                        type="button"
                        className="absolute right-2 top-1.5 grid h-8 w-8 place-items-center text-slate-400"
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18}/> :
                        <Eye size={18}/>}</button></span></label>
                    <button disabled={loading}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-slate-400"
                            type="submit">{loading && <LoaderCircle size={18} className="animate-spin"/>} Đăng nhập
                    </button>
                </form>
            </section>
        </main>
    )
}
