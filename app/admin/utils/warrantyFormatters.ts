import { WarrantyReminder, WarningLevel, WARRANTY_STATUS_LABELS } from '../types/warranty'

/**
 * Tính số ngày đã gửi / xử lý bảo hành
 */
export const calculateDaysElapsed = (item: WarrantyReminder): number => {
  const startDateStr = item.sentToSupplierDate || item.receivedDate
  if (!startDateStr) return 0

  const startDate = new Date(startDateStr)
  if (isNaN(startDate.getTime())) return 0

  const endDate = item.status === 'hoan_thanh' && item.completedDate
    ? new Date(item.completedDate)
    : new Date()

  const diffTime = endDate.getTime() - startDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

/**
 * Xác định mức cảnh báo của phiếu bảo hành
 * - Completed: Đã hoàn thành
 * - Overdue: >= 10 ngày (hoặc quá overdueThreshold)
 * - Warning: >= 7 ngày và < 10 ngày (hoặc từ warningThreshold đến overdueThreshold)
 * - Normal: < 7 ngày
 */
export const getWarningLevel = (
  item: WarrantyReminder,
  warningThreshold: number = 7,
  overdueThreshold: number = 10
): WarningLevel => {
  if (item.status === 'hoan_thanh') {
    return 'completed'
  }

  const days = calculateDaysElapsed(item)
  if (days >= overdueThreshold) {
    return 'overdue'
  }
  if (days >= warningThreshold) {
    return 'warning'
  }
  return 'normal'
}

/**
 * Lấy nhãn và kiểu hiển thị cảnh báo
 */
export const getWarningBadgeInfo = (
  item: WarrantyReminder,
  warningThreshold: number = 7,
  overdueThreshold: number = 10
): {
  level: WarningLevel
  label: string
  shortLabel: string
  days: number
  badgeClass: string
  iconColor: string
} => {
  const days = calculateDaysElapsed(item)
  const level = getWarningLevel(item, warningThreshold, overdueThreshold)

  switch (level) {
    case 'overdue':
      return {
        level: 'overdue',
        label: `Quá hạn (> ${overdueThreshold} ngày): Đã ${days} ngày`,
        shortLabel: `Quá hạn: ${days} ngày`,
        days,
        badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/20 animate-pulse',
        iconColor: 'text-rose-400'
      }
    case 'warning':
      return {
        level: 'warning',
        label: `Cảnh báo (${warningThreshold}-${overdueThreshold} ngày): Đã ${days} ngày`,
        shortLabel: `Cảnh báo: ${days} ngày`,
        days,
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10',
        iconColor: 'text-amber-400'
      }
    case 'completed':
      return {
        level: 'completed',
        label: `Hoàn tất (Xong sau ${days} ngày)`,
        shortLabel: `Xong: ${days} ngày`,
        days,
        badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        iconColor: 'text-emerald-400'
      }
    case 'normal':
    default:
      return {
        level: 'normal',
        label: `Bình thường: Đã ${days} ngày`,
        shortLabel: `Đã ${days} ngày`,
        days,
        badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
        iconColor: 'text-sky-400'
      }
  }
}

/**
 * Format ngày hiển thị dạng DD/MM/YYYY
 */
export const formatVNDate = (dateStr?: string): string => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

/**
 * Xuất danh sách nhắc việc bảo hành ra file CSV (UTF-8 BOM)
 */
export const exportWarrantyToCSV = (items: WarrantyReminder[]): void => {
  const headers = [
    'STT',
    'Tên Sản Phẩm',
    'Mã Sản Phẩm',
    'IMEI',
    'Serial Number',
    'Nơi Gửi Về',
    'Nhà Phân Phối (NPP)',
    'Ngày Tiếp Nhận',
    'Ngày Mang Qua NPP',
    'Số Ngày Đã Gửi',
    'Mức Cảnh Báo',
    'Trạng Thái',
    'Mã Phiếu NPP (RMA)',
    'Ghi Chú'
  ]

  const rows = items.map((item) => {
    const days = calculateDaysElapsed(item)
    const level = getWarningLevel(item)
    const statusLabel = WARRANTY_STATUS_LABELS[item.status]?.label || item.status

    let warningText = 'Bình thường'
    if (level === 'warning') warningText = 'Cảnh báo (7-10 ngày)'
    if (level === 'overdue') warningText = 'Quá hạn (> 10 ngày)'
    if (level === 'completed') warningText = 'Đã hoàn thành'

    return [
      item.stt,
      `"${item.productName.replace(/"/g, '""')}"`,
      `"${item.productCode.replace(/"/g, '""')}"`,
      `"${item.imei || ''}"`,
      `"${item.serialNumber}"`,
      `"${item.location.replace(/"/g, '""')}"`,
      `"${item.supplier.replace(/"/g, '""')}"`,
      item.receivedDate || '',
      item.sentToSupplierDate || '',
      days,
      `"${warningText}"`,
      `"${statusLabel}"`,
      `"${item.rmaCode || ''}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`
    ]
  })

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute(
    'download',
    `danh_sach_nhac_viec_bao_hanh_${new Date().toISOString().split('T')[0]}.csv`
  )
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
