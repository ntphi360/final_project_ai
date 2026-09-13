import { CheckCircle2, UserPlus, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'
import ResetPasswordModal from '../components/users/ResetPasswordModal'
import UserDetailPanel from '../components/users/UserDetailPanel'
import UserFilterBar from '../components/users/UserFilterBar'
import UserFormModal from '../components/users/UserFormModal'
import UserStatusConfirmModal from '../components/users/UserStatusConfirmModal'
import UserSummaryCards from '../components/users/UserSummaryCards'
import UserTable from '../components/users/UserTable'
import { currentUserId, departments, initialUsers } from '../data/mockUsers'

const emptyFilters = { query: '', role: 'all', department: 'all', status: 'all' }

function normalize(value) {
  return value.trim().toLocaleLowerCase('vi')
}

export default function Users() {
  const { sidebarCollapsed } = useSelector((state) => state.ui)
  const [users, setUsers] = useState(initialUsers)
  const [draftFilters, setDraftFilters] = useState(emptyFilters)
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters)
  const [globalSearch, setGlobalSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detailId, setDetailId] = useState(null)
  const [formMode, setFormMode] = useState(null)
  const [formUserId, setFormUserId] = useState(null)
  const [statusTargetId, setStatusTargetId] = useState(null)
  const [resetTargetId, setResetTargetId] = useState(null)
  const [toast, setToast] = useState('')

  const filteredUsers = useMemo(() => users.filter((user) => {
    const query = normalize(appliedFilters.query)
    const headerQuery = normalize(globalSearch)
    const searchable = normalize(`${user.fullName} ${user.email} ${user.phoneNumber} ${user.departmentName || ''}`)
    return (!query || searchable.includes(query))
      && (!headerQuery || searchable.includes(headerQuery))
      && (appliedFilters.role === 'all' || user.role === appliedFilters.role)
      && (appliedFilters.department === 'all' || user.departmentName === appliedFilters.department)
      && (appliedFilters.status === 'all' || (appliedFilters.status === 'active' ? user.isActive : !user.isActive))
  }), [appliedFilters, globalSearch, users])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const pageUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize)
  const detailUser = users.find((user) => user.id === detailId) || null
  const formUser = users.find((user) => user.id === formUserId) || null
  const statusTarget = users.find((user) => user.id === statusTargetId) || null
  const resetTarget = users.find((user) => user.id === resetTargetId) || null

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 4000)
    return () => window.clearTimeout(timer)
  }, [toast])

  const openAddForm = () => {
    setFormMode('add')
    setFormUserId(null)
  }

  const openEditForm = (userId) => {
    setFormMode('edit')
    setFormUserId(userId)
  }

  const saveUser = (form) => {
    const now = new Date().toISOString()
    const safeForm = { ...form }
    delete safeForm.password
    if (formMode === 'add') {
      const nextId = Math.max(...users.map((user) => user.id)) + 1
      const newUser = { ...safeForm, id: nextId, createdAt: now, updatedAt: now }
      setUsers((current) => [newUser, ...current])
      setDetailId(nextId)
      setToast('Đã thêm người dùng mới.')
    } else {
      const protectedForm = formUserId === currentUserId ? { ...safeForm, isActive: true } : safeForm
      setUsers((current) => current.map((user) => user.id === formUserId ? { ...user, ...protectedForm, updatedAt: now } : user))
      setDetailId(formUserId)
      setToast('Đã cập nhật thông tin người dùng.')
    }
    setFormMode(null)
    setFormUserId(null)
  }

  const confirmStatusChange = () => {
    if (!statusTarget || (statusTarget.id === currentUserId && statusTarget.isActive)) return
    const nextActive = !statusTarget.isActive
    setUsers((current) => current.map((user) => user.id === statusTarget.id ? { ...user, isActive: nextActive, updatedAt: new Date().toISOString() } : user))
    setToast(nextActive ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.')
    setStatusTargetId(null)
  }

  const resetFilters = () => {
    setDraftFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
    setPage(1)
  }

  return (
    <div className={`app-shell processing-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar />
      <div className="app-main">
        <Header showBreadcrumb={false} onSearch={setGlobalSearch} />
        <main className="min-w-0 px-4 pb-10 pt-4 sm:px-5 xl:px-6">
          <header className="mb-4 flex items-start justify-between gap-4"><div><p className="mb-2 text-xs text-slate-500">Trang chủ <span className="mx-1">›</span> Người dùng</p><h1 className="text-2xl font-bold tracking-tight text-slate-950 lg:text-[29px]">Quản lý người dùng</h1><p className="mt-1 text-sm text-slate-500">Quản lý tài khoản và quyền truy cập hệ thống.</p></div><button type="button" className="flex h-10 shrink-0 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700" onClick={openAddForm}><UserPlus size={18} /> Thêm người dùng</button></header>
          <div className="space-y-3">
            <UserSummaryCards users={users} />
            <UserFilterBar filters={draftFilters} departments={departments} onChange={(key, value) => setDraftFilters((current) => ({ ...current, [key]: value }))} onApply={() => { setPage(1); setAppliedFilters({ ...draftFilters }) }} onReset={resetFilters} />
            <UserTable users={pageUsers} totalCount={filteredUsers.length} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(size) => { setPage(1); setPageSize(size) }} onView={setDetailId} />
          </div>
        </main>
      </div>

      <UserDetailPanel user={detailUser} onClose={() => setDetailId(null)} onEdit={() => openEditForm(detailUser.id)} onToggleStatus={() => setStatusTargetId(detailUser.id)} onResetPassword={() => setResetTargetId(detailUser.id)} />
      <UserFormModal open={Boolean(formMode)} mode={formMode} user={formUser} users={users} onClose={() => { setFormMode(null); setFormUserId(null) }} onSave={saveUser} />
      <UserStatusConfirmModal user={statusTarget} onCancel={() => setStatusTargetId(null)} onConfirm={confirmStatusChange} />
      <ResetPasswordModal user={resetTarget} onCancel={() => setResetTargetId(null)} onConfirm={() => { setResetTargetId(null); setToast('Đã tạo mật khẩu tạm thời.') }} />

      {toast && <div className="fixed bottom-5 right-5 z-[100] flex max-w-sm items-center gap-3 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-xl" role="status"><CheckCircle2 size={20} className="shrink-0" /><span>{toast}</span><button type="button" aria-label="Đóng thông báo" className="ml-2 text-slate-400 hover:text-slate-600" onClick={() => setToast('')}><X size={17} /></button></div>}
    </div>
  )
}
