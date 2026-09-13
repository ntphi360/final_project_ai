import { Filter, RotateCcw, Search } from 'lucide-react'
import { roleOptions } from '../../data/mockUsers'

export default function UserFilterBar({ filters, departments, onChange, onApply, onReset }) {
  return (
    <form className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-2 xl:grid-cols-[minmax(260px,1.6fr)_repeat(3,minmax(150px,1fr))_90px_90px] xl:items-end" onSubmit={(event) => { event.preventDefault(); onApply() }}>
      <label className="relative sm:col-span-2 xl:col-span-1"><span className="sr-only">Tìm kiếm người dùng</span><Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="search" value={filters.query} placeholder="Tìm kiếm họ tên, email..." className="h-10 w-full rounded-md border border-slate-200 pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" onChange={(event) => onChange('query', event.target.value)} /></label>
      <label><span className="mb-1 block text-xs font-medium text-slate-600">Vai trò</span><select value={filters.role} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" onChange={(event) => onChange('role', event.target.value)}><option value="all">Tất cả</option>{roleOptions.map((role) => <option value={role.value} key={role.value}>{role.label}</option>)}</select></label>
      <label><span className="mb-1 block text-xs font-medium text-slate-600">Phòng ban</span><select value={filters.department} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" onChange={(event) => onChange('department', event.target.value)}><option value="all">Tất cả</option>{departments.map((department) => <option value={department} key={department}>{department}</option>)}</select></label>
      <label><span className="mb-1 block text-xs font-medium text-slate-600">Trạng thái</span><select value={filters.status} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" onChange={(event) => onChange('status', event.target.value)}><option value="all">Tất cả</option><option value="active">Hoạt động</option><option value="locked">Đã khóa</option></select></label>
      <button type="submit" className="flex h-10 items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700"><Filter size={16} /> Lọc</button>
      <button type="button" className="flex h-10 items-center justify-center gap-1.5 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50" onClick={onReset}><RotateCcw size={16} /> Đặt lại</button>
    </form>
  )
}
