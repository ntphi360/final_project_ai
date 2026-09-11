import { ChevronRight } from 'lucide-react'

export default function Breadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      <span>Trang chủ</span>
      <ChevronRight size={15} />
      <strong>Tổng quan</strong>
    </nav>
  )
}
