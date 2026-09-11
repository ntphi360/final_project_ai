import { Bell, ChevronDown, Menu, Search } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setSearchTerm } from '../../features/dashboard/dashboardSlice'
import { toggleMobileSidebar } from '../../features/ui/uiSlice'
import Breadcrumb from './Breadcrumb'

export default function Header() {
  const dispatch = useDispatch()

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

      <label className="global-search">
        <Search size={17} />
        <input
          type="search"
          placeholder="Tìm kiếm mã hồ sơ, tên thủ tục, cán bộ, phòng ban..."
          onChange={(event) => dispatch(setSearchTerm(event.target.value))}
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
      </div>
    </header>
  )
}
