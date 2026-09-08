export type WarrantyStatus =
  | 'tiep_nhan'      // Tiếp nhận thiết bị từ chi nhánh/khách hàng
  | 'da_gui_npp'     // Đã mang qua Nhà Phân Phối (NPP)
  | 'dang_xu_ly'     // NPP đang kiểm tra / sửa chữa
  | 'cho_tra_kho'    // NPP đã xử lý xong, chờ gửi trả chi nhánh
  | 'hoan_thanh'     // Đã bàn giao lại cho chi nhánh / hoàn tất
  | 'doi_moi'        // NPP đổi thiết bị mới

export type WarningLevel = 'normal' | 'warning' | 'overdue' | 'completed'

export interface WarrantyReminder {
  id: string
  stt: number                         // Số thứ tự
  productName: string                 // Tên sản phẩm (VD: Switch Cisco C1300 24P)
  productCode: string                 // Mã sản phẩm (VD: SW-C1300-24T-4G)
  imei?: string                       // IMEI (nếu có)
  serialNumber: string                // Serial Number (S/N)
  location: string                    // Nơi gửi về (VD: Hải Dương, Đà Nẵng, HCM...)
  supplier: string                    // Nhà phân phối / Cung cấp (VD: Synnex FPT, DGW, Viễn Sơn...)
  receivedDate: string                // Ngày tiếp nhận về kho (YYYY-MM-DD)
  sentToSupplierDate: string          // Ngày mang qua NPP (YYYY-MM-DD hoặc YYYY-MM-DDTHH:mm)
  expectedReturnDate?: string         // Ngày dự kiến trả
  completedDate?: string              // Ngày hoàn thành thực tế
  status: WarrantyStatus              // Trạng thái phiếu
  rmaCode?: string                    // Mã phiếu tiếp nhận của NPP (RMA No.)
  cost?: number                       // Chi phí sửa chữa nếu có (VNĐ)
  notes?: string                      // Mô tả lỗi & ghi chú linh kiện
  createdAt?: string
  updatedAt?: string
}

export type WarrantyFilterTab = 'all' | 'urgent' | 'in_npp' | 'completed'

export interface WarrantyStats {
  total: number
  inNpp: number
  warningCount: number   // 7 - 10 ngày
  overdueCount: number   // > 10 ngày
  completedCount: number
}

export const WARRANTY_STATUS_LABELS: Record<WarrantyStatus, { label: string; color: string; bg: string }> = {
  tiep_nhan: {
    label: 'Tiếp nhận về kho',
    color: 'text-sky-300',
    bg: 'bg-sky-500/15 border-sky-500/30'
  },
  da_gui_npp: {
    label: 'Đã mang qua NPP',
    color: 'text-indigo-300',
    bg: 'bg-indigo-500/15 border-indigo-500/30'
  },
  dang_xu_ly: {
    label: 'NPP đang sửa chữa',
    color: 'text-amber-300',
    bg: 'bg-amber-500/15 border-amber-500/30'
  },
  cho_tra_kho: {
    label: 'Chờ gửi trả chi nhánh',
    color: 'text-purple-300',
    bg: 'bg-purple-500/15 border-purple-500/30'
  },
  hoan_thanh: {
    label: 'Đã hoàn thành',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/15 border-emerald-500/30'
  },
  doi_moi: {
    label: 'NPP đổi mới thiết bị',
    color: 'text-teal-300',
    bg: 'bg-teal-500/15 border-teal-500/30'
  }
}

export const COMMON_LOCATIONS = [
  'Chi nhánh Hải Dương',
  'Chi nhánh Hà Nội',
  'Chi nhánh Đà Nẵng',
  'Chi nhánh Hồ Chí Minh',
  'Chi nhánh Hải Phòng',
  'Chi nhánh Cần Thơ',
  'Kho Trung Tâm'
] as const

export const COMMON_SUPPLIERS = [
  'Synnex FPT',
  'Digiworld (DGW)',
  'Viễn Sơn',
  'CMC Telecom',
  'Viettel IDC',
  'Bảo An',
  'Thế Giới Số',
  'Trung tâm bảo hành Hãng'
] as const
