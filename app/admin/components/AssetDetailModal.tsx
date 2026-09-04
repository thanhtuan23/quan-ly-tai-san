import React from 'react'
import { Asset } from '../types/asset'
import { StatusBadge } from './StatusBadge'
import { formatVND } from '../utils/formatters'
import { QrCode, X } from 'lucide-react'

interface AssetDetailModalProps {
  asset: Asset | null
  onClose: () => void
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  onClose,
}) => {
  if (!asset) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{asset.name}</h3>
              <p className="text-xs text-indigo-300 font-mono">{asset.code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-slate-400 font-medium">Trạng thái hiện tại:</span>
            <StatusBadge status={asset.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <div>
              <p className="text-slate-400 font-medium">Loại tài sản</p>
              <p className="text-slate-100 font-semibold mt-0.5">{asset.category}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Nguyên giá tài sản</p>
              <p className="text-emerald-400 font-bold mt-0.5">{formatVND(asset.value)}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Người giữ tài sản</p>
              <p className="text-slate-100 font-semibold mt-0.5">{asset.assignee}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Phòng ban quản lý</p>
              <p className="text-slate-100 font-semibold mt-0.5">{asset.department}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Ngày nhập tài sản</p>
              <p className="text-slate-100 font-semibold mt-0.5">{asset.purchaseDate}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Vị trí hiện tại</p>
              <p className="text-slate-100 font-semibold mt-0.5">{asset.location || 'Chưa cập nhật'}</p>
            </div>
          </div>

          {asset.serialNumber && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-0.5 font-medium">Số Serial Number (S/N):</span>
              <span className="font-mono text-indigo-300 font-bold">{asset.serialNumber}</span>
            </div>
          )}

          {asset.notes && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-0.5 font-medium">Ghi chú bổ sung:</span>
              <span className="text-slate-300 italic">{asset.notes}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
