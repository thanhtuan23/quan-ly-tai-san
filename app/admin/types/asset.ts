export type AssetCategory = 'IT' | 'Văn phòng' | 'Phương tiện' | 'Nội thất' | 'Thiết bị khác'
export type AssetStatus = 'Sẵn sàng' | 'Đang sử dụng' | 'Bảo trì' | 'Hỏng' | 'Thanh lý'
export type FilterTab = 'all' | 'using' | 'available' | 'maintenance' | 'broken'

export interface Asset {
  id: string
  code: string
  name: string
  model?: string                      // Model thiết bị (VD: Dell Latitude 5420, Cisco C1300...)
  category: AssetCategory
  status: AssetStatus
  assignee: string
  department: string
  value: number                       // Giá mua ban đầu (VNĐ)
  purchaseDate: string                // Ngày mua / đưa vào sử dụng
  warrantyYears?: number              // Thời hạn bảo hành (VD: 2 năm, 3 năm)
  location: string
  serialNumber?: string
  imei?: string
  notes?: string
  // Tính toán khấu hao & vòng đời
  depreciationRate?: number           // % khấu hao đã qua
  currentValue?: number               // Giá trị còn lại
  lifecycleStatus?: 'in_warranty' | 'expiring_soon' | 'end_of_life'
}

export interface AssetStats {
  totalCount: number
  totalVal: number
  inUse: number
  available: number
  maintenance: number
  broken: number
}
