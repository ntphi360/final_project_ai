import api from './api'

export async function getDepartments() {
  const { data } = await api.get('/catalog/departments')
  return data.map((item) => ({ id: item.id, name: item.name }))
}
