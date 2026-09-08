import React from 'react'
import { WarrantyReminder, WarrantyStatus, WARRANTY_STATUS_LABELS } from '../types/warranty'
import { getWarningBadgeInfo, formatVNDate } from '../utils/warrantyFormatters'
import { formatVND } from '../utils/formatters'
import {
  X,
  Wrench,
  Building,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  DollarSign,
  Tag,
  Hash
} from 'lucide-react'

interface WarrantyDetailModalProps {
  item: WarrantyReminder | null
  warningThreshold?: number
  overdueThreshold?: number
  onClose: () => void
  onUpdateStatus?: (item: WarrantyReminder, newStatus: WarrantyStatus) => void
}

export const WarrantyDetailModal: React.FC<WarrantyDetailModalProps> = ({
  item,
  warningThreshold = 7,
  overdueThreshold = 10,
  onClose,
  onUpdateStatus
}) => {
  if (!item) return null

  const warningInfo = getWarningBadgeInfo(item, warningThreshold, overdueThreshold)
  const statusCfg = WARRANTY_STATUS_LABELS[item.status] || {
    label: item.status,
    color: 'text-slate-300',
    bg: 'bg-slate-800 border-slate-700'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                  STT: #{item.stt}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.color}`}
                >
                  {statusCfg.label}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">{item.productName}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Warning Banner */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${warningInfo.badgeClass}`}>
            {warningInfo.level === 'overdue' && (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
            )}
            {warningInfo.level === 'warning' && (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            {warningInfo.level === 'completed' && (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            {warningInfo.level === 'normal' && (
              <Clock className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-bold text-sm mb-0.5">{warningInfo.label}</h4>
              <p className="text-[11px] opacity-90 leading-relaxed">
                {warningInfo.level === 'overdue'
                  ? `Thiết bị đã mang qua NPP hơn ${overdueThreshold} ngày nhưng chưa hoàn thành. Quản trị viên cần liên hệ trực tiếp với NPP ${item.supplier} để giải quyết khẩn cấp.`
                  : warningInfo.level === 'warning'
                  ? `Thiết bị đã mang qua NPP từ ${warningThreshold} đến ${overdueThreshold} ngày. Vui lòng gọi điện hoặc nhắn tin cho NPP ${item.supplier} để giục trả hàng.`
                  : warningInfo.level === 'completed'
                  ? `Thiết bị đã hoàn tất quy trình bảo hành/sửa chữa và sẵn sàng bàn giao.`
                  : `Thiết bị đang trong thời gian xử lý bình thường tại NPP ${item.supplier}.`}
              </p>
            </div>
          </div>

          {/* Grid Info */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Mã Sản Phẩm</span>
              <strong className="text-slate-200 font-mono text-xs">{item.productCode}</strong>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Serial Number (S/N)</span>
              <strong className="text-slate-100 font-mono text-xs">{item.serialNumber}</strong>
            </div>

            {item.imei && (
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">IMEI</span>
                <strong className="text-slate-300 font-mono text-xs">{item.imei}</strong>
              </div>
            )}

            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Nơi gửi về</span>
              <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>{item.location}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Nhà Phân Phối (NPP)</span>
              <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                <Building className="w-3.5 h-3.5 text-purple-400" />
                <span>{item.supplier}</span>
              </div>
            </div>

            {item.rmaCode && (
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Mã phiếu RMA của NPP</span>
                <strong className="text-purple-300 font-mono text-xs">{item.rmaCode}</strong>
              </div>
            )}

            {typeof item.cost === 'number' && item.cost > 0 && (
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Chi phí sửa chữa</span>
                <strong className="text-emerald-400 font-bold text-xs">{formatVND(item.cost)}</strong>
              </div>
            )}
          </div>

          {/* Timeline Dates */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              Mốc thời gian xử lý
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Tiếp nhận về kho</span>
                <strong className="text-slate-200 font-mono">{formatVNDate(item.receivedDate)}</strong>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Mang qua NPP</span>
                <strong className="text-indigo-300 font-mono">
                  {formatVNDate(item.sentToSupplierDate || item.receivedDate)}
                </strong>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Hẹn trả dự kiến</span>
                <strong className="text-slate-200 font-mono">{formatVNDate(item.expectedReturnDate)}</strong>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Hoàn thành thực tế</span>
                <strong className="text-emerald-400 font-mono">{formatVNDate(item.completedDate)}</strong>
              </div>
            </div>
          </div>

          {/* Notes */}
          {item.notes && (
            <div className="space-y-1.5 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold block">Ghi chú tình trạng lỗi:</span>
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{item.notes}</p>
            </div>
          )}

          {/* Quick Status Change */}
          {onUpdateStatus && (
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
              <span className="text-slate-400 text-xs">Cập nhật nhanh trạng thái:</span>
              <select
                value={item.status}
                onChange={(e) => onUpdateStatus(item, e.target.value as WarrantyStatus)}
                className="bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl py-1.5 px-3 text-xs text-slate-200 outline-none"
              >
                {Object.entries(WARRANTY_STATUS_LABELS).map(([k, { label }]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  )
}
