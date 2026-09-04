import React from 'react'
import { Asset } from '../types/asset'
import { AlertTriangle } from 'lucide-react'

interface DeleteConfirmModalProps {
  assetToDelete: Asset | null
  onClose: () => void
  onConfirm: () => void
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  assetToDelete,
  onClose,
  onConfirm,
}) => {
  if (!assetToDelete) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center gap-3 text-rose-400">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Xác nhận xóa tài sản</h3>
            <p className="text-xs text-rose-300/80">Hành động này không thể hoàn tác</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Bạn có chắc chắn muốn xóa tài sản{' '}
          <strong className="text-white font-semibold">{assetToDelete.name}</strong> (Mã:{' '}
          <strong className="text-indigo-300 font-mono">{assetToDelete.code}</strong>) khỏi hệ thống quản lý?
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all active:scale-95"
          >
            Xóa vĩnh viễn
          </button>
        </div>
      </div>
    </div>
  )
}
