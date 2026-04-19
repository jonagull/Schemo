export interface UserSdto {
  id: string
  email: string
  firstName: string
  lastName: string
  isActive: boolean
}

export interface UpdateUserRdto {
  firstName?: string
  lastName?: string
}

export type User = UserSdto
