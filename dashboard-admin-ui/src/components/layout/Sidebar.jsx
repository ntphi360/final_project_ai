import {
  BarChart3,
  Building2,
  ChevronDown,
  ClipboardList,
  FileText,
  House,
  Inbox,
  Import,
  PanelLeftClose,
  Send,
  Users,
  X,
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { closeMobileSidebar, toggleSidebar } from '../../features/ui/uiSlice'
import { getInitials, roleLabels } from '../../utils/user'

const menu = [
  { label: 'Tổng quan', icon: House, path: '/dashboard', roles: ['ADMIN', 'SUPERVISOR', 'OFFICER', 'VIEWER'] },
  { label: 'Hồ sơ đang xử lý', icon: FileText, path: '/cases/processing', roles: ['ADMIN', 'SUPERVISOR', 'OFFICER'] },
  { label: 'Giao việc', icon: Send, path: '/assignments', roles: ['ADMIN', 'SUPERVISOR'] },
  { label: 'Việc được giao', icon: Inbox, path: '/assigned-work', roles: ['OFFICER'] },
  { label: 'Theo dõi giao việc', icon: ClipboardList, path: '/assignment-tracking', roles: ['ADMIN', 'SUPERVISOR'] },
  { label: 'Import dữ liệu', icon: Import, path: '/data-import', roles: ['ADMIN', 'SUPERVISOR'] },
  { label: 'Báo cáo thống kê', icon: BarChart3, path: '/reports', roles: ['ADMIN', 'SUPERVISOR', 'OFFICER', 'VIEWER'] },
  { label: 'Người dùng', icon: Users, path: '/users', roles: ['ADMIN'] },
]

export default function Sidebar() {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()

  const { mobileSidebarOpen, sidebarCollapsed } = useSelector(
    (state) => state.ui,
  )
  const user = useSelector((state) => state.auth.user)
  const visibleMenu = menu.filter((item) => item.roles.includes(user?.role))

  const handleNavigate = (path) => {
    navigate(path)
    dispatch(closeMobileSidebar())
  }

  return (
    <>
      {mobileSidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Đóng menu"
          onClick={() => dispatch(closeMobileSidebar())}
        />
      )}

      <aside
        className={`sidebar ${mobileSidebarOpen ? 'is-open' : ''} ${
          sidebarCollapsed ? 'is-collapsed' : ''
        }`}
      >
        <div className="brand">
          <Building2
            className="brand-icon"
            size={39}
            strokeWidth={1.8}
          />

          <div className="brand-copy">
            <strong>
              HỆ THỐNG QUẢN LÝ
              <br />
              HỒ SƠ CÔNG
            </strong>
            <span>Vì hành chính phục vụ</span>
          </div>

          <button
            type="button"
            className="sidebar-close"
            aria-label="Đóng menu"
            onClick={() => dispatch(closeMobileSidebar())}
          >
            <X size={21} />
          </button>
        </div>

        <nav
          className="sidebar-nav"
          aria-label="Điều hướng chính"
        >
          {visibleMenu.map(({ label, icon: Icon, path }) => {
            const active = location.pathname === path

            return (
              <button
                type="button"
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={() => handleNavigate(path)}
                key={path}
              >
                <Icon size={20} />
                <span className="nav-label">{label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-profile"
          >
            <span className="profile-avatar">
              {getInitials(user?.fullName)}
            </span>

            <span className="profile-copy">
              <strong>{user?.fullName}</strong>
              <small>{roleLabels[user?.role] || user?.role}</small>
            </span>

            <ChevronDown size={17} />
          </button>

          <button
            type="button"
            className="collapse-button"
            onClick={() => dispatch(toggleSidebar())}
            aria-label={
              sidebarCollapsed
                ? 'Mở rộng sidebar'
                : 'Thu gọn sidebar'
            }
          >
            <PanelLeftClose size={19} />
            <span className="nav-label">
              {sidebarCollapsed
                ? 'Mở rộng'
                : 'Thu gọn sidebar'}
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}
