import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { formatCaseDateTime } from '../../utils/caseTime'
import RiskProgressBar from '../RiskProgressBar'
import CountdownText from './CountdownText'

function getVisiblePages(currentPage, totalPages) {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1)
  const start = Math.min(Math.max(currentPage - 2, 1), totalPages - 4)
  return Array.from({ length: 5 }, (_, index) => start + index)
}

function formatPredictionHours(value) {
  if (value == null) return null
  const hours = Number(value)
  return Number.isFinite(hours) ? `${hours.toFixed(2)} giờ` : null
}

export default function CaseTable({
  cases,
  totalCount,
  page,
  pageSize,
  selectedIds,
  onToggleCase,
  onTogglePage,
  onView,
  onPageChange,
  onPageSizeChange,
}) {
  const selectAllRef = useRef(null)
  const selectedOnPage = cases.filter((item) => selectedIds.includes(item.id)).length
  const allOnPageSelected = cases.length > 0 && selectedOnPage === cases.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const firstRecord = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const lastRecord = Math.min(page * pageSize, totalCount)

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedOnPage > 0 && !allOnPageSelected
    }
  }, [allOnPageSelected, selectedOnPage])

  return (
    <section className="case-table-card">
      <div className="case-table-scroll">
        <table className="processing-case-table">
          <thead>
            <tr>
              <th className="checkbox-column">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  aria-label="Chọn hồ sơ trên trang này"
                  checked={allOnPageSelected}
                  onChange={onTogglePage}
                />
              </th>
              <th>Mã hồ sơ</th>
              <th>Tên thủ tục</th>
              <th>Lĩnh vực</th>
              <th>Phòng ban</th>
              <th>Cán bộ phụ trách</th>
              <th>Ngày tiếp nhận</th>
              <th>Ngày hẹn trả</th>
              <th>Thời gian còn lại</th>
              <th>Thời gian dự kiến</th>
              <th>Tỷ lệ dự kiến / SLA</th>
              <th>Trạng thái</th>
              <th className="action-column">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((item) => {
              const predictionText = formatPredictionHours(item.predictedProcessingHours)
              const isOverdue = item.timeStatus === 'OVERDUE'
              return (
                <tr className={selectedIds.includes(item.id) ? 'is-selected' : ''} key={item.id}>
                  <td className="checkbox-column">
                    <input
                      type="checkbox"
                      aria-label={`Chọn hồ sơ ${item.id}`}
                      checked={selectedIds.includes(item.id)}
                      onChange={() => onToggleCase(item.id)}
                    />
                  </td>
                  <td><span className="case-code">{item.caseCode}</span></td>
                  <td><span className="table-ellipsis procedure-name" title={item.procedure}>{item.procedure}</span></td>
                  <td><span className="table-ellipsis" title={item.field}>{item.field}</span></td>
                  <td><span className="table-ellipsis" title={item.department}>{item.department}</span></td>
                  <td><span className="table-ellipsis" title={item.officer}>{item.officer}</span></td>
                  <td><span className="whitespace-nowrap tabular-nums">{formatCaseDateTime(item.receivedAt)}</span></td>
                  <td><span className="whitespace-nowrap tabular-nums">{formatCaseDateTime(item.deadlineAt)}</span></td>
                  <td><CountdownText deadlineAt={item.deadlineAt} /></td>
                  <td>
                    {predictionText ? (
                      <span className="flex flex-col gap-0.5 tabular-nums">
                        <strong className="font-semibold text-slate-700">{predictionText}</strong>
                        {item.modelVersion && (
                          <small className="text-[9px] font-medium uppercase text-slate-400">
                            {item.modelVersion}
                          </small>
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td>
                    <RiskProgressBar
                      value={item.risk}
                      riskLevel={item.riskLevel}
                      footer={isOverdue ? (
                        <small className="text-[9px] font-semibold text-red-600">
                          Đã quá hạn · {item.riskLabel}
                        </small>
                      ) : null}
                    />
                  </td>
                  <td><span className={`case-status-badge status-${item.status.replaceAll(' ', '-').toLowerCase()}`}>{item.status}</span></td>
                  <td className="action-column">
                    <button type="button" className="case-view-button" onClick={() => onView(item.id)}>
                      <Eye size={16} /> Xem
                    </button>
                  </td>
                </tr>
              )
            })}
            {cases.length === 0 && (
              <tr><td colSpan="13" className="case-empty-row">Không tìm thấy hồ sơ phù hợp.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="case-table-footer">
        <strong>Hiển thị {firstRecord} - {lastRecord} của {totalCount} hồ sơ</strong>
        <div className="case-pagination">
          <button type="button" aria-label="Trang trước" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft size={17} />
          </button>
          {getVisiblePages(page, totalPages).map((pageNumber) => (
            <button
              type="button"
              className={pageNumber === page ? 'is-active' : ''}
              onClick={() => onPageChange(pageNumber)}
              key={pageNumber}
            >
              {pageNumber}
            </button>
          ))}
          <button type="button" aria-label="Trang sau" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
            <ChevronRight size={17} />
          </button>
        </div>
        <label className="page-size-select">
          <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
            {[10, 20, 50].map((size) => <option value={size} key={size}>{size} / trang</option>)}
          </select>
        </label>
      </footer>
    </section>
  )
}
