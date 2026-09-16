import { AlertTriangle, ChevronDown, Eye, Filter, List } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setSelectedRisk } from '../../features/dashboard/dashboardSlice'
import Countdown from './Countdown'
import RiskBadge from './RiskBadge'

const pageSize = 5

function getVisiblePages(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }
  const start = Math.min(Math.max(currentPage - 2, 1), totalPages - 4)
  return Array.from({ length: 5 }, (_, index) => start + index)
}

export default function RiskCaseTable({ cases }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { selectedRisk, searchTerm } = useSelector((state) => state.dashboard)
  const [page, setPage] = useState(1)
  const filteredCases = useMemo(() => cases.filter((item) => {
    const matchesRisk = selectedRisk === 'ALL' || item.riskLevel === selectedRisk
    const query = searchTerm.trim().toLocaleLowerCase('vi')
    const matchesSearch = !query || Object.values(item).join(' ').toLocaleLowerCase('vi').includes(query)
    return matchesRisk && matchesSearch
  }), [cases, searchTerm, selectedRisk])
  const totalPages = Math.max(1, Math.ceil(filteredCases.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageCases = filteredCases.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )
  const firstRecord = filteredCases.length === 0
    ? 0
    : (currentPage - 1) * pageSize + 1
  const lastRecord = Math.min(currentPage * pageSize, filteredCases.length)

  useEffect(() => {
    setPage(1)
  }, [selectedRisk, searchTerm])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  return (
    <section className="risk-table-card">
      <div className="table-toolbar">
        <div className="table-title">
          <AlertTriangle size={23} fill="#ef3340" color="#ef3340" />
          <div>
            <h2>Hồ sơ theo mức độ rủi ro</h2>
            <p>Phân loại hồ sơ đang xử lý theo mức độ rủi ro AI</p>
          </div>
        </div>
        <div className="table-actions">
          <label className="filter-select">
            <Filter size={17} />
            <select
              value={selectedRisk}
              onChange={(event) => {
                setPage(1)
                dispatch(setSelectedRisk(event.target.value))
              }}
            >
              <option value="ALL">Tất cả mức độ</option>
              <option value="VERY_HIGH">Rất cao</option>
              <option value="HIGH">Cao</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="LOW">Thấp</option>
            </select>
            <ChevronDown size={15} />
          </label>
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate('/cases/processing', {
              state: { riskLevels: ['VERY_HIGH', 'HIGH'] },
            })}
          >
            <List size={18} />
            Xem tất cả cảnh báo
          </button>
        </div>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Mã hồ sơ</th>
              <th>Tên thủ tục</th>
              <th>Lĩnh vực</th>
              <th>Cán bộ phụ trách</th>
              <th>Hạn xử lý</th>
              <th>Còn lại</th>
              <th>Mức độ</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pageCases.map((item) => (
              <tr key={item.id}>
                <td><span className="font-semibold text-blue-700">{item.caseCode}</span></td>
                <td className="procedure-cell">{item.procedure}</td>
                <td>{item.field}</td>
                <td>
                  <span className="officer-name">{item.officer}</span>
                  <small>{item.department}</small>
                </td>
                <td>{item.dueDate}</td>
                <td><Countdown receivedAt={item.receivedAt} deadlineAt={item.deadlineAt} /></td>
                <td><RiskBadge riskLevel={item.riskLevel} /></td>
                <td>
                  <button
                    type="button"
                    className="outline-action"
                    onClick={() => navigate('/cases/processing', {
                      state: { caseId: item.caseId },
                    })}
                  >
                    <Eye size={15} /> Xem chi tiết <ChevronDown size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredCases.length === 0 && (
              <tr><td colSpan="8" className="empty-row">Không tìm thấy hồ sơ phù hợp.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>Hiển thị {firstRecord} - {lastRecord} trong tổng số {filteredCases.length} hồ sơ</span>
        <div className="pagination" aria-label="Phân trang">
          <button
            type="button"
            aria-label="Trang trước"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            ‹
          </button>
          {getVisiblePages(currentPage, totalPages).map((pageNumber) => (
            <button
              type="button"
              className={pageNumber === currentPage ? 'active' : ''}
              onClick={() => setPage(pageNumber)}
              key={pageNumber}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            aria-label="Trang sau"
            disabled={currentPage === totalPages}
            onClick={() => setPage(currentPage + 1)}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  )
}
