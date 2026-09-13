import api from './api'

function mapOfficer(item) {
  return {
    id: item.id,
    name: item.full_name,
    email: item.email,
    phone: item.phone_number,
    active: item.is_active,
    department: 'Cán bộ xử lý',
  }
}

export async function getOfficers() {
  const { data } = await api.get('/officers')
  return data.map(mapOfficer)
}

export async function getDepartments() {
  const { data } = await api.get('/catalog/departments')
  return data.map((item) => ({ id: item.id, name: item.name }))
}
