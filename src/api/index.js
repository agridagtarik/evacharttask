import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
