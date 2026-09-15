import { CalendarDays, Filter, RotateCcw } from 'lucide-react'

const quickFilters = ['7 ngày', '30 ngày', '3 tháng', '6 tháng', 'Năm nay']

function SelectFilter({ label, value, options, onChange }) {
  return (
    <label>
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      <select value={value} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" onChange={(event) => onChange(event.target.value)}>
        <option value="all">Tất cả</option>
        {options.map((option) => {
          const optionValue = typeof option === 'object' ? option.value : option
          const optionLabel = typeof option === 'object' ? option.label : option
          return <option value={optionValue} key={optionValue}>{optionLabel}</option>
        })}
      </select>
    </label>
  )
}

export default function ReportFilterBar({ filters, options, quickFilter, onChange, onQuickFilter, onApply, onReset }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <form className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[repeat(5,minmax(0,1fr))_100px_88px] xl:items-end" onSubmit={(event) => { event.preventDefault(); onApply() }}>
        <label><span className="mb-1 block text-xs font-medium text-slate-600">Từ ngày</span><span className="relative block"><CalendarDays size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" /><input type="date" value={filters.from} className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" onChange={(event) => onChange('from', event.target.value)} /></span></label>
        <label><span className="mb-1 block text-xs font-medium text-slate-600">Đến ngày</span><span className="relative block"><CalendarDays size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" /><input type="date" value={filters.to} className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" onChange={(event) => onChange('to', event.target.value)} /></span></label>
        <SelectFilter label="Lĩnh vực" value={filters.field} options={options.fields} onChange={(value) => onChange('field', value)} />
        <SelectFilter label="Phòng ban" value={filters.department} options={options.departments} onChange={(value) => onChange('department', value)} />
        <SelectFilter label="Cán bộ phụ trách" value={filters.officer} options={options.officers} onChange={(value) => onChange('officer', value)} />
        <button type="submit" className="flex h-10 items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700"><Filter size={16} /> Áp dụng</button>
        <button type="button" className="flex h-10 items-center justify-center gap-1.5 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50" onClick={onReset}><RotateCcw size={16} /> Đặt lại</button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {quickFilters.map((item) => <button type="button" className={`h-8 rounded-md border px-4 text-xs font-semibold transition ${quickFilter === item ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`} onClick={() => onQuickFilter(item)} key={item}>{item}</button>)}
      </div>
    </section>
  )
}
