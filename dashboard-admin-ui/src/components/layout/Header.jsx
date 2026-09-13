import { Bell, ChevronDown, LogOut, Menu } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toggleMobileSidebar } from '../../features/ui/uiSlice'
import Breadcrumb from './Breadcrumb'
import { logout } from '../../features/auth/authSlice'
import { getInitials, roleLabels } from '../../utils/user'

export default function Header({
  onNotificationClick,
  notificationCount = 0,
}) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  const openNotifications = () => {
    if (onNotificationClick) return onNotificationClick()
    if (user?.role === 'OFFICER') return navigate('/assigned-work')
    if (['ADMIN', 'SUPERVISOR'].includes(user?.role)) return navigate('/assignment-tracking')
    return undefined
  }

  return (
    <header className="top-header">
      <button
        type="button"
        className="icon-button menu-button"
        aria-label="Mở menu"
        onClick={() => dispatch(toggleMobileSidebar())}
      >
        <Menu size={23} />
      </button>

      <Breadcrumb />

      <div className="header-actions">
        <button type="button" className="notification-button" aria-label="Thông báo" onClick={openNotifications}>
          <Bell size={20} />
          {notificationCount > 0 && <span>{notificationCount}</span>}
        </button>
        <div className="header-avatar">{getInitials(user?.fullName)}</div>
        <div className="header-user">
          <strong>{user?.fullName}</strong>
          <span>{roleLabels[user?.role] || user?.role}</span>
        </div>
        <ChevronDown size={17} className="header-chevron" />
        <span className="header-divider" aria-hidden="true" />
        <button type="button" className="logout-button" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  )
}
