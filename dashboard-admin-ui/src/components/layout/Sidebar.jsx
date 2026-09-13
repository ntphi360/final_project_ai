import {
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  FileText,
  House,
  Inbox,
  Import,
  ListTree,
  PanelLeftClose,
  Send,
  Settings,
  Users,
  X,
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { closeMobileSidebar, toggleSidebar } from '../../features/ui/uiSlice'

const menu = [
  { label: 'Tổng quan', icon: House, path: '/overview' },
  { label: 'Hồ sơ đang xử lý', icon: FileText, path: '/dashboard' },
  { label: 'Giao việc', icon: Send, path: '/assignments' },
  { label: 'Việc được giao', icon: Inbox, path: '/assigned-work' },
  { label: 'Theo dõi giao việc', icon: ClipboardList, path: '/assignment-tracking' },
  { label: 'Import dữ liệu', icon: Import, path: '/data-import' },
  // { label: 'Hồ sơ đã xử lý', icon: CheckCircle2 },
  { label: 'Báo cáo thống kê', icon: BarChart3, path: '/reports' },
  { label: 'Người dùng', icon: Users, path: '/users' },
]

const defaultUser = {
  initials: 'NV',
  name: 'Nguyễn Văn A',
  role: 'Quản trị viên',
}

export default function Sidebar({ user = defaultUser }) {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { mobileSidebarOpen, sidebarCollapsed } = useSelector((state) => state.ui)

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
          <Building2 className="brand-icon" size={39} strokeWidth={1.8} />
          <div className="brand-copy">
            <strong>HỆ THỐNG QUẢN LÝ<br />HỒ SƠ CÔNG</strong>
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

        <nav className="sidebar-nav" aria-label="Điều hướng chính">
          {menu.map(({ label, icon: Icon, path }) => {
            const isProcessing = label === 'Hồ sơ đang xử lý'
            const active = isProcessing
              ? ['/dashboard', '/cases/processing'].includes(location.pathname)
              : path === location.pathname
            return (
              <button
                type="button"
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={() => path && navigate(path)}
                key={label}
              >
                <Icon size={20} />
                <span className="nav-label">{label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="sidebar-profile">
            <span className="profile-avatar">{user.initials}</span>
            <span className="profile-copy">
              <strong>{user.name}</strong>
              <small>{user.role}</small>
            </span>
            <ChevronDown size={17} />
          </button>
          <button
            type="button"
            className="collapse-button"
            onClick={() => dispatch(toggleSidebar())}
            aria-label={sidebarCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            <PanelLeftClose size={19} />
            <span className="nav-label">{sidebarCollapsed ? 'Mở rộng' : 'Thu gọn sidebar'}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
