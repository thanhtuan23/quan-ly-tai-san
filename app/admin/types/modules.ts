export type AppModuleId =
  | 'inspection'      // Kiểm tra thiết bị & Nhật ký Checklist hàng ngày
  | 'reports'         // Dashboard Hologram & Báo cáo Ngày/Tuần/Tháng
  | 'assets'          // Cấp phát & Quản lý Tài sản (Khấu hao & Vòng đời)
  | 'warranty'        // Nhắc việc Bảo hành & Sửa chữa (Cảnh báo 7-10 ngày)
  | 'users'           // Quản trị Người dùng & Phân quyền User
  | 'notifications'   // Cảnh báo Telegram Bot API & Email

export interface AppModuleConfig {
  id: AppModuleId
  name: string
  description: string
  enabled: boolean
  icon: string
  badgeText?: string
  requiredRole?: 'admin' | 'manager' | 'user'
}

export interface TelegramNotificationSettings {
  enabled: boolean
  botToken: string
  chatId: string
  alertOnUnstable: boolean
  alertOnDamaged: boolean
  alertOnWarrantyOverdue: boolean
}

export interface ModuleSettings {
  warningThresholdDays: number  // Mặc định: 7 ngày
  overdueThresholdDays: number  // Mặc định: 10 ngày
  modules: Record<AppModuleId, boolean>
  telegram: TelegramNotificationSettings
}

export const DEFAULT_TELEGRAM_SETTINGS: TelegramNotificationSettings = {
  enabled: false,
  botToken: '',
  chatId: '',
  alertOnUnstable: true,
  alertOnDamaged: true,
  alertOnWarrantyOverdue: true
}

export const DEFAULT_MODULE_SETTINGS: ModuleSettings = {
  warningThresholdDays: 7,
  overdueThresholdDays: 10,
  modules: {
    inspection: true,
    reports: true,
    assets: true,
    warranty: true,
    users: true,
    notifications: true
  },
  telegram: DEFAULT_TELEGRAM_SETTINGS
}

export const AVAILABLE_MODULES: Omit<AppModuleConfig, 'enabled'>[] = [
  {
    id: 'inspection',
    name: 'Kiểm Tra & Checklist Hàng Ngày',
    description: 'Chấm nhật ký thiết bị (Tốt/Chập chờn/Hư hỏng), giám sát ca trực hôm nay đã check chưa',
    icon: 'CheckSquare',
    badgeText: 'Mới'
  },
  {
    id: 'reports',
    name: 'Dashboard Hologram & Báo Cáo',
    description: 'Thống kê trực quan báo cáo Ngày, Tuần, Tháng, biểu đồ sức khỏe và kế hoạch thay thế',
    icon: 'BarChart3',
    badgeText: 'Live'
  },
  {
    id: 'assets',
    name: 'Quản Lý Tài Sản & Khấu Hao',
    description: 'Vòng đời thiết bị, đánh giá khấu trừ độ hao mòn, cảnh báo hết bảo hành hết vòng đời',
    icon: 'Laptop',
    badgeText: 'Core'
  },
  {
    id: 'warranty',
    name: 'Nhắc Việc Bảo Hành & Sửa Chữa',
    description: 'Theo dõi thiết bị gửi bảo hành từ chi nhánh qua NPP, cảnh báo hạn 7-10 ngày và quá hạn >10 ngày',
    icon: 'AlertTriangle',
    badgeText: 'Auto'
  },
  {
    id: 'users',
    name: 'Quản Trị Người Dùng & Phân Quyền',
    description: 'Quản lý tài khoản (Admin/Manager/User), ma trận phân quyền chi tiết từng cá nhân',
    icon: 'Users',
    badgeText: 'Admin'
  },
  {
    id: 'notifications',
    name: 'Cảnh Báo Telegram Bot API',
    description: 'Tự động gửi tin nhắn cảnh báo thiết bị chập chờn/hỏng hóc tức thì vào Telegram Group',
    icon: 'Send',
    badgeText: 'API'
  }
]
