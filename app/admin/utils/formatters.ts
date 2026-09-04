import { Asset } from '../types/asset'

export const formatVND = (val: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
}

export const exportAssetsToCSV = (assets: Asset[]): void => {
  const headers = ['Mã TS', 'Tên TS', 'Loại', 'Trạng Thái', 'Người giữ', 'Phòng ban', 'Giá trị (VNĐ)', 'Ngày nhập', 'Vị trí', 'Serial Number']
  const rows = assets.map((a) => [
    a.code,
    `"${a.name}"`,
    a.category,
    a.status,
    `"${a.assignee}"`,
    `"${a.department}"`,
    a.value,
    a.purchaseDate,
    `"${a.location || ''}"`,
    `"${a.serialNumber || ''}"`
  ])
  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `danh_sach_tai_san_jga_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
