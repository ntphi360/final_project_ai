import { AlertCircle, CheckCircle2, ChevronDown, Download, FileSpreadsheet, FileText, LoaderCircle, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AttentionCasesTable from '../components/reports/AttentionCasesTable'
import CaseTrendChart from '../components/reports/CaseTrendChart'
import DepartmentStatisticsTable from '../components/reports/DepartmentStatisticsTable'
import FieldStatisticsChart from '../components/reports/FieldStatisticsChart'
import OfficerWorkloadTable from '../components/reports/OfficerWorkloadTable'
import ReportFilterBar from '../components/reports/ReportFilterBar'
import ReportSummaryCards from '../components/reports/ReportSummaryCards'
import RiskDistributionChart from '../components/reports/RiskDistributionChart'
import StatusDistributionChart from '../components/reports/StatusDistributionChart'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'
import { getReportDashboardData } from '../services/dashboardService'
import { getApiErrorMessage } from '../services/serviceUtils'

const emptyFilters = { from: '', to: '', field: 'all', department: 'all', officer: 'all' }
const statusColors = ['#1677ff', '#f59e0b', '#22c55e', '#8b5cf6', '#ef4444', '#06b6d4']
const statusDots = ['bg-blue-500', 'bg-amber-500', 'bg-green-500', 'bg-violet-500', 'bg-red-500', 'bg-cyan-500']

function remainingLabel(seconds, overdue) {
  const absoluteSeconds = Math.abs(seconds)
  const hours = Math.ceil(absoluteSeconds / 3600)
  if (overdue) return `Quá hạn ${hours} giờ`
  if (hours < 24) return `${hours} giờ`
  return `${Math.ceil(hours / 24)} ngày`
}

function mapAttentionCase(item) {
  const seconds = item.remaining_seconds
  return {
    id: item.case_code,
    procedure: item.procedure_name,
    officer: item.officer_name || 'Chưa phân công',
    remaining: remainingLabel(seconds, item.is_overdue),
    remainingHours: Math.floor(seconds / 3600),
    risk: item.is_overdue ? 'Quá hạn' : 'Gần đến hạn',
    status: item.status,
  }
}

function mapReportData(data) {
  const statusCount = (label) => data.statuses.find((item) => item.status === label)?.count || 0
  const summary = [
    { id: 'total', label: 'Tổng hồ sơ', value: data.summary.total_cases, change: null, tone: 'blue' },
    { id: 'processing', label: 'Đang xử lý', value: data.summary.processing_cases, change: null, tone: 'amber' },
    { id: 'completed', label: 'Đã hoàn thành', value: data.summary.completed_cases, change: null, tone: 'emerald' },
    { id: 'risk', label: 'Hồ sơ quá hạn', value: data.summary.overdue_cases, change: null, tone: 'red' },
    { id: 'waiting', label: 'Chờ xác nhận', value: statusCount('Chờ xác nhận'), change: null, tone: 'violet' },
    { id: 'confirmed', label: 'Đã xác nhận', value: statusCount('Đã xác nhận'), change: null, tone: 'cyan' },
  ]
  const statuses = data.statuses.map((item, index) => ({
    name: item.status,
    value: item.count,
    color: statusColors[index % statusColors.length],
    dotClass: statusDots[index % statusDots.length],
  }))
  const fields = data.fields.map((item) => ({ name: item.field_name, value: item.count }))
  const attentionMap = new Map([...data.overdue, ...data.nearDeadline].map((item) => [item.id, item]))
  const attention = [...attentionMap.values()].map(mapAttentionCase)
  const departments = [...new Set(data.recentCases.map((item) => item.department_name).filter(Boolean))]
  const officers = [...new Set(data.recentCases.map((item) => item.officer_name).filter(Boolean))]
  return {
    summary,
    statuses,
    fields,
    attention,
    filterOptions: { fields: fields.map((item) => item.name), departments, officers },
  }
}

export default function Reports() {
  const navigate = useNavigate()
  const { sidebarCollapsed } = useSelector((state) => state.ui)
  const [filters, setFilters] = useState(emptyFilters)
  const [quickFilter, setQuickFilter] = useState('30 ngày')
  const [exportOpen, setExportOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reportData, setReportData] = useState({
    summary: [],
    statuses: [],
    fields: [],
    attention: [],
    filterOptions: { fields: [], departments: [], officers: [] },
  })

  const loadReport = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setReportData(mapReportData(await getReportDashboardData()))
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Không thể tải dữ liệu báo cáo. Vui lòng thử lại.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReport()
  }, [loadReport])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 4000)
    return () => window.clearTimeout(timer)
  }, [toast])

  const showPendingFeature = (message) => {
    setToast(message)
    setExportOpen(false)
  }

  return (
    <div className={`app-shell processing-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar />
      <div className="app-main">
        <Header />
        <main className="px-4 pb-10 pt-4 sm:px-5 xl:px-6">
          <header className="mb-4 flex items-start justify-between gap-4">
            <div><h1 className="text-2xl font-bold tracking-tight text-slate-950 lg:text-[29px]">Báo cáo thống kê</h1><p className="mt-1 text-sm text-slate-500">Tổng hợp và theo dõi tình hình xử lý hồ sơ.</p></div>
            <div className="relative shrink-0">
              <button type="button" aria-expanded={exportOpen} className="flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700" onClick={() => setExportOpen((open) => !open)}><Download size={17} /> Xuất báo cáo <ChevronDown size={15} /></button>
              {exportOpen && <div className="absolute right-0 top-12 z-30 w-44 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl"><button type="button" className="flex h-9 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-slate-700 hover:bg-slate-50" onClick={() => showPendingFeature('Backend chưa có API xuất Excel.')}><FileSpreadsheet size={16} className="text-emerald-600" /> Xuất Excel</button><button type="button" className="flex h-9 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-slate-700 hover:bg-slate-50" onClick={() => showPendingFeature('Backend chưa có API xuất PDF.')}><FileText size={16} className="text-red-500" /> Xuất PDF</button></div>}
            </div>
          </header>

          {loading && <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700"><LoaderCircle size={18} className="animate-spin" /> Đang tải dữ liệu báo cáo...</div>}
          {error && <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span className="flex items-center gap-2"><AlertCircle size={18} />{error}</span><button type="button" className="font-semibold underline" onClick={loadReport}>Thử lại</button></div>}

          <div className="space-y-3">
            <ReportFilterBar
              filters={filters}
              options={reportData.filterOptions}
              quickFilter={quickFilter}
              onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
              onQuickFilter={(value) => { setQuickFilter(value); setToast(`Đã chọn khoảng thời gian: ${value}. Backend hiện chưa hỗ trợ lọc dashboard theo thời gian.`) }}
              onApply={() => setToast('Backend dashboard hiện chưa hỗ trợ các tham số lọc báo cáo.')}
              onReset={() => { setFilters(emptyFilters); setQuickFilter('30 ngày'); setToast('Đã đặt lại bộ lọc.') }}
            />

            <ReportSummaryCards data={reportData.summary} />

            <section className="grid items-stretch gap-3 xl:grid-cols-[1.35fr_0.9fr_0.9fr]" aria-label="Biểu đồ báo cáo chính">
              <CaseTrendChart data={[]} />
              <StatusDistributionChart data={reportData.statuses} total={reportData.summary[0]?.value || 0} />
              <RiskDistributionChart data={[]} />
            </section>

            <section className="grid items-stretch gap-3 xl:grid-cols-[0.8fr_1.25fr_1fr]" aria-label="Thống kê chi tiết">
              <FieldStatisticsChart data={reportData.fields} />
              <DepartmentStatisticsTable data={[]} />
              <OfficerWorkloadTable data={[]} />
            </section>

            <AttentionCasesTable cases={reportData.attention} onView={(caseId) => navigate('/cases/processing', { state: { caseId } })} />
          </div>
        </main>
      </div>

      {toast && <div className="fixed bottom-5 right-5 z-[80] flex max-w-sm items-center gap-3 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-xl" role="status"><CheckCircle2 size={20} className="shrink-0" /><span>{toast}</span><button type="button" aria-label="Đóng thông báo" className="ml-2 text-slate-400 hover:text-slate-600" onClick={() => setToast('')}><X size={17} /></button></div>}
    </div>
  )
}
