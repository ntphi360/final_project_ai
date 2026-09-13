import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AssignmentTrackingDetailPanel from '../components/assignment-tracking/AssignmentTrackingDetailPanel'
import AssignmentTrackingFilter from '../components/assignment-tracking/AssignmentTrackingFilter'
import AssignmentTrackingSummary from '../components/assignment-tracking/AssignmentTrackingSummary'
import AssignmentTrackingTable from '../components/assignment-tracking/AssignmentTrackingTable'
import AssignmentTrackingTabs from '../components/assignment-tracking/AssignmentTrackingTabs'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'

const emptyFilters = {
  query: '',
  assigner: 'all',
  assignee: 'all',
  department: 'all',
  status: 'all',
  from: '',
  to: '',
}

function normalize(value) {
  return value.trim().toLocaleLowerCase('vi')
}

export default function AssignmentTracking() {
  const navigate = useNavigate()
  const { sidebarCollapsed } = useSelector((state) => state.ui)
  const assignments = useSelector((state) => state.assignments.items)
  const [activeTab, setActiveTab] = useState('ALL')
  const [draftFilters, setDraftFilters] = useState(emptyFilters)
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters)
  const [globalSearch, setGlobalSearch] = useState('')
  const [detailId, setDetailId] = useState(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const options = useMemo(() => ({
    assigners: [...new Set(assignments.map((item) => item.assignerName))].sort(),
    assignees: [...new Set(assignments.map((item) => item.assigneeName))].sort(),
    departments: [...new Set(assignments.map((item) => item.departmentName))].sort(),
  }), [assignments])

  const filteredAssignments = useMemo(() => assignments.filter((item) => {
    const query = normalize(appliedFilters.query)
    const headerQuery = normalize(globalSearch)
    const searchable = normalize(`${item.caseCode} ${item.procedureName} ${item.assignerName} ${item.assigneeName} ${item.departmentName}`)
    const assignedDate = item.assignedAt.slice(0, 10)

    return (activeTab === 'ALL' || item.status === activeTab)
      && (!query || searchable.includes(query))
      && (!headerQuery || searchable.includes(headerQuery))
      && (appliedFilters.assigner === 'all' || item.assignerName === appliedFilters.assigner)
      && (appliedFilters.assignee === 'all' || item.assigneeName === appliedFilters.assignee)
      && (appliedFilters.department === 'all' || item.departmentName === appliedFilters.department)
      && (appliedFilters.status === 'all' || item.status === appliedFilters.status)
      && (!appliedFilters.from || assignedDate >= appliedFilters.from)
      && (!appliedFilters.to || assignedDate <= appliedFilters.to)
  }), [activeTab, appliedFilters, assignments, globalSearch])

  const totalPages = Math.max(1, Math.ceil(filteredAssignments.length / pageSize))
  const pageAssignments = filteredAssignments.slice((page - 1) * pageSize, page * pageSize)
  const detailAssignment = assignments.find((item) => item.id === detailId) || null
  const responseNotifications = useMemo(() => assignments
    .filter((item) => item.status !== 'PENDING')
    .sort((a, b) => new Date(b.acceptedAt || b.rejectedAt) - new Date(a.acceptedAt || a.rejectedAt)), [assignments])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  useEffect(() => {
    setDetailId(null)
  }, [activeTab, appliedFilters, globalSearch, page, pageSize])

  const resetFilters = () => {
    setPage(1)
    setDraftFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
  }

  return (
    <div className={`app-shell processing-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar />
      <div className="app-main">
        <Header showBreadcrumb={false} onSearch={setGlobalSearch} onNotificationClick={() => setNotificationsOpen((open) => !open)} notificationCount={responseNotifications.length} />
        {notificationsOpen && (
          <section className="fixed right-5 top-[62px] z-[70] w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl" aria-label="Thông báo phản hồi giao việc">
            <header className="border-b border-slate-200 px-4 py-3 text-sm font-bold text-slate-900">Phản hồi giao việc</header>
            <div className="max-h-80 overflow-y-auto p-2">
              {responseNotifications.map((item) => (
                <button
                  type="button"
                  className="block w-full rounded-md px-3 py-2.5 text-left text-sm leading-5 text-slate-700 transition hover:bg-slate-50"
                  onClick={() => { setDetailId(item.id); setNotificationsOpen(false) }}
                  key={item.id}
                >
                  <span className="font-semibold text-slate-900">{item.assigneeName}</span>{item.status === 'ACCEPTED' ? ' đã xác nhận nhận hồ sơ ' : ' đã từ chối hồ sơ '}<span className="font-semibold text-blue-700">{item.caseCode}</span>.
                </button>
              ))}
            </div>
          </section>
        )}
        <main className="px-4 pb-10 pt-4 sm:px-5 xl:px-6">
          <header className="mb-4">
            <p className="mb-2 text-xs text-slate-500">Trang chủ <span className="mx-1">›</span> Theo dõi giao việc</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 lg:text-[29px]">Theo dõi giao việc</h1>
            <p className="mt-1 text-sm text-slate-500">Theo dõi tình trạng tiếp nhận và phản hồi của các công việc đã giao.</p>
          </header>

          <div className={`grid items-start gap-3 ${detailAssignment ? 'xl:grid-cols-[minmax(0,1fr)_440px]' : 'grid-cols-1'}`}>
            <div className="min-w-0 space-y-3">
              <AssignmentTrackingSummary assignments={assignments} />
              <AssignmentTrackingTabs assignments={assignments} activeTab={activeTab} onChange={(tab) => { setPage(1); setActiveTab(tab) }} />
              <AssignmentTrackingFilter
                filters={draftFilters}
                options={options}
                onChange={(key, value) => setDraftFilters((current) => ({ ...current, [key]: value }))}
                onApply={() => { setPage(1); setAppliedFilters({ ...draftFilters }) }}
                onReset={resetFilters}
              />
              <AssignmentTrackingTable
                assignments={pageAssignments}
                totalCount={filteredAssignments.length}
                page={page}
                pageSize={pageSize}
                onView={setDetailId}
                onPageChange={setPage}
                onPageSizeChange={(size) => { setPage(1); setPageSize(size) }}
              />
            </div>

            <AssignmentTrackingDetailPanel
              assignment={detailAssignment}
              onClose={() => setDetailId(null)}
              onReassign={(caseId) => navigate('/assignments', { state: { caseId } })}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
