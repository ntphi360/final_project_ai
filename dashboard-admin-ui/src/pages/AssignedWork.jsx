import { AlertCircle, CheckCircle2, LoaderCircle, X } from 'lucide-react'
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
import {
  clearAssignmentDetail,
  confirmAssignment,
  declineAssignment,
  fetchAssignmentDetail,
  fetchMyAssignments,
  fetchMyAssignmentSummary,
} from '../features/assignments/assignmentsSlice'

const emptyFilters = { query: '', assignerId: 'all', status: 'all', fromDate: '', toDate: '' }
export default function AssignedWork() {
  const dispatch = useDispatch()
  const { sidebarCollapsed } = useSelector((state) => state.ui)
  const { myList, mySummary, detail, loading, errors } = useSelector((state) => state.assignments)
  const [activeTab, setActiveTab] = useState('ALL')
  const [draftFilters, setDraftFilters] = useState(emptyFilters)
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters)
  const [acceptModalOpen, setAcceptModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [toast, setToast] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  const queryParams = useMemo(() => ({
    status: activeTab !== 'ALL' ? activeTab : appliedFilters.status !== 'all' ? appliedFilters.status : undefined,
    search: appliedFilters.query.trim() || undefined,
    fromDate: appliedFilters.fromDate || undefined,
    toDate: appliedFilters.toDate || undefined,
    page,
    pageSize,
  }), [activeTab, appliedFilters, page, pageSize])

  const assignerOptions = useMemo(() => {
    const uniqueAssigners = new Map()
    myList.items.forEach((item) => uniqueAssigners.set(item.assignerId, { id: item.assignerId, name: item.assignerName }))
    return [...uniqueAssigners.values()]
  }, [myList.items])

  const displayedAssignments = useMemo(() => {
    if (appliedFilters.assignerId === 'all') return myList.items
    return myList.items.filter((item) => String(item.assignerId) === String(appliedFilters.assignerId))
  }, [appliedFilters.assignerId, myList.items])

  useEffect(() => {
    dispatch(fetchMyAssignments(queryParams))
  }, [dispatch, queryParams])

  useEffect(() => {
    dispatch(fetchMyAssignmentSummary())
  }, [dispatch])

  useEffect(() => {
    dispatch(clearAssignmentDetail())
  }, [activeTab, appliedFilters, page, pageSize, dispatch])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 4500)
    return () => window.clearTimeout(timer)
  }, [toast])

  const refreshData = async (detailId) => {
    await Promise.all([
      dispatch(fetchMyAssignments(queryParams)),
      dispatch(fetchMyAssignmentSummary()),
      detailId ? dispatch(fetchAssignmentDetail(detailId)) : Promise.resolve(),
    ])
  }

  const confirmAccept = async () => {
    if (!detail) return
    setActionMessage('')
    try {
      await dispatch(confirmAssignment(detail.id)).unwrap()
      setAcceptModalOpen(false)
      setToast('Đã xác nhận nhận việc.')
      await refreshData(detail.id)
    } catch (error) {
      setAcceptModalOpen(false)
      setActionMessage(typeof error === 'string' ? error : 'Không thể xác nhận nhận việc.')
    }
  }

  const confirmReject = async () => {
    if (!detail || !rejectReason.trim()) return
    setActionMessage('')
    try {
      await dispatch(declineAssignment({ id: detail.id, reason: rejectReason.trim() })).unwrap()
      setRejectModalOpen(false)
      setRejectReason('')
      setToast('Đã từ chối công việc.')
      await refreshData(detail.id)
    } catch (error) {
      setRejectModalOpen(false)
      setActionMessage(typeof error === 'string' ? error : 'Không thể từ chối công việc.')
    }
  }

  const openDetail = (id) => {
    setActionMessage('')
    dispatch(fetchAssignmentDetail(id))
  }

  const openLatestNotification = () => {
    const latestPending = myList.items.find((item) => item.status === 'PENDING')
    if (latestPending) openDetail(latestPending.id)
  }

  return (
    <div className={`app-shell processing-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar />
      <div className="app-main">
        <Header onNotificationClick={openLatestNotification} notificationCount={mySummary.pending} />
        <main className="w-full px-4 pb-10 pt-4 sm:px-5 xl:px-6">
          <header className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 lg:text-[29px]">Việc được giao</h1>
            <p className="mt-1 text-sm text-slate-500">Danh sách công việc được phân công cho bạn.</p>
          </header>

          {loading.my && <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700"><LoaderCircle size={18} className="animate-spin" /> Đang tải danh sách công việc...</div>}
          {(errors.my || errors.mySummary) && <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span className="flex items-center gap-2"><AlertCircle size={18} />{errors.my || errors.mySummary}</span><button type="button" className="font-semibold underline" onClick={() => { dispatch(fetchMyAssignments(queryParams)); dispatch(fetchMyAssignmentSummary()) }}>Thử lại</button></div>}
          {(actionMessage || errors.detail) && <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle size={18} />{actionMessage || errors.detail}</div>}

          <div className={`grid items-start gap-3 ${detail ? 'xl:grid-cols-[minmax(0,1fr)_420px]' : 'grid-cols-1'}`}>
            <div className="min-w-0 space-y-3">
              <AssignedWorkSummary summary={mySummary} />
              <AssignedWorkTabs summary={mySummary} activeTab={activeTab} onChange={(tab) => { setPage(1); setActiveTab(tab) }} />
              <AssignedWorkFilter
                filters={draftFilters}
                assigners={assignerOptions}
                onChange={(key, value) => setDraftFilters((current) => ({ ...current, [key]: value }))}
                onApply={() => { setPage(1); setAppliedFilters({ ...draftFilters }) }}
              />
              <AssignedWorkTable
                assignments={displayedAssignments}
                totalCount={appliedFilters.assignerId === 'all' ? myList.total : displayedAssignments.length}
                page={page}
                pageSize={pageSize}
                onView={openDetail}
                onPageChange={setPage}
                onPageSizeChange={(size) => { setPage(1); setPageSize(size) }}
              />
            </div>

            {loading.detail && !detail
              ? <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600"><LoaderCircle size={18} className="animate-spin" /> Đang tải chi tiết...</div>
              : <AssignedWorkDetailPanel assignment={detail} onClose={() => dispatch(clearAssignmentDetail())} onAccept={() => setAcceptModalOpen(true)} onReject={() => setRejectModalOpen(true)} />}
          </div>
        </main>
      </div>

      <AcceptWorkModal open={acceptModalOpen} submitting={loading.action} onCancel={() => setAcceptModalOpen(false)} onConfirm={confirmAccept} />
      <RejectWorkModal open={rejectModalOpen} reason={rejectReason} submitting={loading.action} onReasonChange={setRejectReason} onCancel={() => { setRejectModalOpen(false); setRejectReason('') }} onConfirm={confirmReject} />

      {toast && <div className="fixed bottom-5 right-5 z-[80] flex max-w-sm items-center gap-3 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-xl" role="status"><CheckCircle2 size={20} className="shrink-0" /><span>{toast}</span><button type="button" aria-label="Đóng thông báo" className="ml-2 text-slate-400 hover:text-slate-600" onClick={() => setToast('')}><X size={17} /></button></div>}
    </div>
  )
}
