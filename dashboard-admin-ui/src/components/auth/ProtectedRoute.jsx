import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function ProtectedRoute({ allowedRoles }) {
  const location = useLocation()
  const { initialized, isAuthenticated, user } = useSelector((state) => state.auth)

  if (!initialized) {
    return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">Đang xác thực phiên đăng nhập...</div>
  }
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
