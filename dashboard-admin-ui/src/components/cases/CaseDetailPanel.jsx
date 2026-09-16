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
    Star,
    UserRound,
    UsersRound,
    X,
} from 'lucide-react'
import {formatCaseDateTime, formatProcessingDuration} from '../../utils/caseTime'
import RiskBadge from '../dashboard/RiskBadge'
import CountdownText from './CountdownText'

const detailRows = [
    {key: 'field', label: 'Lĩnh vực', icon: MapPin},
    {key: 'department', label: 'Phòng ban', icon: BriefcaseBusiness},
    {key: 'officer', label: 'Cán bộ phụ trách', icon: UsersRound},
]

export default function CaseDetailPanel({item, onClose, onAction, onChannelChange, onNoteChange, submitting = false}) {
    if (!item) return null

    return (
        <aside className="case-detail-panel" aria-label={`Thông tin chi tiết hồ sơ ${item.caseCode}`}>
            <header className="detail-panel-title">
                <h2>Thông tin chi tiết</h2>
                <button type="button" aria-label="Đóng panel" onClick={onClose}><X size={21}/></button>
            </header>

            <div className="detail-panel-scroll">
                <section className="detail-case-heading">
                    <span className="detail-file-icon"><FileText size={23}/></span>
                    <div>
                        <strong>Mã hồ sơ: {item.caseCode}</strong>
                        <span>{item.procedure}</span>
                    </div>
                    <button type="button" className="copy-case-code" aria-label="Sao chép mã hồ sơ"><Copy size={16}/>
                    </button>
                    {item.isFollowing &&
                        <span className="following-badge" title="Đang theo dõi"><Star size={13} fill="currentColor"/> Đang theo dõi</span>}
                </section>

                <section className="detail-block">
                    <h3><MapPin size={16}/> Thông tin chung</h3>
                    <dl className="detail-list">
                        {detailRows.map(({key, label, icon: Icon}) => (
                            <div key={key}>
                                <dt><Icon size={15}/> {label}</dt>
                                <dd>{item[key]}</dd>
                            </div>
                        ))}
                        <div>
                            <dt><Phone size={15}/> Số điện thoại cán bộ</dt>
                            <dd>{item.officerPhone || '—'}</dd>
                        </div>
                        <div>
                            <dt><Mail size={15}/> Email cán bộ</dt>
                            <dd className="detail-email">{item.officerEmail || '—'}</dd>
                        </div>
                        <div>
                            <dt><CalendarDays size={15}/> Ngày tiếp nhận</dt>
                            <dd>{formatCaseDateTime(item.receivedAt)}</dd>
                        </div>
                        <div>
                            <dt><CalendarDays size={15}/> Ngày hẹn trả</dt>
                            <dd>{formatCaseDateTime(item.deadlineAt)}</dd>
                        </div>
                        <div>
                            <dt><Clock3 size={15}/> Thời hạn xử lý</dt>
                            <dd>{formatProcessingDuration(item.receivedAt, item.deadlineAt)}</dd>
                        </div>
                        <div>
                            <dt><Clock3 size={15}/> Thời gian còn lại</dt>
                            <dd><CountdownText receivedAt={item.receivedAt} deadlineAt={item.deadlineAt} emphasize/></dd>
                        </div>
                        <div>
                            <dt><Clipboard size={15}/> Trạng thái hiện tại</dt>
                            <dd><span
                                className={`case-status-badge status-${item.status.replaceAll(' ', '-').toLowerCase()}`}>{item.status}</span>
                            </dd>
                        </div>
                    </dl>
                </section>

                <section className="detail-block ai-risk-block">
                    <h3><Gauge size={16}/> Đánh giá rủi ro AI <span className="info-dot">i</span></h3>
                    <div className="detail-risk-level">
                        <span>Mức độ rủi ro</span>
                        <RiskBadge riskLevel={item.riskLevel}/>
                    </div>
                </section>

                <section className="detail-block">
                    <h3><BellRing size={16}/> Thông tin bổ sung</h3>
                    <dl className="detail-list compact">
                        <div>
                            <dt><UserRound size={15}/> Người nộp hồ sơ</dt>
                            <dd>{item.applicant}</dd>
                        </div>
                        <div>
                            <dt><Phone size={15}/> Số điện thoại người nộp</dt>
                            <dd>{item.phone}</dd>
                        </div>
                        <div>
                            <dt><Mail size={15}/> Email người nộp</dt>
                            <dd className="detail-email">{item.applicantEmail || '—'}</dd>
                        </div>
                    </dl>
                </section>

                <section className="detail-block">
                    <h3><BellRing size={16}/> Kênh thông báo</h3>
                    <div className="detail-channel-row">
                        <label><input type="checkbox" checked={item.channels.includes('Email')}
                                      onChange={() => onChannelChange('Email')}/> Email</label>
                        <label><input type="checkbox" checked={item.channels.includes('SMS')}
                                      onChange={() => onChannelChange('SMS')}/> SMS</label>
                    </div>
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

                <section className="detail-block">
                    <h3><Clipboard size={16}/> Thao tác xử lý</h3>
                    <div className="detail-action-buttons">
                        <button
                            type="button"
                            className="detail-confirm-button"
                            disabled={submitting || item.status === 'Đã xác nhận'}
                            onClick={() => onAction('CONFIRM')}
                        >
                            <Check size={18}/> {submitting ? 'Đang xử lý...' : 'Xác nhận'}
                        </button>
                        <button
                            type="button"
                            className="detail-follow-button"
                            disabled={submitting || item.status !== 'Đang xử lý'}
                            onClick={() => onAction('FOLLOW')}
                        >
                            <Eye size={18}/> Theo dõi thêm
                        </button>
                    </div>
                </section>
            </div>
        </aside>
    )
}
