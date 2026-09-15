import {useCallback, useEffect, useMemo, useState} from 'react'
import {AlertCircle, LoaderCircle, X} from 'lucide-react'
import {useSelector} from 'react-redux'
import {useLocation} from 'react-router-dom'
import BulkConfirmModal from '../components/cases/BulkConfirmModal'
import CaseBulkActionBar from '../components/cases/CaseBulkActionBar'
import CaseDetailPanel from '../components/cases/CaseDetailPanel'
import CaseFilterBar from '../components/cases/CaseFilterBar'
import CaseStatusTabs from '../components/cases/CaseStatusTabs'
import CaseTable from '../components/cases/CaseTable'
import RiskSummaryCards from '../components/cases/RiskSummaryCards'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'
import {
    getCaseById,
    getProcessingCases,
    performCaseAction,
    performCaseBulkAction,
} from '../services/caseService'
import {getDepartments, getFields} from '../services/catalogService'
import {getOfficers} from '../services/officerService'
import {getApiErrorMessage} from '../services/serviceUtils'
import '../styles/processing-cases.css'

const emptyFilters = {
    query: '',
    field: 'all',
    department: 'all',
    officer: 'all',
    status: 'all',
}

const emptyBulkChannels = {email: false, sms: false}

const riskLevelByTab = {
    'Rất cao': 'VERY_HIGH',
    Cao: 'HIGH',
    'Trung bình': 'MEDIUM',
    Thấp: 'LOW',
}

const riskPriority = {
    VERY_HIGH: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
}

function normalizeSearch(value) {
    return value.trim().toLocaleLowerCase('vi')
}

function compareCasesByRiskAndDeadline(left, right) {
    if (left.isFollowing !== right.isFollowing) return left.isFollowing ? -1 : 1

    const riskDifference = (riskPriority[left.riskLevel] ?? 4)
        - (riskPriority[right.riskLevel] ?? 4)
    if (riskDifference !== 0) return riskDifference

    const leftOverdue = left.timeStatus === 'OVERDUE'
    const rightOverdue = right.timeStatus === 'OVERDUE'
    if (leftOverdue !== rightOverdue) return leftOverdue ? -1 : 1

    const leftDeadline = Date.parse(left.deadlineAt)
    const rightDeadline = Date.parse(right.deadlineAt)
    const leftValid = Number.isFinite(leftDeadline)
    const rightValid = Number.isFinite(rightDeadline)
    if (leftValid !== rightValid) return leftValid ? -1 : 1
    if (!leftValid) return 0

    return leftOverdue
        ? rightDeadline - leftDeadline
        : leftDeadline - rightDeadline
}

export default function ProcessingCases() {
    const location = useLocation()
    const {sidebarCollapsed} = useSelector((state) => state.ui)
    const [cases, setCases] = useState([])
    const [catalogOptions, setCatalogOptions] = useState({field: [], department: [], officer: []})
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState('')
    const [activeTab, setActiveTab] = useState('Rất cao')
    const [draftFilters, setDraftFilters] = useState(emptyFilters)
    const [appliedFilters, setAppliedFilters] = useState(emptyFilters)
    const [selectedIds, setSelectedIds] = useState([])
    const [detailCaseId, setDetailCaseId] = useState(null)
    const [detailData, setDetailData] = useState(null)
    const [detailLoading, setDetailLoading] = useState(false)
    const [detailError, setDetailError] = useState('')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [bulkAction, setBulkAction] = useState(null)
    const [bulkChannels, setBulkChannels] = useState(emptyBulkChannels)
    const [confirmModalOpen, setConfirmModalOpen] = useState(false)
    const [actionSubmitting, setActionSubmitting] = useState(false)
    const [feedback, setFeedback] = useState('')

    const loadCases = useCallback(async () => {
        setLoading(true)
        setLoadError('')
        try {
            const [caseItems, fields, departments, officers] = await Promise.all([
                getProcessingCases(),
                getFields(),
                getDepartments(),
                getOfficers(),
            ])
            setCases(caseItems)
            setCatalogOptions({
                field: fields.map((item) => item.name),
                department: departments.map((item) => item.name),
                officer: officers.filter((item) => item.active).map((item) => item.name),
            })
        } catch (error) {
            setLoadError(getApiErrorMessage(error, 'Không thể tải danh sách hồ sơ. Vui lòng thử lại.'))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadCases()
    }, [loadCases])

    useEffect(() => {
        if (detailCaseId == null) {
            setDetailData(null)
            setDetailError('')
            return undefined
        }

        let active = true
        setDetailLoading(true)
        setDetailError('')
        getCaseById(detailCaseId)
            .then((item) => {
                if (active) setDetailData(item)
            })
            .catch((error) => {
                if (active) setDetailError(getApiErrorMessage(error, 'Không thể tải chi tiết hồ sơ.'))
            })
            .finally(() => {
                if (active) setDetailLoading(false)
            })

        return () => {
            active = false
        }
    }, [detailCaseId])

    useEffect(() => {
        const requestedCase = location.state?.caseId
        if (!requestedCase || cases.length === 0) return
        const match = cases.find((item) => item.caseCode === requestedCase || item.id === requestedCase)
        if (match) setDetailCaseId(match.id)
    }, [cases, location.state])

    const filterOptions = useMemo(() => ({
        field: catalogOptions.field,
        department: catalogOptions.department,
        officer: catalogOptions.officer,
        status: ['Đang xử lý', 'Chờ xác nhận', 'Đã xác nhận'],
    }), [catalogOptions])

    const filteredCases = useMemo(() => {
        const filtered = cases.filter((item) => {
            const tabMatches = activeTab === 'all'
                || (riskLevelByTab[activeTab] && item.riskLevel === riskLevelByTab[activeTab])
                || item.status === activeTab
            const localQuery = normalizeSearch(appliedFilters.query)
            const searchableText = normalizeSearch([
                item.caseCode,
                item.procedure,
                item.field,
                item.department,
                item.officer,
                item.applicant,
            ].join(' '))

            return tabMatches
                && (!localQuery || searchableText.includes(localQuery))
                && (appliedFilters.field === 'all' || item.field === appliedFilters.field)
                && (appliedFilters.department === 'all' || item.department === appliedFilters.department)
                && (appliedFilters.officer === 'all' || item.officer === appliedFilters.officer)
                && (appliedFilters.status === 'all' || item.status === appliedFilters.status)
        })
        return [...filtered].sort(compareCasesByRiskAndDeadline)
    }, [activeTab, appliedFilters, cases])

    const totalPages = Math.max(1, Math.ceil(filteredCases.length / pageSize))
    const pageCases = filteredCases.slice((page - 1) * pageSize, page * pageSize)
    const detailCaseFromList = cases.find((item) => item.id === detailCaseId) || null
    const detailCase = detailData
        ? {
            ...detailData,
            predictedProcessingHours: detailCaseFromList?.predictedProcessingHours ?? null,
            modelVersion: detailCaseFromList?.modelVersion ?? null,
            slaHours: detailCaseFromList?.slaHours ?? null,
            riskRatio: detailCaseFromList?.riskRatio ?? null,
            riskLevel: detailCaseFromList?.riskLevel ?? null,
            riskLabel: detailCaseFromList?.riskLabel || 'Chưa có AI',
            timeStatus: detailCaseFromList?.timeStatus ?? null,
            risk: detailCaseFromList?.risk ?? null,
            isFollowing: detailCaseFromList?.isFollowing ?? detailData.isFollowing,
        }
        : detailCaseFromList
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
    }, [activeTab, appliedFilters, page, pageSize])

    const updateCase = (caseId, changes) => {
        setCases((currentCases) => currentCases.map((item) => (
            item.id === caseId ? {...item, ...changes} : item
        )))
        setDetailData((current) => current?.id === caseId ? {...current, ...changes} : current)
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
        setBulkChannels((current) => ({...current, [channel]: !current[channel]}))
    }

    const handleConfirmBulkAction = async () => {
        if (!bulkAction || actionSubmitting) return

        const isConfirm = bulkAction === 'confirm'
        setActionSubmitting(true)
        try {
            const result = await performCaseBulkAction({
                case_ids: selectedIds,
                action: isConfirm ? 'CONFIRM' : 'FOLLOW',
                send_email: isConfirm && bulkChannels.email,
                send_sms: isConfirm && bulkChannels.sms,
                note: null,
            })
            const updatesByCaseId = new Map(
                result.results
                    .filter((item) => item.success)
                    .map((item) => [item.case_id, {
                        status: item.status,
                        isFollowing: item.is_following,
                    }]),
            )
            setCases((currentCases) => currentCases.map((item) => (
                updatesByCaseId.has(item.id)
                    ? {...item, ...updatesByCaseId.get(item.id)}
                    : item
            )))
            setDetailData((current) => (
                current && updatesByCaseId.has(current.id)
                    ? {...current, ...updatesByCaseId.get(current.id)}
                    : current
            ))
            setFeedback(
                (isConfirm
                    ? `Đã xác nhận ${result.success_count} hồ sơ.`
                    : `Đã thêm ${result.success_count} hồ sơ vào danh sách theo dõi.`)
                + ` Bỏ qua ${result.skipped_count} hồ sơ. `
                + `Thông báo gửi thất bại: ${result.failed_notification_count}.`,
            )
            setConfirmModalOpen(false)
            setSelectedIds([])
            setBulkAction(null)
            setBulkChannels(emptyBulkChannels)
        } catch (error) {
            setFeedback(getApiErrorMessage(error, 'Không thể thực hiện thao tác hàng loạt.'))
        } finally {
            setActionSubmitting(false)
        }
    }

    const handleDetailChannelChange = (channel) => {
        const hasChannel = detailCase.channels.includes(channel)
        updateCase(detailCase.id, {
            channels: hasChannel
                ? detailCase.channels.filter((item) => item !== channel)
                : [...detailCase.channels, channel],
        })
    }

    const handleDetailAction = async (action) => {
        if (!detailCase || actionSubmitting) return

        const isConfirm = action === 'CONFIRM'
        setActionSubmitting(true)
        try {
            const result = await performCaseAction(detailCase.id, {
                action,
                send_email: isConfirm && detailCase.channels.includes('Email'),
                send_sms: isConfirm && detailCase.channels.includes('SMS'),
                note: detailCase.note || null,
            })
            const failedNotifications = [result.email, result.sms].filter(
                (delivery) => delivery && !delivery.success,
            ).length
            updateCase(detailCase.id, {
                status: result.status,
                isFollowing: result.is_following,
            })
            setFeedback(isConfirm
                ? `Hồ sơ ${detailCase.caseCode} đã chuyển sang “${result.status}”.`
                + (failedNotifications ? ` Có ${failedNotifications} kênh thông báo gửi thất bại.` : '')
                : 'Đã thêm hồ sơ vào danh sách theo dõi.')
        } catch (error) {
            setFeedback(getApiErrorMessage(error, 'Không thể cập nhật hồ sơ.'))
        } finally {
            setActionSubmitting(false)
        }
    }

    return (
        <div className={`app-shell processing-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Sidebar/>
            <div className="app-main">
                <Header/>
                <main className="processing-page">
                    <div className={`case-workspace ${detailCase ? 'has-detail-panel' : ''}`}>
                        <div className="case-list-column">
                            <header className="processing-page-heading">
                                <h1>Hồ sơ đang xử lý</h1>
                                <p>Danh sách hồ sơ đang được xử lý. Bạn có thể theo dõi tiến độ, đánh giá rủi ro và thực
                                    hiện xác nhận.</p>
                            </header>

                            <RiskSummaryCards cases={cases}/>

                            {loading && <div
                                className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                                <LoaderCircle size={18} className="animate-spin"/> Đang tải dữ liệu hồ sơ...</div>}
                            {loadError && <div
                                className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                <span className="flex items-center gap-2"><AlertCircle size={18}/>{loadError}</span>
                                <button type="button" className="font-semibold underline" onClick={loadCases}>Thử lại
                                </button>
                            </div>}

                            <CaseStatusTabs activeTab={activeTab} cases={cases} onChange={(tab) => {
                                setPage(1)
                                setActiveTab(tab)
                            }}/>
                            <CaseFilterBar
                                filters={draftFilters}
                                options={filterOptions}
                                onChange={(key, value) => setDraftFilters((current) => ({...current, [key]: value}))}
                                onApply={() => {
                                    setPage(1)
                                    setAppliedFilters({...draftFilters})
                                }}
                            />

                            {feedback && (
                                <div className="case-feedback" role="status">
                                    <span>{feedback}</span>
                                    <button type="button" aria-label="Đóng thông báo" onClick={() => setFeedback('')}><X
                                        size={17}/></button>
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

                        {detailLoading && detailCaseId != null && <div
                            className="fixed right-4 top-20 z-[70] flex items-center gap-2 rounded-lg border border-blue-100 bg-white px-4 py-3 text-sm font-medium text-blue-700 shadow-lg">
                            <LoaderCircle size={17} className="animate-spin"/> Đang tải chi tiết...</div>}
                        {detailError && <div
                            className="fixed right-4 top-20 z-[70] max-w-sm rounded-lg border border-red-200 bg-white px-4 py-3 text-sm text-red-700 shadow-lg">{detailError}</div>}
                        <CaseDetailPanel
                            item={detailCase}
                            onClose={() => setDetailCaseId(null)}
                            onAction={handleDetailAction}
                            onChannelChange={handleDetailChannelChange}
                            onNoteChange={(note) => updateCase(detailCase.id, {note})}
                            submitting={actionSubmitting}
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
                submitting={actionSubmitting}
                onCancel={() => setConfirmModalOpen(false)}
                onConfirm={handleConfirmBulkAction}
            />
        </div>
    )
}
