import { ChevronDown, Filter, Search } from 'lucide-react'

const filterDefinitions = [
  { key: 'field', label: 'Lĩnh vực' },
  { key: 'department', label: 'Phòng ban' },
  { key: 'officer', label: 'Cán bộ phụ trách' },
  { key: 'status', label: 'Trạng thái' },
]

export default function CaseFilterBar({ filters, options, onChange, onApply }) {
  return (
    <form
      className="case-filter-bar"
      onSubmit={(event) => {
        event.preventDefault()
        onApply()
      }}
    >
      <label className="case-search-control">
        <Search size={17} />
        <input
          type="search"
          value={filters.query}
          placeholder="Tìm kiếm mã hồ sơ, tên thủ tục..."
          onChange={(event) => onChange('query', event.target.value)}
        />
      </label>

      {filterDefinitions.map(({ key, label }) => (
        <label className="case-select-group" key={key}>
          <span>{label}</span>
          <span className="case-select-control">
            <select value={filters[key]} onChange={(event) => onChange(key, event.target.value)}>
              <option value="all">Tất cả</option>
              {options[key].map((option) => <option value={option} key={option}>{option}</option>)}
            </select>
            <ChevronDown size={15} />
          </span>
        </label>
      ))}

      <button type="submit" className="case-filter-button">
        <Filter size={18} />
        Lọc
      </button>
    </form>
  )
}
