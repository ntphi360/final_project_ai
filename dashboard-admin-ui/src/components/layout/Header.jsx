import { Bell, ChevronDown, LogOut, Menu, Search } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setSearchTerm } from '../../features/dashboard/dashboardSlice'
import { toggleMobileSidebar } from '../../features/ui/uiSlice'
import Breadcrumb from './Breadcrumb'

export default function Header({ showBreadcrumb = true, onSearch }) {
  const dispatch = useDispatch()

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
        <button type="button" className="notification-button" aria-label="Thông báo">
          <Bell size={20} />
          <span>3</span>
        </button>
        <div className="header-avatar">NV</div>
        <div className="header-user">
          <strong>Nguyễn Văn A</strong>
          <span>Quản trị viên</span>
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
