import { UserRole } from './user'

export type HealthStatus = 'healthy' | 'unstable' | 'damaged' | 'unchecked'

export type ActionRequired =
  | 'none'             // Hoạt động tốt, không cần thao tác
  | 'monitor'          // Theo dõi thêm trong các ca tiếp theo
  | 'replace_part'     // Lên kế hoạch thay linh kiện (quạt, adapter, RAM...)
  | 'send_warranty'    // Mang qua NPP bảo hành
  | 'urgent_replace'   // Cần thay mới khẩn cấp để đảm bảo vận hành

export interface DailyInspectionLog {
  id: string
  deviceId: string
  deviceCode: string
  deviceName: string
  model: string
  category: string
  serialNumber: string
  imei?: string
  location: string
  department: string
  checkDate: string               // YYYY-MM-DD
  checkTime: string               // HH:mm
  checkedById: string
  checkedByName: string
  checkedByRole: UserRole
  healthStatus: HealthStatus      // healthy (Tốt), unstable (Chập chờn), damaged (Hư hỏng)
  issueCategory?: string          // Nguồn, Cổng mạng, Màn hình, Phần cứng, Quá nhiệt, Khác...
  notes: string                   // Mô tả chi tiết hiện tượng lỗi
  actionRequired: ActionRequired  // Kế hoạch xử lý
  telegramNotified?: boolean
  createdAt?: string
}

export interface InspectableDevice {
  id: string
  code: string
  name: string
  model: string
  category: string
  serialNumber: string
  imei?: string
  location: string
  department: string
  assignee: string
  purchaseDate: string
  warrantyMonths: number          // Số tháng bảo hành (VD: 24, 36)
  purchasePrice: number           // Giá mua ban đầu
  // Trạng thái kiểm tra hôm nay
  todayStatus?: HealthStatus
  todayLog?: DailyInspectionLog
  totalChecks?: number
  lastCheckedDate?: string
}

export interface InspectionStats {
  totalDevices: number
  checkedToday: number
  uncheckedToday: number
  healthyCount: number
  unstableCount: number    // Chập chờn ⚠️
  damagedCount: number     // Hư hỏng 🚨
  completionRate: number   // %
}

export const HEALTH_STATUS_CONFIG: Record<
  HealthStatus,
  {
    label: string
    shortLabel: string
    color: string
    bg: string
    border: string
    icon: string
    description: string
  }
> = {
  healthy: {
    label: 'Tốt / Hoạt động ổn định',
    shortLabel: 'Tốt',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    icon: 'CheckCircle2',
    description: 'Thiết bị hoạt động trơn tru, nhiệt độ và hiệu năng bình thường.'
  },
  unstable: {
    label: 'Chập chờn / Có cảnh báo',
    shortLabel: 'Chập chờn ⚠️',
    color: 'text-amber-300',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/40',
    icon: 'AlertTriangle',
    description: 'Nóng bất thường, quạt kêu to, thỉnh thoảng mất kết nối hoặc chớp đèn.'
  },
  damaged: {
    label: 'Hư hỏng / Lỗi nặng',
    shortLabel: 'Hư hỏng 🚨',
    color: 'text-rose-300',
    bg: 'bg-rose-500/20',
    border: 'border-rose-500/50',
    icon: 'AlertCircle',
    description: 'Mất nguồn, hỏng cổng kết nối, hỏng linh kiện hoặc không thể hoạt động.'
  },
  unchecked: {
    label: 'Chưa kiểm tra hôm nay',
    shortLabel: 'Chưa check',
    color: 'text-slate-400',
    bg: 'bg-slate-800/60',
    border: 'border-slate-700/60',
    icon: 'Clock',
    description: 'Chưa có nhân viên thực hiện kiểm tra trong ca trực hôm nay.'
  }
}

export const ACTION_REQUIRED_CONFIG: Record<ActionRequired, { label: string; color: string }> = {
  none: {
    label: 'Không cần thao tác',
    color: 'text-slate-400'
  },
  monitor: {
    label: 'Theo dõi thêm trong ca tới',
    color: 'text-amber-300'
  },
  replace_part: {
    label: 'Lên kế hoạch thay linh kiện',
    color: 'text-orange-300'
  },
  send_warranty: {
    label: 'Gửi NPP bảo hành / sửa chữa',
    color: 'text-indigo-300'
  },
  urgent_replace: {
    label: 'Thay thế mới khẩn cấp',
    color: 'text-rose-400 font-bold'
  }
}

export const ISSUE_CATEGORIES = [
  'Nguồn / Khởi động',
  'Cổng mạng / Kết nối quang',
  'Màn hình / Hiển thị',
  'Quá nhiệt / Quạt tản nhiệt',
  'Bàn phím / Touchpad / Chuột',
  'Bộ nhớ / Ổ cứng SSD',
  'Hệ điều hành / Firmware',
  'Khác'
] as const
