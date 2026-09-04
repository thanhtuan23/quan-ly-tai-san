import React from 'react'
import { AssetStatus } from '../types/asset'
import { CheckCircle2, Laptop, Wrench, AlertTriangle, XCircle } from 'lucide-react'

interface StatusBadgeProps {
  status: AssetStatus
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'Sẵn sàng':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5" /> Sẵn sàng
        </span>
      )
    case 'Đang sử dụng':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 whitespace-nowrap">
          <Laptop className="w-3.5 h-3.5" /> Đang sử dụng
        </span>
      )
    case 'Bảo trì':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
          <Wrench className="w-3.5 h-3.5" /> Bảo trì
        </span>
      )
    case 'Hỏng':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 whitespace-nowrap">
          <AlertTriangle className="w-3.5 h-3.5" /> Hỏng
        </span>
      )
    case 'Thanh lý':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20 whitespace-nowrap">
          <XCircle className="w-3.5 h-3.5" /> Thanh lý
        </span>
      )
    default:
      return null
  }
}
