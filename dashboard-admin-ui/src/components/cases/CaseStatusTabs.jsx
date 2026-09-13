import { AlertCircle, CircleCheck, Clock3, Layers3 } from 'lucide-react'

const tabDefinitions = [
  { id: 'all', label: 'Tất cả', icon: Layers3 },
  { id: 'Rất cao', label: 'Rất cao', icon: AlertCircle },
  { id: 'Cao', label: 'Cao', icon: AlertCircle },
  { id: 'Trung bình', label: 'Trung bình', icon: AlertCircle },
  { id: 'Chờ xác nhận', label: 'Chờ xác nhận', icon: Clock3 },
  { id: 'Đã xác nhận', label: 'Đã xác nhận', icon: CircleCheck },
]

export default function CaseStatusTabs({ activeTab, cases, onChange }) {
  const getCount = (tabId) => {
    if (tabId === 'all') return cases.length
    if (['Rất cao', 'Cao', 'Trung bình'].includes(tabId)) {
      return cases.filter((item) => item.priority === tabId).length
    }
    return cases.filter((item) => item.status === tabId).length
  }

  return (
    <div className="case-status-tabs" role="tablist" aria-label="Phân loại nhanh">
      {tabDefinitions.map(({ id, label, icon: Icon }) => (
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === id}
          disabled={['Rất cao', 'Cao', 'Trung bình'].includes(id)}
          title={['Rất cao', 'Cao', 'Trung bình'].includes(id) ? 'Chưa có dữ liệu AI' : undefined}
          className={`case-status-tab ${activeTab === id ? 'is-active' : ''} tab-${id.replaceAll(' ', '-').toLowerCase()}`}
          onClick={() => onChange(id)}
          key={id}
        >
          <Icon size={15} />
          <span>{label} ({['Rất cao', 'Cao', 'Trung bình'].includes(id) ? '—' : getCount(id)})</span>
        </button>
      ))}
    </div>
  )
}
