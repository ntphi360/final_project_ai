import { AlertCircle, CheckCircle2, Info, LoaderCircle, Play, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import ImportDropzone from '../components/data-import/ImportDropzone'
import ImportErrorModal from '../components/data-import/ImportErrorModal'
import ImportHistoryDetail from '../components/data-import/ImportHistoryDetail'
import ImportHistoryTable from '../components/data-import/ImportHistoryTable'
import ImportSummary from '../components/data-import/ImportSummary'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'
import { getImportHistory, getImportHistoryDetail, importCases } from '../services/importService'
import { getApiErrorMessage } from '../services/serviceUtils'

const allowedExtensions = ['.csv', '.xlsx', '.xls']
const maxFileSize = 20 * 1024 * 1024

export default function DataImport() {
  const { sidebarCollapsed } = useSelector((state) => state.ui)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState('')
  const [historyPage, setHistoryPage] = useState(1)
  const [detailItem, setDetailItem] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [visibleErrors, setVisibleErrors] = useState(null)
  const [toast, setToast] = useState('')
  const [apiError, setApiError] = useState('')

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)
    setHistoryError('')
    try {
      setHistory(await getImportHistory())
    } catch (error) {
      setHistoryError(getApiErrorMessage(error, 'Không thể tải lịch sử import.'))
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  useEffect(() => {
    if (!toast) return undefined
    const toastTimer = window.setTimeout(() => setToast(''), 4000)
    return () => window.clearTimeout(toastTimer)
  }, [toast])

  const openHistoryDetail = async (historyId) => {
    setDetailLoading(true)
    setHistoryError('')
    try {
      setDetailItem(await getImportHistoryDetail(historyId))
    } catch (error) {
      setHistoryError(getApiErrorMessage(error, 'Không thể tải chi tiết lịch sử import.'))
    } finally {
      setDetailLoading(false)
    }
  }

  const validateFile = (file) => {
    const name = file.name.toLowerCase()
    if (!allowedExtensions.some((extension) => name.endsWith(extension))) {
      setSelectedFile(null)
      setFileError('Định dạng file không được hỗ trợ.')
      setResult(null)
      return
    }
    if (file.size > maxFileSize) {
      setSelectedFile(null)
      setFileError('File vượt quá dung lượng cho phép.')
      setResult(null)
      return
    }
    setSelectedFile(file)
    setFileError('')
    setApiError('')
    setResult(null)
  }

  const processImport = async () => {
    if (!selectedFile || fileError || processing) return
    setProcessing(true)
    setApiError('')
    try {
      const data = await importCases(selectedFile)
      const errors = data.error_records > 0
        ? [{ row: '—', message: `Backend ghi nhận ${data.error_records} bản ghi lỗi nhưng chưa trả chi tiết từng dòng.` }]
        : []
      const importResult = {
        fileName: selectedFile.name,
        totalRows: data.total_records,
        createdRows: data.inserted_records,
        successRows: data.inserted_records + data.updated_records,
        skippedRows: data.skipped_records,
        errorRows: data.error_records,
        errors,
        insertedRows: data.inserted_records,
        updatedRows: data.updated_records,
        unmappedRows: data.unmapped_relation_records,
        fieldMismatchRows: data.field_mismatch_records,
        completedRows: data.completed_records,
        processingRows: data.processing_records,
      }
      setResult(importResult)
      await loadHistory()
      setHistoryPage(1)
      setToast(`Import hoàn tất: thêm ${data.inserted_records}, cập nhật ${data.updated_records}, lỗi ${data.error_records}.`)
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'Không thể import dữ liệu. Vui lòng kiểm tra file và thử lại.'))
      await loadHistory()
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className={`app-shell processing-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar />
      <div className="app-main">
        <Header />
        <main className="px-4 pb-10 pt-4 sm:px-5 xl:px-6">
          <header className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 lg:text-[29px]">Import dữ liệu</h1>
            <p className="mt-1 text-sm text-slate-500">Tải lên và xử lý dữ liệu hồ sơ</p>
          </header>

          <div className="grid items-start gap-4 lg:grid-cols-[minmax(300px,35fr)_minmax(0,65fr)]">
            <div className="space-y-3">
              {apiError && <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{apiError}</span></div>}
              <ImportDropzone file={selectedFile} error={fileError} onSelect={validateFile} onRemove={() => { setSelectedFile(null); setFileError(''); setApiError(''); setResult(null) }} />
              <button type="button" disabled={!selectedFile || Boolean(fileError) || processing} className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300" onClick={processImport}>
                {processing ? <><LoaderCircle size={18} className="animate-spin" /> Đang xử lý...</> : <><Play size={18} /> Xử lý dữ liệu</>}
              </button>
              <ImportSummary result={result} onViewErrors={() => setVisibleErrors(result.errors)} />
            </div>

            <div className="space-y-2">
              {historyError && <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{historyError}</span></div>}
              {historyLoading ? <div className="flex min-h-40 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm text-slate-500"><LoaderCircle size={18} className="mr-2 animate-spin" /> Đang tải lịch sử import...</div> : <ImportHistoryTable items={history} page={historyPage} pageSize={10} onPageChange={setHistoryPage} onView={openHistoryDetail} />}
            </div>
          </div>

          <section className="mt-4 flex gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-slate-600">
            <Info size={20} className="mt-0.5 shrink-0 text-blue-600" />
            <div><p>Sau khi import, hệ thống sẽ tự động kiểm tra dữ liệu trùng và cập nhật.</p><p>Dữ liệu hồ sơ đã hoàn thành sẽ được sử dụng để huấn luyện/đánh giá model khi thực hiện chức năng AI.</p></div>
          </section>
        </main>
      </div>

      <ImportHistoryDetail item={detailItem} onClose={() => setDetailItem(null)} onViewErrors={setVisibleErrors} />
      {detailLoading && <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/15"><span className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm text-slate-600 shadow-xl"><LoaderCircle size={18} className="animate-spin" /> Đang tải chi tiết...</span></div>}
      <ImportErrorModal open={Boolean(visibleErrors)} errors={visibleErrors || []} onClose={() => setVisibleErrors(null)} />

      {toast && <div className="fixed bottom-5 right-5 z-[90] flex max-w-sm items-center gap-3 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-xl" role="status"><CheckCircle2 size={20} /><span>{toast}</span><button type="button" aria-label="Đóng thông báo" className="ml-2 text-slate-400 hover:text-slate-600" onClick={() => setToast('')}><X size={17} /></button></div>}
    </div>
  )
}
