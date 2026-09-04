export type AssetCategory = 'IT' | 'Văn phòng' | 'Phương tiện' | 'Nội thất' | 'Thiết bị khác'
export type AssetStatus = 'Sẵn sàng' | 'Đang sử dụng' | 'Bảo trì' | 'Hỏng' | 'Thanh lý'
export type FilterTab = 'all' | 'using' | 'available' | 'maintenance' | 'broken'

export interface Asset {
  id: string
  code: string
  name: string
  category: AssetCategory
  status: AssetStatus
  assignee: string
  department: string
  value: number
  purchaseDate: string
  location: string
  serialNumber?: string
  notes?: string
}

export interface AssetStats {
  totalCount: number
  totalVal: number
  inUse: number
  available: number
  maintenance: number
  broken: number
}
