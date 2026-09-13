import { Filter, Search } from 'lucide-react'

const selectFields = [
  { key: 'field', label: 'Lĩnh vực' },
  { key: 'department', label: 'Phòng ban' },
  { key: 'officer', label: 'Cán bộ hiện tại' },
  { key: 'status', label: 'Trạng thái' },
]

export default function AssignmentCaseFilter({ filters, options, onChange, onApply }) {
  return (
    <form
      className="grid gap-2 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_repeat(4,minmax(125px,0.8fr))_92px] xl:items-end"
      onSubmit={(event) => {
        event.preventDefault()
        onApply()
      }}
    >
      <label className="relative sm:col-span-2 xl:col-span-1">
        <span className="sr-only">Tìm kiếm hồ sơ</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
        <input
          type="search"
          value={filters.query}
          placeholder="Tìm kiếm mã hồ sơ, tên thủ tục..."
          className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          onChange={(event) => onChange('query', event.target.value)}
        />
      </label>

      {selectFields.map(({ key, label }) => (
        <label className="min-w-0" key={key}>
          <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
          <select
            value={filters[key]}
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            onChange={(event) => onChange(key, event.target.value)}
          >
            <option value="all">Tất cả</option>
            {options[key].map((option) => <option value={option} key={option}>{option}</option>)}
          </select>
        </label>
      ))}

      <button
        type="submit"
        className="flex h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        <Filter size={17} /> Lọc
      </button>
    </form>
  )
}
