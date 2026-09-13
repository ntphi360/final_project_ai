import { CheckCircle2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AssignmentCaseFilter from '../components/assignments/AssignmentCaseFilter'
import AssignmentCaseTable from '../components/assignments/AssignmentCaseTable'
import AssignmentConfirmModal from '../components/assignments/AssignmentConfirmModal'
import AssignmentForm from '../components/assignments/AssignmentForm'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'
import { assignmentOfficers, createMockAssignments } from '../data/mockAssignments'
import { createProcessingCases } from '../data/mockProcessingCases'
import { addAssignments } from '../features/assignments/assignmentsSlice'

const emptyFilters = {
  query: '',
  field: 'all',
  department: 'all',
  officer: 'all',
  status: 'all',
}

const initialForm = {
  email: true,
  sms: false,
  officerId: '',
  title: '',
  content: '',
}

function normalize(value) {
  return value.trim().toLocaleLowerCase('vi')
}

export default function Assignment() {
  const dispatch = useDispatch()
  const { sidebarCollapsed } = useSelector((state) => state.ui)
  const [cases] = useState(createProcessingCases)
  const [draftFilters, setDraftFilters] = useState(emptyFilters)
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters)
  const [globalSearch, setGlobalSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [form, setForm] = useState(initialForm)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState('')

  const options = useMemo(() => ({
    field: [...new Set(cases.map((item) => item.field))].sort(),
    department: [...new Set(cases.map((item) => item.department))].sort(),
    officer: [...new Set(cases.map((item) => item.officer))].sort(),
    status: [...new Set(cases.map((item) => item.status))],
  }), [cases])

  const filteredCases = useMemo(() => cases.filter((item) => {
    const query = normalize(appliedFilters.query)
    const headerQuery = normalize(globalSearch)
    const searchable = normalize(`${item.id} ${item.procedure} ${item.field} ${item.department} ${item.officer}`)

    return (!query || searchable.includes(query))
      && (!headerQuery || searchable.includes(headerQuery))
      && (appliedFilters.field === 'all' || item.field === appliedFilters.field)
      && (appliedFilters.department === 'all' || item.department === appliedFilters.department)
      && (appliedFilters.officer === 'all' || item.officer === appliedFilters.officer)
      && (appliedFilters.status === 'all' || item.status === appliedFilters.status)
  }), [appliedFilters, cases, globalSearch])

  const totalPages = Math.max(1, Math.ceil(filteredCases.length / pageSize))
  const pageCases = filteredCases.slice((page - 1) * pageSize, page * pageSize)
  const selectedCases = cases.filter((item) => selectedIds.includes(item.id))
  const selectedOfficer = assignmentOfficers.find((item) => item.id === form.officerId) || null
  const canSubmit = selectedIds.length > 0
    && Boolean(selectedOfficer)
    && Boolean(form.title.trim())
    && Boolean(form.content.trim())

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  useEffect(() => {
    setSelectedIds([])
  }, [appliedFilters, globalSearch, page, pageSize])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 4000)
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
  }

  const confirmAssignment = () => {
    const newAssignments = createMockAssignments(selectedCases, selectedOfficer, form)
    dispatch(addAssignments(newAssignments))
    setModalOpen(false)
    setToast(`Giao việc thành công cho ${newAssignments.length} hồ sơ.`)
    resetAssignment()
  }

  return (
    <div className={`app-shell processing-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar />
      <div className="app-main">
        <Header showBreadcrumb={false} onSearch={setGlobalSearch} />
        <main className="w-full px-4 pb-10 pt-4 sm:px-5 xl:px-6">
          <header className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 lg:text-[29px]">Giao việc</h1>
            <p className="mt-1 text-sm text-slate-500">Chọn hồ sơ và phân công cho cán bộ xử lý.</p>
          </header>

          <div className="space-y-3">
            <AssignmentCaseFilter
              filters={draftFilters}
              options={options}
              onChange={(key, value) => setDraftFilters((current) => ({ ...current, [key]: value }))}
              onApply={() => {
                setPage(1)
                setAppliedFilters({ ...draftFilters })
              }}
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
              onPageSizeChange={(size) => {
                setPage(1)
                setPageSize(size)
              }}
            />
            <AssignmentForm
              form={form}
              officers={assignmentOfficers}
              selectedCount={selectedIds.length}
              canSubmit={canSubmit}
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
        onCancel={() => setModalOpen(false)}
        onConfirm={confirmAssignment}
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
