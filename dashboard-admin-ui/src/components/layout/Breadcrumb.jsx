import { ChevronRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const breadcrumbMap = {
  '/dashboard': 'Tổng quan',
  '/cases/processing': 'Hồ sơ đang xử lý',
  '/assignments': 'Giao việc',
  '/assigned-work': 'Việc được giao',
  '/assignment-tracking': 'Theo dõi giao việc',
  '/data-import': 'Import dữ liệu',
  '/reports': 'Báo cáo thống kê',
  '/users': 'Người dùng',
}

export default function Breadcrumb() {
  const { pathname } = useLocation()
  const currentLabel = breadcrumbMap[pathname] || 'Tổng quan'

  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      <Link to="/dashboard">Trang chủ</Link>
      <ChevronRight size={15} />
      <strong>{currentLabel}</strong>
    </nav>
  )
}
