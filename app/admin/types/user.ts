export type UserRole = 'admin' | 'manager' | 'user'
export type UserStatus = 'active' | 'inactive' | 'banned'
export type UserFilterTab = 'all' | 'admin' | 'manager' | 'user' | 'active' | 'inactive' | 'banned'

export interface UserModulePermissions {
  canViewAssets: boolean
  canEditAssets: boolean
  canViewPrice: boolean              // Xem giá tiền & khấu hao tài sản
  canViewWarranty: boolean
  canEditWarranty: boolean
  canViewInspection: boolean         // Xem phân hệ kiểm tra thiết bị
  canDoInspection: boolean           // Được quyền chấm checklist hàng ngày
  canViewReports: boolean            // Xem Dashboard Hologram & Báo cáo Ngày/Tuần/Tháng
  canManageUsers: boolean            // Quản lý tài khoản & phân quyền
  canManageSettings: boolean         // Cài đặt Module & Telegram Bot
}

export const DEFAULT_PERMISSIONS_BY_ROLE: Record<UserRole, UserModulePermissions> = {
  admin: {
    canViewAssets: true,
    canEditAssets: true,
    canViewPrice: true,
    canViewWarranty: true,
    canEditWarranty: true,
    canViewInspection: true,
    canDoInspection: true,
    canViewReports: true,
    canManageUsers: true,
    canManageSettings: true
  },
  manager: {
    canViewAssets: true,
    canEditAssets: true,
    canViewPrice: true,
    canViewWarranty: true,
    canEditWarranty: true,
    canViewInspection: true,
    canDoInspection: true,
    canViewReports: true,
    canManageUsers: false,
    canManageSettings: false
  },
  user: {
    canViewAssets: true,
    canEditAssets: false,
    canViewPrice: false,
    canViewWarranty: true,
    canEditWarranty: false,
    canViewInspection: true,
    canDoInspection: true,
    canViewReports: false,
    canManageUsers: false,
    canManageSettings: false
  }
}

export interface UserProfile {
  id: string
  email: string
  fullName: string
  role: UserRole
  department: string
  avatarUrl?: string
  status: UserStatus
  permissions?: UserModulePermissions
  createdAt?: string
}

export interface UserStats {
  totalUsers: number
  adminCount: number
  managerCount: number
  employeeCount: number
  activeCount: number
  inactiveCount: number
  bannedCount: number
}
