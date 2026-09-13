import {
  BellRing,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Clipboard,
  Clock3,
  Copy,
  Eye,
  FileText,
  Gauge,
  Mail,
  MapPin,
  Phone,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react'
import CountdownText from './CountdownText'

function formatDateTime(value) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatDate(value) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function getRiskColor(risk) {
  if (risk >= 80) return '#ef3340'
  if (risk >= 60) return '#f97316'
  if (risk >= 40) return '#f4b000'
  return '#16b779'
}

const detailRows = [
  { key: 'field', label: 'Lĩnh vực', icon: MapPin },
  { key: 'department', label: 'Phòng ban', icon: BriefcaseBusiness },
  { key: 'officer', label: 'Cán bộ phụ trách', icon: UsersRound },
]

export default function CaseDetailPanel({ item, onClose, onStatusChange, onChannelChange, onNoteChange }) {
  if (!item) return null

  const riskColor = getRiskColor(item.risk)
  const aiMessage = item.risk >= 60
    ? 'Có nguy cơ trễ hạn. Cần theo dõi chặt chẽ tiến độ và xác nhận xử lý.'
    : 'Tiến độ hiện tại tương đối ổn định. Tiếp tục theo dõi thời hạn xử lý.'

  return (
    <aside className="case-detail-panel" aria-label={`Thông tin chi tiết hồ sơ ${item.caseCode}`}>
      <header className="detail-panel-title">
        <h2>Thông tin chi tiết</h2>
        <button type="button" aria-label="Đóng panel" onClick={onClose}><X size={21} /></button>
      </header>

      <div className="detail-panel-scroll">
        <section className="detail-case-heading">
          <span className="detail-file-icon"><FileText size={23} /></span>
          <div>
            <strong>Mã hồ sơ: {item.caseCode}</strong>
            <span>{item.procedure}</span>
          </div>
          <button type="button" className="copy-case-code" aria-label="Sao chép mã hồ sơ"><Copy size={16} /></button>
          <span className={`priority-badge priority-${item.priority.replaceAll(' ', '-').toLowerCase()}`}>
            <Gauge size={14} /> {item.priority}
          </span>
        </section>

        <section className="detail-block">
          <h3><MapPin size={16} /> Thông tin chung</h3>
          <dl className="detail-list">
            {detailRows.map(({ key, label, icon: Icon }) => (
              <div key={key}><dt><Icon size={15} /> {label}</dt><dd>{item[key]}</dd></div>
            ))}
            <div><dt><CalendarDays size={15} /> Ngày tiếp nhận</dt><dd>{formatDateTime(item.receivedAt)}</dd></div>
            <div><dt><Clock3 size={15} /> Hạn xử lý</dt><dd>{formatDate(item.deadlineAt)}</dd></div>
            <div><dt><Clock3 size={15} /> Còn lại</dt><dd><CountdownText deadlineAt={item.deadlineAt} emphasize /></dd></div>
            <div><dt><Clipboard size={15} /> Trạng thái hiện tại</dt><dd><span className={`case-status-badge status-${item.status.replaceAll(' ', '-').toLowerCase()}`}>{item.status}</span></dd></div>
            <div><dt><Gauge size={15} /> Mức độ ưu tiên</dt><dd><span className={`priority-text priority-${item.priority.replaceAll(' ', '-').toLowerCase()}`}>{item.priority}</span></dd></div>
          </dl>
        </section>

        <section className="detail-block ai-risk-block">
          <h3><Gauge size={16} /> Đánh giá rủi ro AI <span className="info-dot">i</span></h3>
          <div className="detail-risk-grid">
            <div>
              <span>Nguy cơ trễ hạn</span>
              <strong style={{ color: riskColor }}>{item.risk}%</strong>
              <div className="detail-risk-progress"><i style={{ width: `${item.risk}%`, backgroundColor: riskColor }} /></div>
            </div>
            <div>
              <span>Thời gian còn lại</span>
              <CountdownText deadlineAt={item.deadlineAt} emphasize />
            </div>
          </div>
          <div className="ai-assessment"><strong>Nhận định của AI</strong><p>{aiMessage}</p></div>
        </section>

        <section className="detail-block">
          <h3><Clipboard size={16} /> Thao tác xử lý</h3>
          <div className="detail-action-buttons">
            <button type="button" className="detail-confirm-button" onClick={() => onStatusChange('Đã xác nhận')}>
              <Check size={18} /> Xác nhận
            </button>
            <button type="button" className="detail-follow-button" onClick={() => onStatusChange('Chờ xác nhận')}>
              <Eye size={18} /> Theo dõi thêm
            </button>
          </div>
        </section>

        <section className="detail-block">
          <h3><BellRing size={16} /> Thông tin bổ sung</h3>
          <div className="detail-channel-row">
            <span><BellRing size={15} /> Phương thức gửi cảnh báo</span>
            <label><input type="checkbox" checked={item.channels.includes('Email')} onChange={() => onChannelChange('Email')} /> Email</label>
            <label><input type="checkbox" checked={item.channels.includes('SMS')} onChange={() => onChannelChange('SMS')} /> SMS</label>
          </div>
          <dl className="detail-list compact">
            <div><dt><UserRound size={15} /> Người nộp hồ sơ</dt><dd>{item.applicant}</dd></div>
            <div><dt><Phone size={15} /> Số điện thoại</dt><dd>{item.phone}</dd></div>
            <div><dt><Mail size={15} /> Email</dt><dd className="detail-email">{item.email}</dd></div>
          </dl>
        </section>

        <section className="detail-note-block">
          <h3>Ghi chú</h3>
          <textarea
            maxLength={500}
            value={item.note}
            placeholder="Nhập ghi chú về hồ sơ..."
            onChange={(event) => onNoteChange(event.target.value)}
          />
          <span>{item.note.length}/500</span>
        </section>
      </div>
    </aside>
  )
}
