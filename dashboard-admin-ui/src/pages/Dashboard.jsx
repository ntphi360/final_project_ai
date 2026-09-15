import { useEffect } from 'react'
import { AlertTriangle, CheckCircle2, Clock3, FileText, LoaderCircle } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import FieldChart from '../components/dashboard/FieldChart'
import RiskCaseTable from '../components/dashboard/RiskCaseTable'
import RiskChart from '../components/dashboard/RiskChart'
import StatCard from '../components/dashboard/StatCard'
import StatusChart from '../components/dashboard/StatusChart'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'
import { fetchDashboard, setSelectedRisk } from '../features/dashboard/dashboardSlice'

const riskChartDefinitions = [
  { level: 'VERY_HIGH', name: 'Rất cao', color: '#ef3340' },
  { level: 'HIGH', name: 'Cao', color: '#ff7917' },
  { level: 'MEDIUM', name: 'Trung bình', color: '#f6b908' },
  { level: 'LOW', name: 'Thấp', color: '#20b99a' },
]

const riskSortOrder = {
  VERY_HIGH: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
}

export default function Dashboard() {
  const dispatch = useDispatch()
  const { data, loading, error } = useSelector((state) => state.dashboard)
  const { sidebarCollapsed } = useSelector((state) => state.ui)

  useEffect(() => {
    dispatch(fetchDashboard())
  }, [dispatch])

  const summary = data.summary || { total_cases: 0, processing_cases: 0, completed_cases: 0, overdue_cases: 0 }
  const riskData = riskChartDefinitions.map((definition) => ({
    ...definition,
    value: data.processingCases.filter((item) => (
      item.riskLevel === definition.level
    )).length,
  }))
  const highRiskCount = riskData.find((item) => item.level === 'HIGH').value
  const veryHighRiskCount = riskData.find((item) => item.level === 'VERY_HIGH').value
  const classifiedCaseCount = riskData.reduce((total, item) => total + item.value, 0)
  const stats = [
    { id: 'total', label: 'Tổng hồ sơ', value: summary.total_cases, icon: FileText, color: '#0877ed', trend: null, sparkline: [] },
    { id: 'processing', label: 'Đang xử lý', value: summary.processing_cases, icon: Clock3, color: '#f59e0b', trend: null, sparkline: [] },
    { id: 'completed', label: 'Đã hoàn thành', value: summary.completed_cases, icon: CheckCircle2, color: '#16b779', trend: null, sparkline: [] },
    { id: 'risk', label: 'Nguy cơ trễ hạn (AI)', value: highRiskCount + veryHighRiskCount, note: `${highRiskCount} Cao · ${veryHighRiskCount} Rất cao`, icon: AlertTriangle, color: '#ef3340', trend: null, sparkline: [] },
  ]
  const statusColors = ['#0877ed', '#f6b908', '#20b99a', '#8b5cf6', '#ef3340', '#06b6d4']
  const statusData = data.statuses.map((item, index) => ({
    name: item.status || 'Chưa xác định',
    value: item.count,
    percent: summary.total_cases ? ((item.count / summary.total_cases) * 100).toFixed(1) : '0.0',
    color: statusColors[index % statusColors.length],
  }))
  const fieldColors = ['#0877ed', '#20b99a', '#f6b908', '#8b5cf6', '#ef3340']
  const fieldData = [...data.fields]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((item, index) => ({ name: item.field_name || 'Chưa xác định', value: item.count, color: fieldColors[index] }))
  const riskCases = data.processingCases.map((item) => {
    return {
      id: item.id,
      caseId: item.id,
      caseCode: item.caseCode,
      procedure: item.procedure,
      field: item.field || '—',
      officer: item.officer || 'Chưa phân công',
      department: item.department || '—',
      dueDate: item.deadlineAt ? new Intl.DateTimeFormat('vi-VN').format(new Date(item.deadlineAt)) : '—',
      deadlineAt: item.deadlineAt,
      riskLevel: item.riskLevel,
      status: item.status,
    }
  }).sort((left, right) => {
    return (riskSortOrder[left.riskLevel] ?? 4)
      - (riskSortOrder[right.riskLevel] ?? 4)
  })

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar />
      <div className="app-main">
        <Header />
        <main className="dashboard-main" aria-busy={loading}>
          <div className="page-heading-row">
            <div>
              <h1>Tổng quan</h1>
              <p>Tình hình tiếp nhận và xử lý hồ sơ từ dữ liệu hiện tại</p>
            </div>
          </div>

          {loading && <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700"><LoaderCircle size={18} className="animate-spin" /> Đang tải dữ liệu dashboard...</div>}
          {error && <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span className="flex items-center gap-2"><AlertTriangle size={18} />{error}</span><button type="button" className="font-semibold underline" onClick={() => dispatch(fetchDashboard())}>Thử lại</button></div>}

          <section className="stats-grid" aria-label="Chỉ số tổng quan">
            {stats.map((stat) => <StatCard stat={stat} key={stat.id} />)}
          </section>

          <section className="charts-grid" aria-label="Biểu đồ thống kê">
            <StatusChart data={statusData} total={summary.total_cases} />
            <RiskChart
              data={riskData}
              predictionCount={classifiedCaseCount}
              onSelectRisk={(riskLevel) => dispatch(setSelectedRisk(riskLevel))}
            />
            <FieldChart data={fieldData} />
          </section>

          <RiskCaseTable cases={riskCases} />
        </main>
      </div>
    </div>
  )
}
