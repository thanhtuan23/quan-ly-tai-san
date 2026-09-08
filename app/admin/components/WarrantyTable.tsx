import React from 'react'
import { WarrantyReminder, WARRANTY_STATUS_LABELS } from '../types/warranty'
import { getWarningBadgeInfo, formatVNDate } from '../utils/warrantyFormatters'
import {
  Eye,
  Edit2,
  Trash2,
  Building,
  MapPin,
  Calendar,
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle2,
  Check
} from 'lucide-react'

interface WarrantyTableProps {
  items: WarrantyReminder[]
  warningThreshold?: number
  overdueThreshold?: number
  onView: (item: WarrantyReminder) => void
  onEdit: (item: WarrantyReminder) => void
  onDelete: (item: WarrantyReminder) => void
  onQuickComplete?: (item: WarrantyReminder) => void
}

export const WarrantyTable: React.FC<WarrantyTableProps> = ({
  items,
  warningThreshold = 7,
  overdueThreshold = 10,
  onView,
  onEdit,
  onDelete,
  onQuickComplete
}) => {
  if (items.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-16 text-center shadow-xl shadow-black/20 space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500 mx-auto">
          <Clock className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-white">Không tìm thấy thiết bị bảo hành</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Không có phiếu bảo hành nào khớp với bộ lọc tìm kiếm hiện tại. Thử đặt lại bộ lọc hoặc tạo phiếu mới.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl overflow-hidden shadow-xl shadow-black/20">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-4 px-4 text-center w-12">STT</th>
              <th className="py-4 px-4">Thiết bị & Mã SP</th>
              <th className="py-4 px-4">Serial / IMEI</th>
              <th className="py-4 px-4">Nơi gửi về</th>
              <th className="py-4 px-4">Nhà Phân Phối (NPP)</th>
              <th className="py-4 px-4">Ngày gửi NPP</th>
              <th className="py-4 px-4">Tiến độ & Cảnh báo</th>
              <th className="py-4 px-4">Trạng thái</th>
              <th className="py-4 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-xs">
            {items.map((item, idx) => {
              const warningInfo = getWarningBadgeInfo(item, warningThreshold, overdueThreshold)
              const statusCfg = WARRANTY_STATUS_LABELS[item.status] || {
                label: item.status,
                color: 'text-slate-300',
                bg: 'bg-slate-800 border-slate-700'
              }

              const isOverdue = warningInfo.level === 'overdue'
              const isWarning = warningInfo.level === 'warning'

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-850/50 transition-colors ${
                    isOverdue
                      ? 'bg-rose-950/15 hover:bg-rose-950/25'
                      : isWarning
                      ? 'bg-amber-950/10 hover:bg-amber-950/20'
                      : ''
                  }`}
                >
                  {/* STT */}
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                    {item.stt || idx + 1}
                  </td>

                  {/* Tên sản phẩm & Mã SP */}
                  <td className="py-3.5 px-4 min-w-[200px]">
                    <div className="font-bold text-white group-hover:text-indigo-300 flex items-center gap-1.5">
                      {isOverdue && (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-bounce" />
                      )}
                      {isWarning && (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                      <span className="truncate">{item.productName}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      Mã: {item.productCode || 'N/A'}
                    </div>
                  </td>

                  {/* Serial / IMEI */}
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <div className="text-slate-200 font-semibold flex items-center gap-1">
                      <span className="text-slate-500 font-sans text-[10px]">S/N:</span>
                      <span>{item.serialNumber || 'Chưa có'}</span>
                    </div>
                    {item.imei && (
                      <div className="text-slate-400 flex items-center gap-1 mt-0.5">
                        <span className="text-slate-500 font-sans text-[10px]">IMEI:</span>
                        <span>{item.imei}</span>
                      </div>
                    )}
                  </td>

                  {/* Nơi gửi về (Location) */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="font-medium">{item.location}</span>
                    </div>
                  </td>

                  {/* Nhà Phân Phối (NPP) */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-200">
                      <Building className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="font-semibold text-slate-100">{item.supplier}</span>
                    </div>
                    {item.rmaCode && (
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        RMA: {item.rmaCode}
                      </div>
                    )}
                  </td>

                  {/* Ngày gửi NPP */}
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatVNDate(item.sentToSupplierDate || item.receivedDate)}</span>
                    </div>
                  </td>

                  {/* Tiến độ & Cảnh báo (Warning badge) */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${warningInfo.badgeClass}`}
                      >
                        {isOverdue && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                        {isWarning && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                        {warningInfo.level === 'completed' && (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>{warningInfo.shortLabel}</span>
                      </span>
                    </div>
                  </td>

                  {/* Trạng thái */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusCfg.bg} ${statusCfg.color}`}
                    >
                      {statusCfg.label}
                    </span>
                  </td>

                  {/* Thao tác */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Nút Hoàn thành nhanh nếu chưa xong */}
                      {item.status !== 'hoan_thanh' && onQuickComplete && (
                        <button
                          onClick={() => onQuickComplete(item)}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-emerald-600/20 text-emerald-400 hover:text-emerald-300 border border-slate-700/60 transition-colors"
                          title="Đánh dấu đã hoàn thành & nhận lại thiết bị"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Xem chi tiết */}
                      <button
                        onClick={() => onView(item)}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-400 border border-slate-700/60 transition-colors"
                        title="Xem chi tiết phiếu bảo hành"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Chỉnh sửa */}
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-purple-600/20 text-slate-300 hover:text-purple-400 border border-slate-700/60 transition-colors"
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Xóa */}
                      <button
                        onClick={() => onDelete(item)}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition-colors"
                        title="Xóa phiếu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
