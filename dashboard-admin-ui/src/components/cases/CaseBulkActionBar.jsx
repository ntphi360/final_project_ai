import { Check, Eye, RotateCcw } from 'lucide-react'

export default function CaseBulkActionBar({
  selectedCount,
  action,
  channels,
  onActionChange,
  onChannelChange,
  onClear,
  onApply,
}) {
  if (selectedCount === 0) return null

  const channelsEnabled = action === 'confirm'

  return (
    <section className="case-bulk-action-bar" aria-label="Thao tác hàng loạt">
      <strong>Đã chọn {selectedCount} hồ sơ</strong>
      <div className="bulk-action-choices">
        <button
          type="button"
          className={action === 'follow' ? 'is-active' : ''}
          onClick={() => onActionChange('follow')}
        >
          <Eye size={16} /> Theo dõi thêm
        </button>
        <button
          type="button"
          className={action === 'confirm' ? 'is-active' : ''}
          onClick={() => onActionChange('confirm')}
        >
          <Check size={16} /> Xác nhận
        </button>
      </div>
      <div className={`bulk-channel-options ${channelsEnabled ? '' : 'is-disabled'}`}>
        <span>Gửi cảnh báo:</span>
        <label>
          <input
            type="checkbox"
            checked={channels.email}
            disabled={!channelsEnabled}
            onChange={() => onChannelChange('email')}
          /> Email
        </label>
        <label>
          <input
            type="checkbox"
            checked={channels.sms}
            disabled={!channelsEnabled}
            onChange={() => onChannelChange('sms')}
          /> SMS
        </label>
      </div>
      <div className="bulk-bar-actions">
        <button type="button" className="bulk-clear-button" onClick={onClear}><RotateCcw size={15} /> Bỏ chọn</button>
        <button type="button" className="bulk-apply-button" disabled={!action} onClick={onApply}>Áp dụng</button>
      </div>
    </section>
  )
}
