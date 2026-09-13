import { AlertCircle, LoaderCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AssignmentTrackingDetailPanel from '../components/assignment-tracking/AssignmentTrackingDetailPanel'
import AssignmentTrackingFilter from '../components/assignment-tracking/AssignmentTrackingFilter'
import AssignmentTrackingSummary from '../components/assignment-tracking/AssignmentTrackingSummary'
import AssignmentTrackingTable from '../components/assignment-tracking/AssignmentTrackingTable'
import AssignmentTrackingTabs from '../components/assignment-tracking/AssignmentTrackingTabs'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'
import {
  clearAssignmentDetail,
  fetchAssignmentDetail,
  fetchTrackingAssignments,
  fetchTrackingAssignmentSummary,
} from '../features/assignments/assignmentsSlice'
import { getDepartments } from '../services/catalogService'
import { getOfficers } from '../services/officerService'

const emptyFilters = {
  query: '',
  assignerId: 'all',
  assigneeId: 'all',
  departmentId: 'all',
  status: 'all',
  from: '',
  to: '',
}

export default function AssignmentTracking() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { sidebarCollapsed } = useSelector((state) => state.ui)
  const { trackingList, trackingSummary, detail, loading, errors } = useSelector((state) => state.assignments)
  const [activeTab, setActiveTab] = useState('ALL')
  const [draftFilters, setDraftFilters] = useState(emptyFilters)
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters)
  const [globalSearch, setGlobalSearch] = useState('')
  const [options, setOptions] = useState({ officers: [], departments: [] })
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const queryParams = useMemo(() => ({
    status: activeTab !== 'ALL' ? activeTab : appliedFilters.status !== 'all' ? appliedFilters.status : undefined,
    assignerId: appliedFilters.assignerId !== 'all' ? appliedFilters.assignerId : undefined,
    assigneeId: appliedFilters.assigneeId !== 'all' ? appliedFilters.assigneeId : undefined,
    departmentId: appliedFilters.departmentId !== 'all' ? appliedFilters.departmentId : undefined,
    search: globalSearch.trim() || appliedFilters.query.trim() || undefined,
    fromDate: appliedFilters.from || undefined,
    toDate: appliedFilters.to || undefined,
    page,
    pageSize,
  }), [activeTab, appliedFilters, globalSearch, page, pageSize])

  const responseNotifications = useMemo(() => trackingList.items
    .filter((item) => item.status !== 'PENDING')
    .sort((a, b) => new Date(b.acceptedAt || b.rejectedAt) - new Date(a.acceptedAt || a.rejectedAt)), [trackingList.items])

  useEffect(() => {
    dispatch(fetchTrackingAssignments(queryParams))
  }, [dispatch, queryParams])

  useEffect(() => {
    dispatch(fetchTrackingAssignmentSummary())
    Promise.all([getOfficers(), getDepartments()])
      .then(([officers, departments]) => setOptions({ officers, departments }))
      .catch(() => setOptions({ officers: [], departments: [] }))
  }, [dispatch])

  useEffect(() => {
    dispatch(clearAssignmentDetail())
  }, [activeTab, appliedFilters, globalSearch, page, pageSize, dispatch])

  const resetFilters = () => {
    setPage(1)
    setDraftFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
  }

  const openDetail = (id) => dispatch(fetchAssignmentDetail(id))

  return (
    <div className={`app-shell processing-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar />
      <div className="app-main">
        <Header showBreadcrumb={false} onSearch={setGlobalSearch} onNotificationClick={() => setNotificationsOpen((open) => !open)} notificationCount={trackingSummary.accepted + trackingSummary.rejected} />
        {notificationsOpen && (
          <section className="fixed right-5 top-[62px] z-[70] w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl" aria-label="Thông báo phản hồi giao việc">
            <header className="border-b border-slate-200 px-4 py-3 text-sm font-bold text-slate-900">Phản hồi giao việc</header>
            <div className="max-h-80 overflow-y-auto p-2">
              {responseNotifications.map((item) => <button type="button" className="block w-full rounded-md px-3 py-2.5 text-left text-sm leading-5 text-slate-700 transition hover:bg-slate-50" onClick={() => { openDetail(item.id); setNotificationsOpen(false) }} key={item.id}><span className="font-semibold text-slate-900">{item.assigneeName}</span>{item.status === 'ACCEPTED' ? ' đã xác nhận nhận hồ sơ ' : ' đã từ chối hồ sơ '}<span className="font-semibold text-blue-700">{item.caseCode}</span>.</button>)}
              {responseNotifications.length === 0 && <p className="px-3 py-5 text-center text-sm text-slate-500">Chưa có phản hồi trên trang hiện tại.</p>}
            </div>
          </section>
        )}
        <main className="px-4 pb-10 pt-4 sm:px-5 xl:px-6">
          <header className="mb-4">
            <p className="mb-2 text-xs text-slate-500">Trang chủ <span className="mx-1">›</span> Theo dõi giao việc</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 lg:text-[29px]">Theo dõi giao việc</h1>
            <p className="mt-1 text-sm text-slate-500">Theo dõi tình trạng tiếp nhận và phản hồi của các công việc đã giao.</p>
          </header>

          {loading.tracking && <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700"><LoaderCircle size={18} className="animate-spin" /> Đang tải danh sách giao việc...</div>}
          {(errors.tracking || errors.trackingSummary) && <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span className="flex items-center gap-2"><AlertCircle size={18} />{errors.tracking || errors.trackingSummary}</span><button type="button" className="font-semibold underline" onClick={() => { dispatch(fetchTrackingAssignments(queryParams)); dispatch(fetchTrackingAssignmentSummary()) }}>Thử lại</button></div>}
          {errors.detail && <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle size={18} />{errors.detail}</div>}

          <div className={`grid items-start gap-3 ${detail ? 'xl:grid-cols-[minmax(0,1fr)_440px]' : 'grid-cols-1'}`}>
            <div className="min-w-0 space-y-3">
              <AssignmentTrackingSummary summary={trackingSummary} />
              <AssignmentTrackingTabs summary={trackingSummary} activeTab={activeTab} onChange={(tab) => { setPage(1); setActiveTab(tab) }} />
              <AssignmentTrackingFilter
                filters={draftFilters}
                options={options}
                onChange={(key, value) => setDraftFilters((current) => ({ ...current, [key]: value }))}
                onApply={() => { setPage(1); setAppliedFilters({ ...draftFilters }) }}
                onReset={resetFilters}
              />
              <AssignmentTrackingTable
                assignments={trackingList.items}
                totalCount={trackingList.total}
                page={page}
                pageSize={pageSize}
                onView={openDetail}
                onPageChange={setPage}
                onPageSizeChange={(size) => { setPage(1); setPageSize(size) }}
              />
            </div>

            {loading.detail && !detail
              ? <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600"><LoaderCircle size={18} className="animate-spin" /> Đang tải chi tiết...</div>
              : <AssignmentTrackingDetailPanel assignment={detail} onClose={() => dispatch(clearAssignmentDetail())} onReassign={(caseId) => navigate('/assignments', { state: { caseId } })} />}
          </div>
        </main>
      </div>
    </div>
  )
}
