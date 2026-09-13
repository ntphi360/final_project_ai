const tabs = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'PENDING', label: 'Chờ nhận' },
  { id: 'ACCEPTED', label: 'Đã nhận' },
  { id: 'REJECTED', label: 'Từ chối' },
]

export default function AssignedWorkTabs({ summary, activeTab, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Trạng thái việc được giao">
      {tabs.map((tab) => {
        const summaryKey = tab.id === 'ALL' ? 'total' : tab.id.toLowerCase()
        const count = summary[summaryKey] || 0
        return (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`h-10 shrink-0 rounded-md border px-4 text-sm font-semibold transition ${activeTab === tab.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            onClick={() => onChange(tab.id)}
            key={tab.id}
          >
            {tab.label} ({count})
          </button>
        )
      })}
    </div>
  )
}
