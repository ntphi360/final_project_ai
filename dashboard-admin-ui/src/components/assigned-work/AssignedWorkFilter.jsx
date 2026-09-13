import { Search } from 'lucide-react'

export default function AssignedWorkFilter({ filters, assigners, onChange, onApply }) {
  return (
    <form className="grid gap-2 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.4fr)_minmax(150px,0.8fr)_minmax(130px,0.7fr)_repeat(2,minmax(135px,0.7fr))_90px] xl:items-end" onSubmit={(event) => { event.preventDefault(); onApply() }}>
      <label className="relative sm:col-span-2 xl:col-span-1">
        <span className="sr-only">Tìm kiếm công việc</span>
        <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="search" value={filters.query} placeholder="Tìm mã hồ sơ, tên thủ tục..." className="h-10 w-full rounded-md border border-slate-200 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" onChange={(event) => onChange('query', event.target.value)} />
      </label>
      <label>
        <span className="mb-1 block text-xs font-medium text-slate-600">Người giao</span>
        <select value={filters.assignerId} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" onChange={(event) => onChange('assignerId', event.target.value)}>
          <option value="all">Tất cả</option>
          {assigners.map((assigner) => <option value={assigner.id} key={assigner.id}>{assigner.name}</option>)}
        </select>
      </label>
      <label>
        <span className="mb-1 block text-xs font-medium text-slate-600">Trạng thái</span>
        <select value={filters.status} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" onChange={(event) => onChange('status', event.target.value)}>
          <option value="all">Tất cả</option>
          <option value="PENDING">Chờ nhận</option>
          <option value="ACCEPTED">Đã nhận</option>
          <option value="REJECTED">Từ chối</option>
        </select>
      </label>
      <label>
        <span className="mb-1 block text-xs font-medium text-slate-600">Từ ngày</span>
        <input type="date" value={filters.fromDate} className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" onChange={(event) => onChange('fromDate', event.target.value)} />
      </label>
      <label>
        <span className="mb-1 block text-xs font-medium text-slate-600">Đến ngày</span>
        <input type="date" value={filters.toDate} className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" onChange={(event) => onChange('toDate', event.target.value)} />
      </label>
      <button type="submit" className="flex h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
        <Search size={16} /> Lọc
      </button>
    </form>
  )
}
