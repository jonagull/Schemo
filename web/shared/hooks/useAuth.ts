import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi, userApi, useAuthStore, LoginRdto, RegisterRdto } from '@shared'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const useRegister = () => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { setExpiresAt, setAuthenticated } = useAuthStore()

  return useMutation({
    mutationFn: (credentials: Omit<RegisterRdto, 'clientType'>) => authApi.register(credentials),
    onSuccess: data => {
      if (data?.expiresAt) setExpiresAt(data.expiresAt)

      setAuthenticated(true)
      queryClient.invalidateQueries({ queryKey: ['user'] })
      router.push('/')
    },
    onError: error => console.error('Registration failed:', error),
  })
}

export const useLogin = () => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { setExpiresAt, setAuthenticated } = useAuthStore()

  return useMutation({
    mutationFn: (credentials: Omit<LoginRdto, 'clientType'>) => authApi.login(credentials),
    onSuccess: data => {
      if (data?.expiresAt) setExpiresAt(data.expiresAt)

      setAuthenticated(true)
      queryClient.invalidateQueries({ queryKey: ['user'] })
      router.push('/')
    },
    onError: error => console.error('Login failed:', error),
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { logout } = useAuthStore()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout()
      queryClient.clear()
      router.push('/login')
    },
  })
}

export const useUser = () => {
  const { setUser, setLoading, isAuthenticated } = useAuthStore()

  const query = useQuery({
    queryKey: ['user'],
    queryFn: userApi.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: isAuthenticated,
  })

  useEffect(() => {
    if (query.isSuccess && query.data) {
      setUser(query.data)
      setLoading(false)
    } else if (query.isError) {
      setUser(null)
      setLoading(false)
    } else if (!isAuthenticated) {
      setLoading(false)
    }
  }, [query.isSuccess, query.isError, query.data, isAuthenticated, setUser, setLoading])

  return query
}

export const useAuthCheck = () => {
  const { checkTokenExpiry, isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      if (checkTokenExpiry()) {
        authApi.refresh().catch(() => {
          queryClient.clear()
          window.location.href = '/login'
        })
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [isAuthenticated, checkTokenExpiry, queryClient])
}
