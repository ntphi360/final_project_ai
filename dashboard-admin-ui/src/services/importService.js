import api from './api'

export async function importCases(file) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/api/import/cases', formData, { timeout: 120000 })
  return data
}
