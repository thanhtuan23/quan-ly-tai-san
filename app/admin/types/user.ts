export type UserRole = 'admin' | 'user'
export type UserStatus = 'active' | 'inactive' | 'banned'
export type UserFilterTab = 'all' | 'admin' | 'user' | 'active' | 'inactive' | 'banned'

export interface UserProfile {
  id: string
  email: string
  fullName: string
  role: UserRole
  department: string
  avatarUrl?: string
  status: UserStatus
  createdAt?: string
}

export interface UserStats {
  totalUsers: number
  adminCount: number
  employeeCount: number
  activeCount: number
  inactiveCount: number
  bannedCount: number
}
