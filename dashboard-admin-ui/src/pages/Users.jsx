import { AlertCircle, CheckCircle2, LoaderCircle, UserPlus, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { getOfficers } from '../services/officerService'
import { getApiErrorMessage } from '../services/serviceUtils'
import { createUser, getUserById, getUsers, resetUserPassword, updateUser, updateUserStatus } from '../services/userService'

const emptyFilters = { query: '', role: 'all', department: 'all', status: 'all' }

function normalize(value) {
  return value.trim().toLocaleLowerCase('vi')
}

export default function Users() {
  const { sidebarCollapsed } = useSelector((state) => state.ui)
  const currentUserId = useSelector((state) => state.auth.user?.id)
  const [users, setUsers] = useState([])
  const [officers, setOfficers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [saving, setSaving] = useState(false)
  const [draftFilters, setDraftFilters] = useState(emptyFilters)
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detailId, setDetailId] = useState(null)
  const [formMode, setFormMode] = useState(null)
  const [formUserId, setFormUserId] = useState(null)
  const [statusTargetId, setStatusTargetId] = useState(null)
  const [resetTargetId, setResetTargetId] = useState(null)
  const [toast, setToast] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const [userItems, officerItems] = await Promise.all([getUsers(), getOfficers()])
      setUsers(userItems)
      setOfficers(officerItems)
    } catch (error) {
      setLoadError(getApiErrorMessage(error, 'Không thể tải danh sách người dùng.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filteredUsers = useMemo(() => users.filter((user) => {
    const query = normalize(appliedFilters.query)
    const searchable = normalize(`${user.fullName} ${user.email} ${user.phoneNumber} ${user.departmentName || ''}`)
    return (!query || searchable.includes(query))
      && (appliedFilters.role === 'all' || user.role === appliedFilters.role)
      && (appliedFilters.department === 'all' || user.departmentName === appliedFilters.department)
      && (appliedFilters.status === 'all' || (appliedFilters.status === 'active' ? user.isActive : !user.isActive))
  }), [appliedFilters, users])

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
    setActionError('')
    setFormMode('add')
    setFormUserId(null)
  }

  const openEditForm = (userId) => {
    setActionError('')
    setFormMode('edit')
    setFormUserId(userId)
  }

  const saveUser = async (form) => {
    setSaving(true)
    setActionError('')
    try {
      const saved = formMode === 'add' ? await createUser(form) : await updateUser(formUserId, form)
      await loadData()
      setDetailId(saved.id)
      setFormMode(null)
      setFormUserId(null)
      setToast(formMode === 'add' ? 'Đã thêm người dùng mới.' : 'Đã cập nhật thông tin người dùng.')
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Không thể lưu người dùng.'))
    } finally {
      setSaving(false)
    }
  }

  const confirmStatusChange = async () => {
    if (!statusTarget || (statusTarget.id === currentUserId && statusTarget.isActive)) return
    setSaving(true)
    try {
      const nextActive = !statusTarget.isActive
      await updateUserStatus(statusTarget.id, nextActive)
      await loadData()
      setToast(nextActive ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.')
      setStatusTargetId(null)
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Không thể cập nhật trạng thái tài khoản.'))
    } finally { setSaving(false) }
  }

  const openDetail = async (userId) => {
    setActionError('')
    try {
      const user = await getUserById(userId)
      setUsers((current) => current.map((item) => item.id === user.id ? user : item))
      setDetailId(user.id)
    } catch (error) { setActionError(getApiErrorMessage(error, 'Không thể tải chi tiết người dùng.')) }
  }

  const confirmPasswordReset = async (password) => {
    if (!resetTarget) return
    setSaving(true)
    setActionError('')
    try {
      await resetUserPassword(resetTarget.id, password)
      setResetTargetId(null)
      setToast('Đã đặt lại mật khẩu.')
    } catch (error) { setActionError(getApiErrorMessage(error, 'Không thể đặt lại mật khẩu.')) }
    finally { setSaving(false) }
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
        <Header />
        <main className="min-w-0 px-4 pb-10 pt-4 sm:px-5 xl:px-6">
          <header className="mb-4 flex items-start justify-between gap-4"><div><h1 className="text-2xl font-bold tracking-tight text-slate-950 lg:text-[29px]">Quản lý người dùng</h1><p className="mt-1 text-sm text-slate-500">Quản lý tài khoản và quyền truy cập hệ thống.</p></div><button type="button" className="flex h-10 shrink-0 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700" onClick={openAddForm}><UserPlus size={18} /> Thêm người dùng</button></header>
          <div className="space-y-3">
            {loading && <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700"><LoaderCircle size={18} className="animate-spin" /> Đang tải người dùng...</div>}
            {(loadError || actionError) && <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span className="flex items-center gap-2"><AlertCircle size={18} />{loadError || actionError}</span>{loadError && <button type="button" className="font-semibold underline" onClick={loadData}>Thử lại</button>}</div>}
            <UserSummaryCards users={users} />
            <UserFilterBar filters={draftFilters} officers={[...new Set(users.map((item) => item.officerName).filter(Boolean))]} onChange={(key, value) => setDraftFilters((current) => ({ ...current, [key]: value }))} onApply={() => { setPage(1); setAppliedFilters({ ...draftFilters }) }} onReset={resetFilters} />
            <UserTable users={pageUsers} totalCount={filteredUsers.length} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(size) => { setPage(1); setPageSize(size) }} onView={openDetail} />
          </div>
        </main>
      </div>

      <UserDetailPanel user={detailUser} currentUserId={currentUserId} onClose={() => setDetailId(null)} onEdit={() => openEditForm(detailUser.id)} onToggleStatus={() => setStatusTargetId(detailUser.id)} onResetPassword={() => setResetTargetId(detailUser.id)} />
      <UserFormModal open={Boolean(formMode)} mode={formMode} user={formUser} users={users} officers={officers} currentUserId={currentUserId} saving={saving} apiError={actionError} onClose={() => { setFormMode(null); setFormUserId(null); setActionError('') }} onSave={saveUser} />
      <UserStatusConfirmModal user={statusTarget} onCancel={() => setStatusTargetId(null)} onConfirm={confirmStatusChange} />
      <ResetPasswordModal user={resetTarget} loading={saving} error={actionError} onCancel={() => { setResetTargetId(null); setActionError('') }} onConfirm={confirmPasswordReset} />

      {toast && <div className="fixed bottom-5 right-5 z-[100] flex max-w-sm items-center gap-3 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-xl" role="status"><CheckCircle2 size={20} className="shrink-0" /><span>{toast}</span><button type="button" aria-label="Đóng thông báo" className="ml-2 text-slate-400 hover:text-slate-600" onClick={() => setToast('')}><X size={17} /></button></div>}
    </div>
  )
}
