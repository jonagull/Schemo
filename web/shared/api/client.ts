import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5157'

interface FailedRequest {
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
  config: InternalAxiosRequestConfig
}

let isRefreshing = false
let failedQueue: FailedRequest[] = []

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else apiClient(prom.config).then(prom.resolve).catch(prom.reject)
  })

  failedQueue = []
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  config => config,
  error => Promise.reject(error)
)

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (!originalRequest) return Promise.reject(error)

    // Don't try to refresh for auth endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/api/auth/')

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await apiClient.post('/api/auth/refresh')
        processQueue(null)
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as AxiosError)

        // Only redirect to login if we're not already on the login page
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
