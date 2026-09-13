import { AlertCircle, X } from 'lucide-react'

const actionLabels = {
  follow: 'theo dõi thêm',
  confirm: 'xác nhận',
}

export default function BulkConfirmModal({
  open,
  action,
  selectedCount,
  validCount,
  skippedCount,
  channels,
  onCancel,
  onConfirm,
}) {
  if (!open) return null

  const canSendNotifications = action === 'confirm'

  return (
    <div className="bulk-modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <section
        className="bulk-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-confirm-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="bulk-modal-close" aria-label="Đóng" onClick={onCancel}>
          <X size={19} />
        </button>
        <span className="bulk-modal-icon"><AlertCircle size={25} /></span>
        <h2 id="bulk-confirm-title">Xác nhận thao tác hàng loạt</h2>
        <p>Bạn sắp {actionLabels[action]} <strong>{validCount} hồ sơ</strong> trong tổng số {selectedCount} hồ sơ đã chọn.</p>
        {skippedCount > 0 && <p className="bulk-skip-note">{skippedCount} hồ sơ không hợp lệ sẽ được bỏ qua.</p>}
        <dl className="bulk-confirm-details">
          <div><dt>Email</dt><dd>{canSendNotifications && channels.email ? 'Có' : 'Không'}</dd></div>
          <div><dt>SMS</dt><dd>{canSendNotifications && channels.sms ? 'Có' : 'Không'}</dd></div>
        </dl>
        <div className="bulk-modal-actions">
          <button type="button" className="secondary-modal-button" onClick={onCancel}>Hủy</button>
          <button type="button" className="primary-modal-button" onClick={onConfirm}>Xác nhận</button>
        </div>
      </section>
    </div>
  )
}
