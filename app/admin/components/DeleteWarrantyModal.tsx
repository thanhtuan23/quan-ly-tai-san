import React from 'react'
import { WarrantyReminder } from '../types/warranty'
import { AlertTriangle, Trash2, X } from 'lucide-react'

interface DeleteWarrantyModalProps {
  item: WarrantyReminder | null
  onClose: () => void
  onConfirm: () => void
}

export const DeleteWarrantyModal: React.FC<DeleteWarrantyModalProps> = ({
  item,
  onClose,
  onConfirm
}) => {
  if (!item) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Xác nhận xóa phiếu bảo hành?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bạn có chắc chắn muốn xóa phiếu bảo hành thiết bị{' '}
              <strong className="text-white">{item.productName}</strong> (S/N: {item.serialNumber})?
            </p>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1 text-slate-300">
          <div>
            <span className="text-slate-500">Nơi gửi: </span>
            <span>{item.location}</span>
          </div>
          <div>
            <span className="text-slate-500">Nhà phân phối (NPP): </span>
            <span>{item.supplier}</span>
          </div>
          <div>
            <span className="text-slate-500">Ngày gửi: </span>
            <span className="font-mono">{item.sentToSupplierDate || item.receivedDate}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xác nhận xóa</span>
          </button>
        </div>
      </div>
    </div>
  )
}
