import { Bell, ChevronDown, LogOut, Menu } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toggleMobileSidebar } from '../../features/ui/uiSlice'
import Breadcrumb from './Breadcrumb'

const defaultUser = {
  initials: 'NV',
  name: 'Nguyễn Văn A',
  role: 'Quản trị viên',
}

export default function Header({
  onNotificationClick,
  notificationCount = 3,
  user = defaultUser,
}) {
  const dispatch = useDispatch()
  const navigate = useNavigate()

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
        <button type="button" className="notification-button" aria-label="Thông báo" onClick={onNotificationClick || (() => navigate('/assignment-tracking'))}>
          <Bell size={20} />
          {notificationCount > 0 && <span>{notificationCount}</span>}
        </button>
        <div className="header-avatar">{user.initials}</div>
        <div className="header-user">
          <strong>{user.name}</strong>
          <span>{user.role}</span>
        </div>
        <ChevronDown size={17} className="header-chevron" />
        <span className="header-divider" aria-hidden="true" />
        <button type="button" className="logout-button">
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  )
}
