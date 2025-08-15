import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred'
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(error)
    }
    
    if (error.response?.status === 403) {
      toast.error('Access denied: Insufficient permissions')
    } else if (error.response?.status >= 500) {
      toast.error('Server error: Please try again later')
    } else if (!error.response) {
      toast.error('Network error: Please check your connection')
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
}

// Dashboard API
export const dashboardAPI = {
  getMetrics: (params) => api.get('/dashboard/metrics', { params }),
  getBases: () => api.get('/dashboard/bases'),
  getAssetTypes: () => api.get('/dashboard/asset-types'),
}

// Assets API
export const assetsAPI = {
  getAll: (params) => api.get('/assets', { params }),
  getById: (id) => api.get(`/assets/${id}`),
  getBalance: (id, params) => api.get(`/assets/${id}/balance`, { params }),
  create: (data) => api.post('/assets', data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`),
}

// Purchases API
export const purchasesAPI = {
  getAll: (params) => api.get('/purchases', { params }),
  getById: (id) => api.get(`/purchases/${id}`),
  create: (data) => api.post('/purchases', data),
  update: (id, data) => api.put(`/purchases/${id}`, data),
  delete: (id) => api.delete(`/purchases/${id}`),
}

// Transfers API
export const transfersAPI = {
  getAll: (params) => api.get('/transfers', { params }),
  getById: (id) => api.get(`/transfers/${id}`),
  create: (data) => api.post('/transfers', data),
  updateStatus: (id, data) => api.put(`/transfers/${id}/status`, data),
  delete: (id) => api.delete(`/transfers/${id}`),
}

// Assignments API
export const assignmentsAPI = {
  getAll: (params) => api.get('/assignments', { params }),
  getById: (id) => api.get(`/assignments/${id}`),
  create: (data) => api.post('/assignments', data),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  return: (id) => api.put(`/assignments/${id}/return`),
  delete: (id) => api.delete(`/assignments/${id}`),
}

// Expenditures API
export const expendituresAPI = {
  getAll: (params) => api.get('/expenditures', { params }),
  getById: (id) => api.get(`/expenditures/${id}`),
  create: (data) => api.post('/expenditures', data),
  update: (id, data) => api.put(`/expenditures/${id}`, data),
  delete: (id) => api.delete(`/expenditures/${id}`),
}

export default api