import { useEffect, useState } from 'react'
import { CalendarDays, ChevronDown, Info, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import FieldChart from '../components/dashboard/FieldChart'
import RiskCaseTable from '../components/dashboard/RiskCaseTable'
import RiskChart from '../components/dashboard/RiskChart'
import StatCard from '../components/dashboard/StatCard'
import StatusChart from '../components/dashboard/StatusChart'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'
import { fetchDashboard } from '../features/dashboard/dashboardSlice'

export default function Dashboard() {
  const dispatch = useDispatch()
  const { data, loading } = useSelector((state) => state.dashboard)
  const { sidebarCollapsed } = useSelector((state) => state.ui)
  const [showNotice, setShowNotice] = useState(true)

  useEffect(() => {
    dispatch(fetchDashboard())
  }, [dispatch])

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar />
      <div className="app-main">
        <Header />
        <main className="dashboard-main" aria-busy={loading}>
          <div className="page-heading-row">
            <div>
              <h1>Tổng quan</h1>
              <p>Tình hình xử lý hồ sơ và cảnh báo trễ hạn bằng AI</p>
            </div>
            <button type="button" className="date-range">
              <CalendarDays size={18} />
              <b>01/09/2025</b>
              <span>-</span>
              <b>30/09/2025</b>
              <ChevronDown size={16} />
            </button>
          </div>

          {showNotice && (
            <div className="ai-notice">
              <Info size={21} fill="#0877ed" color="#fff" />
              <span>AI hỗ trợ dự đoán nguy cơ trễ hạn. Người giám sát kiểm tra và xác nhận trước khi gửi cảnh báo qua Email hoặc Zalo.</span>
              <button type="button" onClick={() => setShowNotice(false)} aria-label="Đóng thông báo"><X size={18} /></button>
            </div>
          )}

          <section className="stats-grid" aria-label="Chỉ số tổng quan">
            {data.stats.map((stat) => <StatCard stat={stat} key={stat.id} />)}
          </section>

          <section className="charts-grid" aria-label="Biểu đồ thống kê">
            <StatusChart data={data.status} />
            <RiskChart data={data.riskLevels} />
            <FieldChart data={data.fields} />
          </section>

          <RiskCaseTable cases={data.cases} />
        </main>
      </div>
    </div>
  )
}
