import {Eye, EyeOff, X} from 'lucide-react'
import {useEffect, useMemo, useState} from 'react'
import {getFieldsByDepartment} from '../../services/catalogService'
import {getApiErrorMessage} from '../../services/serviceUtils'
import {roleOptions} from '../../utils/user'

const emptyForm = {
    fullName: '',
    email: '',
    phoneNumber: '',
    role: 'OFFICER',
    officerId: '',
    createOfficer: false,
    departmentId: '',
    fieldIds: [],
    password: '',
    isActive: true,
}

function FieldError({message}) {
    return message ? <span className="mt-1 block text-xs text-red-600">{message}</span> : null
}

export default function UserFormModal({
                                          open,
                                          mode,
                                          user,
                                          users,
                                          officers,
                                          departments,
                                          saving,
                                          apiError,
                                          onClose,
                                          onSave
                                      }) {
    const [form, setForm] = useState(emptyForm)
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [departmentFields, setDepartmentFields] = useState([])
    const [fieldsLoading, setFieldsLoading] = useState(false)
    const [fieldsError, setFieldsError] = useState('')

    useEffect(() => {
        if (!open) return
        setForm(mode === 'edit'
            ? {
                ...emptyForm,
                ...user,
                phoneNumber: user?.phoneNumber || '',
                officerId: user?.officerId || '',
                password: '',
            }
            : {...emptyForm})
        setDepartmentFields([])
        setFieldsError('')
        setErrors({})
        setShowPassword(false)
    }, [mode, open, user])

    useEffect(() => {
        if (!open || !form.createOfficer || !form.departmentId) {
            setDepartmentFields([])
            setFieldsError('')
            return undefined
        }

        let cancelled = false
        setFieldsLoading(true)
        setFieldsError('')
        getFieldsByDepartment(form.departmentId)
            .then((items) => {
                if (!cancelled) setDepartmentFields(items)
            })
            .catch((error) => {
                if (!cancelled) {
                    setDepartmentFields([])
                    setFieldsError(getApiErrorMessage(error, 'Không thể tải lĩnh vực của phòng ban.'))
                }
            })
            .finally(() => {
                if (!cancelled) setFieldsLoading(false)
            })
        return () => {
            cancelled = true
        }
    }, [form.createOfficer, form.departmentId, open])

    const availableOfficers = useMemo(() => {
        const linkedOfficerIds = new Set(
            users
                .filter((item) => item.id !== user?.id && item.officerId)
                .map((item) => Number(item.officerId)),
        )
        return officers.filter((officer) => !linkedOfficerIds.has(Number(officer.id)))
    }, [officers, user?.id, users])

    if (!open) return null

    const change = (key, value) => {
        setForm((current) => ({...current, [key]: value}))
        setErrors((current) => ({...current, [key]: ''}))
    }

    const changeRole = (role) => {
        setForm((current) => ({
            ...current,
            role,
            officerId: '',
            createOfficer: false,
            departmentId: '',
            fieldIds: [],
        }))
        setErrors((current) => ({...current, role: '', officerId: '', departmentId: '', fieldIds: ''}))
    }

    const changeOfficerMode = (value) => {
        if (value === '__create__') {
            setForm((current) => ({...current, createOfficer: true, officerId: '', departmentId: '', fieldIds: []}))
        } else {
            setForm((current) => ({...current, createOfficer: false, officerId: value, departmentId: '', fieldIds: []}))
        }
        setErrors((current) => ({...current, officerId: '', departmentId: '', fieldIds: ''}))
    }

    const changeDepartment = (departmentId) => {
        setForm((current) => ({...current, departmentId, fieldIds: []}))
        setErrors((current) => ({...current, departmentId: '', fieldIds: ''}))
    }

    const toggleField = (fieldId) => {
        setForm((current) => ({
            ...current,
            fieldIds: current.fieldIds.includes(fieldId)
                ? current.fieldIds.filter((id) => id !== fieldId)
                : [...current.fieldIds, fieldId],
        }))
        setErrors((current) => ({...current, fieldIds: ''}))
    }

    const submit = (event) => {
        event.preventDefault()
        const nextErrors = {}
        const email = form.email.trim().toLowerCase()
        if (!form.fullName.trim()) nextErrors.fullName = 'Vui lòng nhập họ và tên.'
        if (!email) nextErrors.email = 'Vui lòng nhập email.'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Email không đúng định dạng.'
        else if (users.some((item) => item.email.toLowerCase() === email && item.id !== user?.id)) nextErrors.email = 'Email đã tồn tại trong hệ thống.'
        if (form.phoneNumber && !/^0\d{9}$/.test(form.phoneNumber)) nextErrors.phoneNumber = 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.'
        if (!form.role) nextErrors.role = 'Vui lòng chọn vai trò.'
        if (form.role === 'OFFICER') {
            if (form.createOfficer) {
                if (!form.departmentId) nextErrors.departmentId = 'Vui lòng chọn phòng ban.'
                if (!form.fieldIds.length) nextErrors.fieldIds = 'Vui lòng chọn ít nhất một lĩnh vực phụ trách.'
            } else if (!form.officerId) {
                nextErrors.officerId = 'Vui lòng chọn cán bộ hoặc tạo cán bộ mới.'
            }
        }
        if (mode === 'add' && form.password.length < 8) nextErrors.password = 'Mật khẩu tạm thời phải có ít nhất 8 ký tự.'
        setErrors(nextErrors)
        if (Object.keys(nextErrors).length) return
        onSave({
            ...form,
            fullName: form.fullName.trim(),
            email,
            officerId: form.role === 'OFFICER' && !form.createOfficer ? form.officerId || null : null,
        })
    }

    return (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/40 p-4" role="presentation"
             onMouseDown={(event) => {
                 if (event.target === event.currentTarget) onClose()
             }}>
            <section className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl" role="dialog"
                     aria-modal="true" aria-labelledby="user-form-title">
                <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div><h2 id="user-form-title"
                             className="text-lg font-bold text-slate-950">{mode === 'add' ? 'Thêm người dùng' : 'Chỉnh sửa người dùng'}</h2>
                        <p className="mt-1 text-xs text-slate-500">{mode === 'add' ? 'Tạo tài khoản mới cho người dùng nội bộ.' : 'Cập nhật thông tin và quyền truy cập.'}</p>
                    </div>
                    <button type="button" aria-label="Đóng form người dùng"
                            className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
                            onClick={onClose}><X size={19}/></button>
                </header>
                <form onSubmit={submit}>
                    <div className="grid max-h-[70vh] gap-4 overflow-y-auto p-5 sm:grid-cols-2">
                        <label><span className="mb-1 block text-sm font-medium text-slate-700">Họ và tên <b
                            className="text-red-500">*</b></span><input value={form.fullName}
                                                                        className={`h-10 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${errors.fullName ? 'border-red-400' : 'border-slate-200 focus:border-blue-500'}`}
                                                                        onChange={(event) => change('fullName', event.target.value)}/><FieldError
                            message={errors.fullName}/></label>
                        <label><span className="mb-1 block text-sm font-medium text-slate-700">Email <b
                            className="text-red-500">*</b></span><input type="email" value={form.email}
                                                                        className={`h-10 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${errors.email ? 'border-red-400' : 'border-slate-200 focus:border-blue-500'}`}
                                                                        onChange={(event) => change('email', event.target.value)}/><FieldError
                            message={errors.email}/></label>
                        <label><span
                            className="mb-1 block text-sm font-medium text-slate-700">Số điện thoại</span><input
                            value={form.phoneNumber} inputMode="numeric"
                            className={`h-10 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${errors.phoneNumber ? 'border-red-400' : 'border-slate-200 focus:border-blue-500'}`}
                            onChange={(event) => change('phoneNumber', event.target.value)}/><FieldError
                            message={errors.phoneNumber}/></label>
                        <label><span className="mb-1 block text-sm font-medium text-slate-700">Vai trò <b
                            className="text-red-500">*</b></span><select value={form.role}
                                                                         className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                                         onChange={(event) => changeRole(event.target.value)}>{roleOptions.map((role) =>
                            <option value={role.value} key={role.value}>{role.label}</option>)}</select><FieldError
                            message={errors.role}/></label>

                        {form.role === 'OFFICER' && (
                            <label className="sm:col-span-2"><span
                                className="mb-1 block text-sm font-medium text-slate-700">Cán bộ liên kết <b
                                className="text-red-500">*</b></span><select
                                value={form.createOfficer ? '__create__' : form.officerId}
                                className={`h-10 w-full rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${errors.officerId ? 'border-red-400' : 'border-slate-200 focus:border-blue-500'}`}
                                onChange={(event) => changeOfficerMode(event.target.value)}>
                                <option value="">Không áp dụng</option>
                                {availableOfficers.map((officer) => <option value={officer.id}
                                                                            key={officer.id}>{officer.name}</option>)}{mode === 'add' &&
                                <option value="__create__">+ Tạo cán bộ mới</option>}</select><FieldError
                                message={errors.officerId}/></label>
                        )}

                        {form.role === 'OFFICER' && form.createOfficer && (
                            <>
                                <label className="sm:col-span-2"><span
                                    className="mb-1 block text-sm font-medium text-slate-700">Phòng ban <b
                                    className="text-red-500">*</b></span><select value={form.departmentId}
                                                                                 className={`h-10 w-full rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${errors.departmentId ? 'border-red-400' : 'border-slate-200 focus:border-blue-500'}`}
                                                                                 onChange={(event) => changeDepartment(event.target.value)}>
                                    <option value="">Chọn phòng ban</option>
                                    {departments.map((department) => <option value={department.id}
                                                                             key={department.id}>{department.name}</option>)}
                                </select><FieldError message={errors.departmentId}/></label>
                                <fieldset className="sm:col-span-2">
                                    <legend className="mb-1 text-sm font-medium text-slate-700">Lĩnh vực phụ trách <b
                                        className="text-red-500">*</b></legend>
                                    <div
                                        className={`max-h-36 overflow-y-auto rounded-md border p-3 ${errors.fieldIds ? 'border-red-400' : 'border-slate-200'}`}>
                                        {!form.departmentId &&
                                            <p className="text-sm text-slate-500">Chọn phòng ban để xem lĩnh vực.</p>}
                                        {form.departmentId && fieldsLoading &&
                                            <p className="text-sm text-slate-500">Đang tải lĩnh vực...</p>}
                                        {form.departmentId && !fieldsLoading && !fieldsError && !departmentFields.length &&
                                            <p className="text-sm text-slate-500">Phòng ban chưa có lĩnh vực hoạt
                                                động.</p>}
                                        <div className="grid gap-2 sm:grid-cols-2">{departmentFields.map((field) =>
                                            <label className="flex items-center gap-2 text-sm text-slate-700"
                                                   key={field.id}><input type="checkbox"
                                                                         checked={form.fieldIds.includes(field.id)}
                                                                         className="h-4 w-4 rounded border-slate-300 text-blue-600"
                                                                         onChange={() => toggleField(field.id)}/>{field.name}
                                            </label>)}</div>
                                    </div>
                                    <FieldError message={fieldsError || errors.fieldIds}/>
                                    <button type="button"
                                            className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                                            onClick={() => changeOfficerMode('')}>Chọn cán bộ có sẵn
                                    </button>
                                </fieldset>
                            </>
                        )}

                        {mode === 'add' && <label className="sm:col-span-2"><span
                            className="mb-1 block text-sm font-medium text-slate-700">Mật khẩu tạm thời <b
                            className="text-red-500">*</b></span><span className="relative block"><input
                            type={showPassword ? 'text' : 'password'} value={form.password}
                            className={`h-10 w-full rounded-md border px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${errors.password ? 'border-red-400' : 'border-slate-200 focus:border-blue-500'}`}
                            onChange={(event) => change('password', event.target.value)}/><button type="button"
                                                                                                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                                                                                  className="absolute right-2 top-1 grid h-8 w-8 place-items-center text-slate-400"
                                                                                                  onClick={() => setShowPassword((show) => !show)}>{showPassword ?
                            <EyeOff size={17}/> : <Eye size={17}/>}</button></span><FieldError
                            message={errors.password}/></label>}
                    </div>
                    {apiError && <p className="mx-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{apiError}</p>}
                    <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
                        <button type="button" disabled={saving}
                                className="h-10 rounded-md border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                                onClick={onClose}>Hủy
                        </button>
                        <button type="submit" disabled={saving}
                                className="h-10 rounded-md bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-400">{saving ? 'Đang lưu...' : mode === 'add' ? 'Thêm người dùng' : 'Lưu thay đổi'}</button>
                    </footer>
                </form>
            </section>
        </div>
    )
}
