import {Filter, RotateCcw, Search} from 'lucide-react'

export default function AssignmentTrackingFilter({filters, options, onChange, onApply, onReset}) {
    return (
        <form
            className="grid gap-2 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm sm:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-[minmax(220px,1.4fr)_repeat(6,minmax(120px,0.8fr))_90px_90px] 2xl:items-end"
            onSubmit={(event) => {
                event.preventDefault();
                onApply()
            }}>
            <label className="relative sm:col-span-2 xl:col-span-2 2xl:col-span-1">
                <span className="sr-only">Tìm kiếm giao việc</span>
                <Search size={17}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input type="search" value={filters.query} placeholder="Tìm kiếm mã hồ sơ, tên thủ tục..."
                       className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                       onChange={(event) => onChange('query', event.target.value)}/>
            </label>

            <FilterSelect label="Người giao" value={filters.assignerId} options={options.officers}
                          onChange={(value) => onChange('assignerId', value)}/>
            <FilterSelect label="Người nhận" value={filters.assigneeId} options={options.officers}
                          onChange={(value) => onChange('assigneeId', value)}/>
            <FilterSelect label="Phòng ban" value={filters.departmentId} options={options.departments}
                          onChange={(value) => onChange('departmentId', value)}/>
            <label>
                <span className="mb-1 block text-xs font-medium text-slate-600">Trạng thái</span>
                <select value={filters.status}
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        onChange={(event) => onChange('status', event.target.value)}>
                    <option value="all">Tất cả</option>
                    <option value="PENDING">Chờ nhận</option>
                    <option value="ACCEPTED">Đã nhận</option>
                    <option value="REJECTED">Từ chối</option>
                </select>
            </label>
            <DateFilter label="Từ ngày" value={filters.from} onChange={(value) => onChange('from', value)}/>
            <DateFilter label="Đến ngày" value={filters.to} onChange={(value) => onChange('to', value)}/>

            <button type="submit"
                    className="flex h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                <Filter size={16}/> Lọc
            </button>
            <button type="button"
                    className="flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    onClick={onReset}><RotateCcw size={16}/> Đặt lại
            </button>
        </form>
    )
}

function FilterSelect({label, value, options, onChange}) {
    return (
        <label>
            <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
            <select value={value}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    onChange={(event) => onChange(event.target.value)}>
                <option value="all">Tất cả</option>
                {options.map((option) => <option value={option.id} key={option.id}>{option.name}</option>)}
            </select>
        </label>
    )
}

function DateFilter({label, value, onChange}) {
    return (
        <label>
            <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
            <input type="date" value={value}
                   className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                   onChange={(event) => onChange(event.target.value)}/>
        </label>
    )
}
