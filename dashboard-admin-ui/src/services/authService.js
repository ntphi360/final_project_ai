import api from './api'

export function mapAuthUser(user) {
  if (!user) return null
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    phoneNumber: user.phone_number,
    role: user.role,
    isActive: user.is_active,
    officerId: user.officer_id,
    officerName: user.officer_name,
    departmentName: user.officer_name,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  }
}

export async function loginRequest(credentials) {
  const { data } = await api.post('/api/auth/login', credentials)
  return { accessToken: data.access_token, user: mapAuthUser(data.user) }
}

export async function getCurrentUser() {
  const { data } = await api.get('/api/auth/me')
  return mapAuthUser(data)
}
