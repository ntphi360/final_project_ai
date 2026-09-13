import { Bell, ChevronDown, LogOut, Menu, Search } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setSearchTerm } from '../../features/dashboard/dashboardSlice'
import { toggleMobileSidebar } from '../../features/ui/uiSlice'
import Breadcrumb from './Breadcrumb'

const defaultUser = {
  initials: 'NV',
  name: 'Nguyễn Văn A',
  role: 'Quản trị viên',
}

export default function Header({
  showBreadcrumb = true,
  onSearch,
  onNotificationClick,
  notificationCount = 3,
  user = defaultUser,
}) {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSearch = (value) => {
    if (onSearch) {
      onSearch(value)
      return
    }
    dispatch(setSearchTerm(value))
  }

  return (
    <header className={`top-header ${showBreadcrumb ? '' : 'without-breadcrumb'}`}>
      <button
        type="button"
        className="icon-button menu-button"
        aria-label="Mở menu"
        onClick={() => dispatch(toggleMobileSidebar())}
      >
        <Menu size={23} />
      </button>

      {showBreadcrumb && <Breadcrumb />}

      <label className="global-search">
        <Search size={17} />
        <input
          type="search"
          placeholder="Tìm kiếm mã hồ sơ, tên thủ tục, cán bộ, phòng ban..."
          onChange={(event) => handleSearch(event.target.value)}
        />
        <kbd>Ctrl K</kbd>
      </label>

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
        <button type="button" className="logout-button">
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  )
}
