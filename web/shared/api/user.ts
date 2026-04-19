import { UpdateUserRdto, UserSdto, ResponseData } from '@shared'
import { ApiResponse } from '@shared'
import apiClient from './client'

export const userApi = {
  getCurrentUser: async (): Promise<ResponseData<UserSdto>> => {
    const { data } = await apiClient.get<ApiResponse<UserSdto>>('/api/user')
    if (!data.success) {
      throw new Error(data.message || 'Failed to get current user')
    }
    return data.data
  },

  updateUser: async (updateData: UpdateUserRdto): Promise<ResponseData<UserSdto>> => {
    const { data } = await apiClient.put<ApiResponse<UserSdto>>('/api/user', updateData)
    if (!data.success) {
      throw new Error(data.message || 'Failed to update user')
    }
    return data.data
  },
}
