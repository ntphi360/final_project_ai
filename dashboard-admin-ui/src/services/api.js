import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  timeout: 10000,
})

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
)

export default api
