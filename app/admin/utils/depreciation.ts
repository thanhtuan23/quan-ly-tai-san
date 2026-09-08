export interface DepreciationCalculation {
  originalValue: number
  purchaseDate: string
  warrantyMonths: number
  warrantyEndDate: string
  usedMonths: number
  remainingMonths: number
  depreciationRate: number       // % từ 0 đến 100
  currentValue: number           // VNĐ
  lifecycleStatus: 'in_warranty' | 'expiring_soon' | 'end_of_life'
  statusLabel: string
  badgeClass: string
}

/**
 * Tính toán khấu hao và vòng đời thiết bị dựa trên Ngày mua, Giá mua và Thời hạn bảo hành
 * Quy tắc: Hết bảo hành = Hết vòng đời tiêu chuẩn (Khấu hao 100%)
 */
export const calculateDepreciation = (
  originalValue: number = 0,
  purchaseDateStr: string = '',
  warrantyYears: number = 2
): DepreciationCalculation => {
  const safeValue = Math.max(0, Number(originalValue) || 0)
  const safeYears = Math.max(0.5, Number(warrantyYears) || 2)
  const warrantyMonths = Math.round(safeYears * 12)

  const purchaseDate = purchaseDateStr ? new Date(purchaseDateStr) : new Date()
  const validPurchaseDate = isNaN(purchaseDate.getTime()) ? new Date() : purchaseDate

  // Tính ngày hết hạn bảo hành
  const warrantyEndDate = new Date(validPurchaseDate)
  warrantyEndDate.setMonth(warrantyEndDate.getMonth() + warrantyMonths)

  const now = new Date()

  // Tính số tháng đã sử dụng
  const diffTime = now.getTime() - validPurchaseDate.getTime()
  const usedMonths = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.4375)))

  const remainingMonths = Math.max(0, warrantyMonths - usedMonths)

  // Tỷ lệ khấu hao (%) = min(100, (usedMonths / warrantyMonths) * 100)
  const rawDepreciationRate = (usedMonths / warrantyMonths) * 100
  const depreciationRate = Math.min(100, Math.max(0, Math.round(rawDepreciationRate)))

  // Giá trị còn lại sau khấu hao
  const currentValue = Math.max(0, Math.round(safeValue * (1 - depreciationRate / 100)))

  // Đánh giá vòng đời
  let lifecycleStatus: 'in_warranty' | 'expiring_soon' | 'end_of_life' = 'in_warranty'
  let statusLabel = `Còn BH ${remainingMonths} tháng`
  let badgeClass = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'

  if (usedMonths >= warrantyMonths) {
    lifecycleStatus = 'end_of_life'
    statusLabel = 'Hết bảo hành (Hết vòng đời)'
    badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/10'
  } else if (remainingMonths <= 3) {
    lifecycleStatus = 'expiring_soon'
    statusLabel = `Sắp hết BH (Còn ${remainingMonths} th)`
    badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  }

  return {
    originalValue: safeValue,
    purchaseDate: validPurchaseDate.toISOString().split('T')[0],
    warrantyMonths,
    warrantyEndDate: warrantyEndDate.toISOString().split('T')[0],
    usedMonths,
    remainingMonths,
    depreciationRate,
    currentValue,
    lifecycleStatus,
    statusLabel,
    badgeClass
  }
}
