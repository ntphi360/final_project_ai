import { AlertTriangle, ChevronDown, Eye, Filter, List, SlidersHorizontal } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedRisk } from '../../features/dashboard/dashboardSlice'
import Countdown from './Countdown'
import RiskBadge from './RiskBadge'

const riskColors = {
  Thấp: '#20b99a',
  'Trung bình': '#f6b908',
  Cao: '#ff7917',
  'Nghiêm trọng': '#ef3340',
}

export default function RiskCaseTable({ cases }) {
  const dispatch = useDispatch()
  const { selectedRisk, searchTerm } = useSelector((state) => state.dashboard)
  const filteredCases = cases.filter((item) => {
    const matchesRisk = selectedRisk === 'Tất cả mức độ' || item.level === selectedRisk
    const query = searchTerm.trim().toLocaleLowerCase('vi')
    const matchesSearch = !query || Object.values(item).join(' ').toLocaleLowerCase('vi').includes(query)
    return matchesRisk && matchesSearch
  })

  return (
    <section className="risk-table-card">
      <div className="table-toolbar">
        <div className="table-title">
          <AlertTriangle size={23} fill="#ef3340" color="#ef3340" />
          <div>
            <h2>Hồ sơ có nguy cơ trễ hạn mới nhất (Cần chú ý)</h2>
            <p>Danh sách ưu tiên xử lý, đề xuất từ mô hình AI</p>
          </div>
        </div>
        <div className="table-actions">
          <label className="filter-select">
            <Filter size={17} />
            <select value={selectedRisk} onChange={(event) => dispatch(setSelectedRisk(event.target.value))}>
              <option>Tất cả mức độ</option>
              <option>Thấp</option>
              <option>Trung bình</option>
              <option>Cao</option>
              <option>Nghiêm trọng</option>
            </select>
            <ChevronDown size={15} />
          </label>
          <button type="button" className="primary-button">
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
              <th>Nguy cơ AI</th>
              <th>Mức độ</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map((item) => (
              <tr key={item.id}>
                <td><a href={`#${item.id}`}>{item.id}</a></td>
                <td className="procedure-cell">{item.procedure}</td>
                <td>{item.field}</td>
                <td>
                  <span className="officer-name">{item.officer}</span>
                  <small>{item.department}</small>
                </td>
                <td>{item.dueDate}</td>
                <td><Countdown seconds={item.remainingSeconds} level={item.level} /></td>
                <td>
                  <div className="risk-meter">
                    <span><i style={{ width: `${item.risk}%`, backgroundColor: riskColors[item.level] }} /></span>
                    <b style={{ color: riskColors[item.level] }}>{item.risk.toFixed(1)}%</b>
                  </div>
                </td>
                <td><RiskBadge level={item.level} /></td>
                <td>
                  {item.level === 'Thấp' ? (
                    <button type="button" className="outline-action"><Eye size={15} /> Xem chi tiết <ChevronDown size={15} /></button>
                  ) : (
                    <button type="button" className="row-action"><SlidersHorizontal size={16} /> Xem &amp; Xác nhận</button>
                  )}
                </td>
              </tr>
            ))}
            {filteredCases.length === 0 && (
              <tr><td colSpan="9" className="empty-row">Không tìm thấy hồ sơ phù hợp.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>Hiển thị 1 - {filteredCases.length} trong tổng số 27 hồ sơ</span>
        <div className="pagination" aria-label="Phân trang">
          <button type="button" disabled>‹</button>
          {[1, 2, 3, 4, 5].map((page) => <button type="button" className={page === 1 ? 'active' : ''} key={page}>{page}</button>)}
          <button type="button">›</button>
        </div>
      </div>
    </section>
  )
}
