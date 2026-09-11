import {
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  FileInput,
  FileText,
  ListTree,
  PanelLeftClose,
  Settings,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { closeMobileSidebar, toggleSidebar } from '../../features/ui/uiSlice'

const menu = [
  { label: 'Tổng quan', icon: FileText, active: true },
  { label: 'Hồ sơ đang xử lý', icon: ShieldCheck, count: '856' },
  { label: 'Hồ sơ đã hoàn thành', icon: CheckCircle2 },
  { label: 'Cảnh báo AI & Xác nhận', icon: AlertTriangle, count: '68', danger: true },
  { label: 'Cảnh báo thủ công', icon: AlertTriangle },
  { label: 'Import dữ liệu', icon: FileInput },
  { label: 'Quản lý model', icon: Building2 },
  { label: 'Báo cáo thống kê', icon: BarChart3 },
  { label: 'Danh mục', icon: ListTree },
  { label: 'Người dùng', icon: Users },
  { label: 'Cài đặt', icon: Settings },
]

export default function Sidebar() {
  const dispatch = useDispatch()
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
            <strong>HỆ THỐNG AI</strong>
            <span>Cảnh báo hồ sơ trễ hạn</span>
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
          {menu.map(({ label, icon: Icon, active, count, danger }) => (
            <button type="button" className={`nav-item ${active ? 'active' : ''}`} key={label}>
              <Icon size={20} />
              <span className="nav-label">{label}</span>
              {count && <b className={`nav-count ${danger ? 'danger' : ''}`}>{count}</b>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="sidebar-profile">
            <span className="profile-avatar">NV</span>
            <span className="profile-copy">
              <strong>Nguyễn Văn A</strong>
              <small>Quản trị viên</small>
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
