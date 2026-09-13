import api from './api'
import { mapAuthUser } from './authService'

export async function getUsers() {
  const { data } = await api.get('/api/users')
  return Array.isArray(data) ? data.map(mapAuthUser) : []
}

export async function getUserById(id) {
  const { data } = await api.get(`/api/users/${id}`)
  return mapAuthUser(data)
}

export async function createUser(form) {
  const { data } = await api.post('/api/users', {
    full_name: form.fullName,
    email: form.email,
    phone_number: form.phoneNumber || null,
    role: form.role,
    officer_id: form.officerId ? Number(form.officerId) : null,
    password: form.password,
  })
  return mapAuthUser(data)
}

export async function updateUser(id, form) {
  const { data } = await api.put(`/api/users/${id}`, {
    full_name: form.fullName,
    email: form.email,
    phone_number: form.phoneNumber || null,
    role: form.role,
    officer_id: form.officerId ? Number(form.officerId) : null,
  })
  return mapAuthUser(data)
}

export async function updateUserStatus(id, isActive) {
  const { data } = await api.patch(`/api/users/${id}/status`, { is_active: isActive })
  return mapAuthUser(data)
}

export async function resetUserPassword(id, newPassword) {
  const { data } = await api.post(`/api/users/${id}/reset-password`, { new_password: newPassword })
  return mapAuthUser(data)
}
