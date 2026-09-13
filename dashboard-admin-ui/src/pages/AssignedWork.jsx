import { CheckCircle2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AcceptWorkModal from '../components/assigned-work/AcceptWorkModal'
import AssignedWorkDetailPanel from '../components/assigned-work/AssignedWorkDetailPanel'
import AssignedWorkFilter from '../components/assigned-work/AssignedWorkFilter'
import AssignedWorkSummary from '../components/assigned-work/AssignedWorkSummary'
import AssignedWorkTable from '../components/assigned-work/AssignedWorkTable'
import AssignedWorkTabs from '../components/assigned-work/AssignedWorkTabs'
import RejectWorkModal from '../components/assigned-work/RejectWorkModal'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'
import { acceptAssignment, rejectAssignment } from '../features/assignments/assignmentsSlice'

const receiverUser = {
  initials: 'TB',
  name: 'Trần Thị B',
  role: 'Cán bộ xử lý',
}

const emptyFilters = {
  query: '',
  assigner: 'all',
  status: 'all',
  from: '',
  to: '',
}

function normalize(value) {
  return value.trim().toLocaleLowerCase('vi')
}

export default function AssignedWork() {
  const dispatch = useDispatch()
  const { sidebarCollapsed } = useSelector((state) => state.ui)
  const assignments = useSelector((state) => state.assignments.items)
  const [activeTab, setActiveTab] = useState('ALL')
  const [draftFilters, setDraftFilters] = useState(emptyFilters)
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters)
  const [globalSearch, setGlobalSearch] = useState('')
  const [detailId, setDetailId] = useState(null)
  const [acceptModalOpen, setAcceptModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [toast, setToast] = useState('')

  const assigners = useMemo(() => [...new Set(assignments.map((item) => item.assignerName))].sort(), [assignments])

  const filteredAssignments = useMemo(() => assignments.filter((item) => {
    const query = normalize(appliedFilters.query)
    const headerQuery = normalize(globalSearch)
    const searchable = normalize(`${item.caseCode} ${item.procedureName} ${item.assignerName}`)
    const assignedDate = item.assignedAt.slice(0, 10)

    return (activeTab === 'ALL' || item.status === activeTab)
      && (!query || searchable.includes(query))
      && (!headerQuery || searchable.includes(headerQuery))
      && (appliedFilters.assigner === 'all' || item.assignerName === appliedFilters.assigner)
      && (appliedFilters.status === 'all' || item.status === appliedFilters.status)
      && (!appliedFilters.from || assignedDate >= appliedFilters.from)
      && (!appliedFilters.to || assignedDate <= appliedFilters.to)
  }), [activeTab, appliedFilters, assignments, globalSearch])

  const totalPages = Math.max(1, Math.ceil(filteredAssignments.length / pageSize))
  const pageAssignments = filteredAssignments.slice((page - 1) * pageSize, page * pageSize)
  const detailAssignment = assignments.find((item) => item.id === detailId) || null
  const pendingCount = assignments.filter((item) => item.status === 'PENDING').length

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  useEffect(() => {
    setDetailId(null)
  }, [activeTab, appliedFilters, globalSearch, page, pageSize])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 4000)
    return () => window.clearTimeout(timer)
  }, [toast])

  const confirmAccept = () => {
    dispatch(acceptAssignment({ id: detailId, acceptedAt: new Date().toISOString() }))
    setAcceptModalOpen(false)
    setToast('Đã xác nhận nhận việc.')
  }

  const confirmReject = () => {
    dispatch(rejectAssignment({
      id: detailId,
      rejectedAt: new Date().toISOString(),
      rejectionReason: rejectReason.trim(),
    }))
    setRejectModalOpen(false)
    setRejectReason('')
    setToast('Đã từ chối công việc.')
  }

  const openLatestNotification = () => {
    const latestPending = assignments.find((item) => item.status === 'PENDING')
    if (latestPending) setDetailId(latestPending.id)
  }

  return (
    <div className={`app-shell processing-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar user={receiverUser} />
      <div className="app-main">
        <Header
          showBreadcrumb={false}
          onSearch={setGlobalSearch}
          onNotificationClick={openLatestNotification}
          notificationCount={pendingCount}
          user={receiverUser}
        />
        <main className="w-full px-4 pb-10 pt-4 sm:px-5 xl:px-6">
          <header className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 lg:text-[29px]">Việc được giao</h1>
            <p className="mt-1 text-sm text-slate-500">Danh sách công việc được phân công cho bạn.</p>
          </header>

          <div className={`grid items-start gap-3 ${detailAssignment ? 'xl:grid-cols-[minmax(0,1fr)_420px]' : 'grid-cols-1'}`}>
            <div className="min-w-0 space-y-3">
              <AssignedWorkSummary assignments={assignments} />
              <AssignedWorkTabs assignments={assignments} activeTab={activeTab} onChange={(tab) => { setPage(1); setActiveTab(tab) }} />
              <AssignedWorkFilter
                filters={draftFilters}
                assigners={assigners}
                onChange={(key, value) => setDraftFilters((current) => ({ ...current, [key]: value }))}
                onApply={() => {
                  setPage(1)
                  setAppliedFilters({ ...draftFilters })
                }}
              />
              <AssignedWorkTable
                assignments={pageAssignments}
                totalCount={filteredAssignments.length}
                page={page}
                pageSize={pageSize}
                onView={setDetailId}
                onPageChange={setPage}
                onPageSizeChange={(size) => { setPage(1); setPageSize(size) }}
              />
            </div>

            <AssignedWorkDetailPanel
              assignment={detailAssignment}
              onClose={() => setDetailId(null)}
              onAccept={() => setAcceptModalOpen(true)}
              onReject={() => setRejectModalOpen(true)}
            />
          </div>
        </main>
      </div>

      <AcceptWorkModal open={acceptModalOpen} onCancel={() => setAcceptModalOpen(false)} onConfirm={confirmAccept} />
      <RejectWorkModal
        open={rejectModalOpen}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onCancel={() => { setRejectModalOpen(false); setRejectReason('') }}
        onConfirm={confirmReject}
      />

      {toast && (
        <div className="fixed bottom-5 right-5 z-[80] flex max-w-sm items-center gap-3 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-xl" role="status">
          <CheckCircle2 size={20} className="shrink-0" />
          <span>{toast}</span>
          <button type="button" aria-label="Đóng thông báo" className="ml-2 text-slate-400 hover:text-slate-600" onClick={() => setToast('')}><X size={17} /></button>
        </div>
      )}
    </div>
  )
}
