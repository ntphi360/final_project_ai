import { CheckCircle2, ChevronDown, Download, FileSpreadsheet, FileText, X } from 'lucide-react'
import { useEffect, useState } from 'react'
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
import {
  attentionCases,
  departmentData,
  fieldData,
  officerData,
  reportFilterOptions,
  reportSummary,
  riskData,
  statusData,
  trendData,
} from '../data/mockReport'

const emptyFilters = { from: '', to: '', field: 'all', department: 'all', officer: 'all' }

export default function Reports() {
  const navigate = useNavigate()
  const { sidebarCollapsed } = useSelector((state) => state.ui)
  const [filters, setFilters] = useState(emptyFilters)
  const [quickFilter, setQuickFilter] = useState('30 ngày')
  const [exportOpen, setExportOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 4000)
    return () => window.clearTimeout(timer)
  }, [toast])

  const showMockMessage = (message) => {
    setToast(message)
    setExportOpen(false)
  }

  return (
    <div className={`app-shell processing-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar />
      <div className="app-main">
        <Header showBreadcrumb={false} />
        <main className="px-4 pb-10 pt-4 sm:px-5 xl:px-6">
          <header className="mb-4 flex items-start justify-between gap-4">
            <div><p className="mb-2 text-xs text-slate-500">Trang chủ <span className="mx-1">›</span> Báo cáo thống kê</p><h1 className="text-2xl font-bold tracking-tight text-slate-950 lg:text-[29px]">Báo cáo thống kê</h1><p className="mt-1 text-sm text-slate-500">Tổng hợp và theo dõi tình hình xử lý hồ sơ.</p></div>
            <div className="relative shrink-0">
              <button type="button" aria-expanded={exportOpen} className="flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700" onClick={() => setExportOpen((open) => !open)}><Download size={17} /> Xuất báo cáo <ChevronDown size={15} /></button>
              {exportOpen && <div className="absolute right-0 top-12 z-30 w-44 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl"><button type="button" className="flex h-9 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-slate-700 hover:bg-slate-50" onClick={() => showMockMessage('Chức năng xuất báo cáo sẽ được kết nối backend sau.')}><FileSpreadsheet size={16} className="text-emerald-600" /> Xuất Excel</button><button type="button" className="flex h-9 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-slate-700 hover:bg-slate-50" onClick={() => showMockMessage('Chức năng xuất báo cáo sẽ được kết nối backend sau.')}><FileText size={16} className="text-red-500" /> Xuất PDF</button></div>}
            </div>
          </header>

          <div className="space-y-3">
            <ReportFilterBar
              filters={filters}
              options={reportFilterOptions}
              quickFilter={quickFilter}
              onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
              onQuickFilter={(value) => { setQuickFilter(value); setToast(`Đã chọn khoảng thời gian: ${value}.`) }}
              onApply={() => setToast('Đã áp dụng bộ lọc báo cáo mock.')}
              onReset={() => { setFilters(emptyFilters); setQuickFilter('30 ngày'); setToast('Đã đặt lại bộ lọc.') }}
            />

            <ReportSummaryCards data={reportSummary} />

            <section className="grid items-stretch gap-3 xl:grid-cols-[1.35fr_0.9fr_0.9fr]" aria-label="Biểu đồ báo cáo chính">
              <CaseTrendChart data={trendData} />
              <StatusDistributionChart data={statusData} total={1248} />
              <RiskDistributionChart data={riskData} />
            </section>

            <section className="grid items-stretch gap-3 xl:grid-cols-[0.8fr_1.25fr_1fr]" aria-label="Thống kê chi tiết">
              <FieldStatisticsChart data={fieldData} />
              <DepartmentStatisticsTable data={departmentData} />
              <OfficerWorkloadTable data={officerData} />
            </section>

            <AttentionCasesTable cases={attentionCases} onView={(caseId) => navigate('/cases/processing', { state: { caseId } })} />
          </div>
        </main>
      </div>

      {toast && <div className="fixed bottom-5 right-5 z-[80] flex max-w-sm items-center gap-3 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-xl" role="status"><CheckCircle2 size={20} className="shrink-0" /><span>{toast}</span><button type="button" aria-label="Đóng thông báo" className="ml-2 text-slate-400 hover:text-slate-600" onClick={() => setToast('')}><X size={17} /></button></div>}
    </div>
  )
}
