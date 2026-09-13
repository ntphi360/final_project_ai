import { AlertCircle, CheckCircle2, LoaderCircle, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import AssignmentCaseFilter from '../components/assignments/AssignmentCaseFilter'
import AssignmentCaseTable from '../components/assignments/AssignmentCaseTable'
import AssignmentConfirmModal from '../components/assignments/AssignmentConfirmModal'
import AssignmentForm from '../components/assignments/AssignmentForm'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'
import { createAssignmentBatch } from '../features/assignments/assignmentsSlice'
import { getAllProcessingCases } from '../services/caseService'
import { getDepartments, getFields } from '../services/catalogService'
import { getOfficers, getOfficersByField } from '../services/officerService'
import { getApiErrorMessage } from '../services/serviceUtils'

const emptyFilters = { query: '', field: 'all', department: 'all', officer: 'all', status: 'all' }
const initialForm = { email: true, sms: false, officerId: '', title: '', content: '' }

function normalize(value) {
  return value.trim().toLocaleLowerCase('vi')
}

function notificationSummary(notifications = []) {
  return [['email', 'Email'], ['sms', 'SMS']]
    .map(([channel, label]) => {
      const deliveries = notifications.map((item) => item[channel]).filter(Boolean)
      if (!deliveries.length) return ''
      const sent = deliveries.filter((item) => item.success).length
      const failed = deliveries.length - sent
      return `${label}: ${sent} đã gửi${failed ? `, ${failed} thất bại` : ''}.`
    })
    .filter(Boolean)
    .join(' ')
}

export default function Assignment() {
  const location = useLocation()
  const dispatch = useDispatch()
  const { sidebarCollapsed } = useSelector((state) => state.ui)
  const submitting = useSelector((state) => state.assignments.loading.action)
  const [cases, setCases] = useState([])
  const [officers, setOfficers] = useState([])
  const [eligibleOfficers, setEligibleOfficers] = useState([])
  const [eligibleOfficersLoading, setEligibleOfficersLoading] = useState(false)
  const [eligibleOfficersError, setEligibleOfficersError] = useState('')
  const [catalogs, setCatalogs] = useState({ fields: [], departments: [] })
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [draftFilters, setDraftFilters] = useState(emptyFilters)
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters)
  const [selectedIds, setSelectedIds] = useState([])
  const [form, setForm] = useState(initialForm)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const [caseItems, officerItems, fields, departments] = await Promise.all([
        getAllProcessingCases(),
        getOfficers(),
        getFields(),
        getDepartments(),
      ])
      setCases(caseItems)
      setOfficers(officerItems)
      setEligibleOfficers(officerItems)
      setCatalogs({ fields, departments })
    } catch (error) {
      setLoadError(getApiErrorMessage(error, 'Không thể tải hồ sơ hoặc danh sách cán bộ. Vui lòng thử lại.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const requestedCase = location.state?.caseId
    if (!requestedCase || cases.length === 0) return
    const match = cases.find((item) => item.caseCode === requestedCase || item.id === requestedCase)
    if (match) setSelectedIds([match.id])
  }, [cases, location.state])

  const options = useMemo(() => ({
    field: catalogs.fields.map((item) => item.name),
    department: catalogs.departments.map((item) => item.name),
    officer: officers.filter((item) => item.active).map((item) => item.name),
    status: [...new Set(cases.map((item) => item.status))],
  }), [cases, catalogs, officers])

  const filteredCases = useMemo(() => cases.filter((item) => {
    const query = normalize(appliedFilters.query)
    const searchable = normalize(`${item.caseCode} ${item.procedure} ${item.field} ${item.department} ${item.officer}`)
    return (!query || searchable.includes(query))
      && (appliedFilters.field === 'all' || item.field === appliedFilters.field)
      && (appliedFilters.department === 'all' || item.department === appliedFilters.department)
      && (appliedFilters.officer === 'all' || item.officer === appliedFilters.officer)
      && (appliedFilters.status === 'all' || item.status === appliedFilters.status)
  }), [appliedFilters, cases])

  const totalPages = Math.max(1, Math.ceil(filteredCases.length / pageSize))
  const pageCases = filteredCases.slice((page - 1) * pageSize, page * pageSize)
  const selectedFieldIds = useMemo(() => {
    const fieldNames = new Set(cases.filter((item) => selectedIds.includes(item.id)).map((item) => item.field))
    return catalogs.fields.filter((item) => fieldNames.has(item.name)).map((item) => item.id)
  }, [cases, catalogs.fields, selectedIds])
  const selectedOfficer = eligibleOfficers.find((item) => String(item.id) === String(form.officerId)) || null
  const canSubmit = selectedIds.length > 0 && Boolean(selectedOfficer) && Boolean(form.title.trim()) && Boolean(form.content.trim())

  useEffect(() => {
    let active = true

    if (selectedFieldIds.length === 0) {
      setEligibleOfficers(officers)
      setEligibleOfficersError('')
      return undefined
    }

    setEligibleOfficersLoading(true)
    setEligibleOfficersError('')
    Promise.all(selectedFieldIds.map((fieldId) => getOfficersByField(fieldId)))
      .then((officerGroups) => {
        if (!active) return
        const commonOfficerIds = officerGroups.reduce((commonIds, group, index) => {
          const currentIds = new Set(group.filter((item) => item.active).map((item) => item.id))
          return index === 0
            ? currentIds
            : new Set([...commonIds].filter((id) => currentIds.has(id)))
        }, new Set())
        setEligibleOfficers(officers.filter((item) => item.active && commonOfficerIds.has(item.id)))
      })
      .catch((error) => {
        if (active) {
          setEligibleOfficers([])
          setEligibleOfficersError(getApiErrorMessage(error, 'Không thể tải cán bộ phù hợp theo lĩnh vực.'))
        }
      })
      .finally(() => {
        if (active) setEligibleOfficersLoading(false)
      })

    return () => { active = false }
  }, [officers, selectedFieldIds])

  useEffect(() => {
    if (form.officerId && !eligibleOfficers.some((item) => String(item.id) === String(form.officerId))) {
      setForm((current) => ({ ...current, officerId: '' }))
    }
  }, [eligibleOfficers, form.officerId])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  useEffect(() => {
    setSelectedIds([])
  }, [appliedFilters, page, pageSize])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 5000)
    return () => window.clearTimeout(timer)
  }, [toast])

  const handleToggleCase = (caseId) => {
    setSelectedIds((current) => current.includes(caseId)
      ? current.filter((id) => id !== caseId)
      : [...current, caseId])
  }

  const handleTogglePage = () => {
    const pageIds = pageCases.map((item) => item.id)
    const allSelected = pageIds.every((id) => selectedIds.includes(id))
    setSelectedIds((current) => allSelected
      ? current.filter((id) => !pageIds.includes(id))
      : [...new Set([...current, ...pageIds])])
  }

  const resetAssignment = () => {
    setSelectedIds([])
    setForm(initialForm)
    setActionError('')
  }

  const confirmAssignment = async () => {
    setActionError('')
    try {
      const result = await dispatch(createAssignmentBatch({
        caseIds: selectedIds,
        assigneeId: Number(form.officerId),
        title: form.title.trim(),
        content: form.content.trim(),
        sendEmail: form.email,
        sendSms: form.sms,
      })).unwrap()
      setModalOpen(false)
      const deliveryMessage = notificationSummary(result.notifications)
      setToast(`Đã giao thành công ${result.createdCount} hồ sơ.${result.skippedCount ? ` ${result.skippedCount} hồ sơ bị bỏ qua do đã có giao việc đang chờ.` : ''}${deliveryMessage ? ` ${deliveryMessage}` : ''}`)
      resetAssignment()
      await loadData()
    } catch (error) {
      setModalOpen(false)
      setActionError(typeof error === 'string' ? error : 'Không thể tạo giao việc. Vui lòng thử lại.')
    }
  }

  return (
    <div className={`app-shell processing-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar />
      <div className="app-main">
        <Header />
        <main className="w-full px-4 pb-10 pt-4 sm:px-5 xl:px-6">
          <header className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 lg:text-[29px]">Giao việc</h1>
            <p className="mt-1 text-sm text-slate-500">Chọn hồ sơ và phân công cho cán bộ xử lý.</p>
          </header>

          {loading && <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700"><LoaderCircle size={18} className="animate-spin" /> Đang tải dữ liệu...</div>}
          {loadError && <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span className="flex items-center gap-2"><AlertCircle size={18} />{loadError}</span><button type="button" className="font-semibold underline" onClick={loadData}>Thử lại</button></div>}
          {eligibleOfficersLoading && <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700"><LoaderCircle size={18} className="animate-spin" /> Đang tải cán bộ phù hợp theo lĩnh vực...</div>}
          {eligibleOfficersError && <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle size={18} />{eligibleOfficersError}</div>}
          {actionError && <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle size={18} />{actionError}</div>}

          <div className="space-y-3">
            <AssignmentCaseFilter
              filters={draftFilters}
              options={options}
              onChange={(key, value) => setDraftFilters((current) => ({ ...current, [key]: value }))}
              onApply={() => { setPage(1); setAppliedFilters({ ...draftFilters }) }}
            />
            <AssignmentCaseTable
              cases={pageCases}
              totalCount={filteredCases.length}
              page={page}
              pageSize={pageSize}
              selectedIds={selectedIds}
              onToggleCase={handleToggleCase}
              onTogglePage={handleTogglePage}
              onPageChange={setPage}
              onPageSizeChange={(size) => { setPage(1); setPageSize(size) }}
            />
            <AssignmentForm
              form={form}
              officers={eligibleOfficers}
              selectedCount={selectedIds.length}
              canSubmit={canSubmit && !submitting}
              submitting={submitting}
              onChange={(key, value) => setForm((current) => ({ ...current, [key]: value }))}
              onReset={resetAssignment}
              onSubmit={() => setModalOpen(true)}
            />
          </div>
        </main>
      </div>

      <AssignmentConfirmModal
        open={modalOpen}
        count={selectedIds.length}
        officer={selectedOfficer}
        channels={{ email: form.email, sms: form.sms }}
        submitting={submitting}
        onCancel={() => setModalOpen(false)}
        onConfirm={confirmAssignment}
      />

      {toast && <div className="fixed bottom-5 right-5 z-[80] flex max-w-sm items-center gap-3 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-xl" role="status"><CheckCircle2 size={20} className="shrink-0" /><span>{toast}</span><button type="button" aria-label="Đóng thông báo" className="ml-2 text-slate-400 hover:text-slate-600" onClick={() => setToast('')}><X size={17} /></button></div>}
    </div>
  )
}
