import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { useSelector } from 'react-redux'
import BulkConfirmModal from '../components/cases/BulkConfirmModal'
import CaseBulkActionBar from '../components/cases/CaseBulkActionBar'
import CaseDetailPanel from '../components/cases/CaseDetailPanel'
import CaseFilterBar from '../components/cases/CaseFilterBar'
import CaseStatusTabs from '../components/cases/CaseStatusTabs'
import CaseTable from '../components/cases/CaseTable'
import RiskSummaryCards from '../components/cases/RiskSummaryCards'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'
import { createProcessingCases } from '../data/mockProcessingCases'
import '../styles/processing-cases.css'

const emptyFilters = {
  query: '',
  field: 'all',
  department: 'all',
  officer: 'all',
  status: 'all',
}

const emptyBulkChannels = { email: false, sms: false }

function normalizeSearch(value) {
  return value.trim().toLocaleLowerCase('vi')
}

export default function ProcessingCases() {
  const { sidebarCollapsed } = useSelector((state) => state.ui)
  const [cases, setCases] = useState(createProcessingCases)
  const [activeTab, setActiveTab] = useState('all')
  const [draftFilters, setDraftFilters] = useState(emptyFilters)
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters)
  const [globalSearch, setGlobalSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [detailCaseId, setDetailCaseId] = useState(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [bulkAction, setBulkAction] = useState(null)
  const [bulkChannels, setBulkChannels] = useState(emptyBulkChannels)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [feedback, setFeedback] = useState('')

  const filterOptions = useMemo(() => ({
    field: [...new Set(cases.map((item) => item.field))].sort(),
    department: [...new Set(cases.map((item) => item.department))].sort(),
    officer: [...new Set(cases.map((item) => item.officer))].sort(),
    status: ['Đang xử lý', 'Chờ xác nhận', 'Đã xác nhận'],
  }), [cases])

  const filteredCases = useMemo(() => cases.filter((item) => {
    const tabMatches = activeTab === 'all'
      || (['Rất cao', 'Cao', 'Trung bình'].includes(activeTab) && item.priority === activeTab)
      || item.status === activeTab
    const localQuery = normalizeSearch(appliedFilters.query)
    const headerQuery = normalizeSearch(globalSearch)
    const searchableText = normalizeSearch([
      item.id,
      item.procedure,
      item.field,
      item.department,
      item.officer,
      item.applicant,
    ].join(' '))

    return tabMatches
      && (!localQuery || searchableText.includes(localQuery))
      && (!headerQuery || searchableText.includes(headerQuery))
      && (appliedFilters.field === 'all' || item.field === appliedFilters.field)
      && (appliedFilters.department === 'all' || item.department === appliedFilters.department)
      && (appliedFilters.officer === 'all' || item.officer === appliedFilters.officer)
      && (appliedFilters.status === 'all' || item.status === appliedFilters.status)
  }), [activeTab, appliedFilters, cases, globalSearch])

  const totalPages = Math.max(1, Math.ceil(filteredCases.length / pageSize))
  const pageCases = filteredCases.slice((page - 1) * pageSize, page * pageSize)
  const detailCase = cases.find((item) => item.id === detailCaseId) || null
  const selectedCases = cases.filter((item) => selectedIds.includes(item.id))
  const validSelectedCases = selectedCases.filter((item) => (
    bulkAction === 'follow'
      ? item.status === 'Đang xử lý'
      : item.status !== 'Đã xác nhận'
  ))
  const skippedCount = selectedCases.length - validSelectedCases.length

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  useEffect(() => {
    setSelectedIds([])
    setBulkAction(null)
    setBulkChannels(emptyBulkChannels)
    setDetailCaseId(null)
  }, [activeTab, appliedFilters, globalSearch, page, pageSize])

  const updateCase = (caseId, changes) => {
    setCases((currentCases) => currentCases.map((item) => (
      item.id === caseId ? { ...item, ...changes } : item
    )))
  }

  const handleToggleCase = (caseId) => {
    setSelectedIds((currentIds) => currentIds.includes(caseId)
      ? currentIds.filter((id) => id !== caseId)
      : [...currentIds, caseId])
  }

  const handleTogglePage = () => {
    const pageIds = pageCases.map((item) => item.id)
    const allSelected = pageIds.every((id) => selectedIds.includes(id))
    setSelectedIds((currentIds) => allSelected
      ? currentIds.filter((id) => !pageIds.includes(id))
      : [...new Set([...currentIds, ...pageIds])])
  }

  const handleBulkActionChange = (action) => {
    setBulkAction(action)
    if (action === 'follow') {
      setBulkChannels(emptyBulkChannels)
    }
  }

  const handleBulkChannelChange = (channel) => {
    if (bulkAction !== 'confirm') return
    setBulkChannels((current) => ({ ...current, [channel]: !current[channel] }))
  }

  const handleConfirmBulkAction = () => {
    const nextStatus = bulkAction === 'follow' ? 'Chờ xác nhận' : 'Đã xác nhận'
    const shouldSendNotifications = bulkAction === 'confirm'
    const notificationChannels = shouldSendNotifications
      ? [
          ...(bulkChannels.email ? ['Email'] : []),
          ...(bulkChannels.sms ? ['SMS'] : []),
        ]
      : []
    const validIds = new Set(validSelectedCases.map((item) => item.id))

    setCases((currentCases) => currentCases.map((item) => {
      if (!validIds.has(item.id)) return item
      if (!shouldSendNotifications) return { ...item, status: nextStatus }
      return { ...item, status: nextStatus, channels: notificationChannels }
    }))
    setFeedback(`Đã xử lý ${validSelectedCases.length} hồ sơ. Bỏ qua ${skippedCount} hồ sơ không hợp lệ.`)
    setConfirmModalOpen(false)
    setSelectedIds([])
    setBulkAction(null)
    setBulkChannels(emptyBulkChannels)
  }

  const handleDetailChannelChange = (channel) => {
    const hasChannel = detailCase.channels.includes(channel)
    updateCase(detailCase.id, {
      channels: hasChannel
        ? detailCase.channels.filter((item) => item !== channel)
        : [...detailCase.channels, channel],
    })
  }

  return (
    <div className={`app-shell processing-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar />
      <div className="app-main">
        <Header showBreadcrumb={false} onSearch={setGlobalSearch} />
        <main className="processing-page">
          <div className={`case-workspace ${detailCase ? 'has-detail-panel' : ''}`}>
            <div className="case-list-column">
              <header className="processing-page-heading">
                <h1>Hồ sơ đang xử lý</h1>
                <p>Danh sách hồ sơ đang được xử lý. Bạn có thể theo dõi tiến độ, đánh giá rủi ro và thực hiện xác nhận.</p>
              </header>

              <RiskSummaryCards cases={cases} />

              <CaseStatusTabs activeTab={activeTab} cases={cases} onChange={(tab) => {
                setPage(1)
                setActiveTab(tab)
              }} />
              <CaseFilterBar
                filters={draftFilters}
                options={filterOptions}
                onChange={(key, value) => setDraftFilters((current) => ({ ...current, [key]: value }))}
                onApply={() => {
                  setPage(1)
                  setAppliedFilters({ ...draftFilters })
                }}
              />

              {feedback && (
                <div className="case-feedback" role="status">
                  <span>{feedback}</span>
                  <button type="button" aria-label="Đóng thông báo" onClick={() => setFeedback('')}><X size={17} /></button>
                </div>
              )}

              <CaseBulkActionBar
                selectedCount={selectedIds.length}
                action={bulkAction}
                channels={bulkChannels}
                onActionChange={handleBulkActionChange}
                onChannelChange={handleBulkChannelChange}
                onClear={() => {
                  setSelectedIds([])
                  setBulkAction(null)
                  setBulkChannels(emptyBulkChannels)
                }}
                onApply={() => setConfirmModalOpen(true)}
              />

              <CaseTable
                cases={pageCases}
                totalCount={filteredCases.length}
                page={page}
                pageSize={pageSize}
                selectedIds={selectedIds}
                onToggleCase={handleToggleCase}
                onTogglePage={handleTogglePage}
                onView={setDetailCaseId}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPage(1)
                  setPageSize(size)
                }}
              />
            </div>

            <CaseDetailPanel
              item={detailCase}
              onClose={() => setDetailCaseId(null)}
              onStatusChange={(status) => updateCase(detailCase.id, { status })}
              onChannelChange={handleDetailChannelChange}
              onNoteChange={(note) => updateCase(detailCase.id, { note })}
            />
          </div>
        </main>
      </div>

      <BulkConfirmModal
        open={confirmModalOpen}
        action={bulkAction}
        selectedCount={selectedCases.length}
        validCount={validSelectedCases.length}
        skippedCount={skippedCount}
        channels={bulkChannels}
        onCancel={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmBulkAction}
      />
    </div>
  )
}
