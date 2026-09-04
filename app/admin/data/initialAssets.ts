import { Asset } from '../types/asset'

// Dữ liệu tài sản ban đầu (trống, lấy từ cơ sở dữ liệu Supabase)
export const INITIAL_ASSETS: Asset[] = []

export const CATEGORY_OPTIONS = [
  'Tất cả',
  'IT',
  'Văn phòng',
  'Nội thất',
  'Phương tiện',
  'Thiết bị khác'
] as const

export const STATUS_OPTIONS = [
  'Tất cả',
  'Sẵn sàng',
  'Đang sử dụng',
  'Bảo trì',
  'Hỏng',
  'Thanh lý'
] as const

export const DEPARTMENT_OPTIONS = [
  'Phòng IT & Công nghệ',
  'Phòng Kinh doanh',
  'Phòng Hành chính',
  'Phòng Marketing',
  'Ban Giám Đốc',
  'Kho'
] as const
