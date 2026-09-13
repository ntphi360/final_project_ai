import api from './api'

export async function getDepartments() {
  const { data } = await api.get('/api/catalog/departments')
  return data.map((item) => ({ id: item.id, name: item.name, active: item.is_active }))
}

export async function getFields() {
  const { data } = await api.get('/api/catalog/fields')
  return data.map((item) => ({ id: item.id, name: item.name, active: item.is_active }))
}
