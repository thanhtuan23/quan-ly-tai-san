import React from 'react'
import { AssetStats } from '../types/asset'
import { formatVND } from '../utils/formatters'
import { Tag, Laptop, CheckCircle2, Wrench, AlertTriangle } from 'lucide-react'

interface AdminStatsProps {
  stats: AssetStats
}

export const AdminStats: React.FC<AdminStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Card 1: Total Assets */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Tổng tài sản</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <Tag className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-extrabold text-white">{stats.totalCount}</p>
          <p className="text-[11px] text-indigo-300/80 font-medium mt-1">
            Trị giá: <strong className="text-white">{formatVND(stats.totalVal)}</strong>
          </p>
        </div>
      </div>

      {/* Card 2: In Use */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Đang sử dụng</span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Laptop className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-extrabold text-blue-400">{stats.inUse}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Chiếm {Math.round((stats.inUse / (stats.totalCount || 1)) * 100)}% tổng số
          </p>
        </div>
      </div>

      {/* Card 3: Available */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Sẵn sàng cấp phát</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-extrabold text-emerald-400">{stats.available}</p>
          <p className="text-[11px] text-slate-400 mt-1">Sẵn sàng trong kho</p>
        </div>
      </div>

      {/* Card 4: Under Maintenance */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Đang bảo trì</span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Wrench className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-extrabold text-amber-400">{stats.maintenance}</p>
          <p className="text-[11px] text-slate-400 mt-1">Cần theo dõi kỹ thuật</p>
        </div>
      </div>

      {/* Card 5: Broken / Liquidated */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-rose-500/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Hỏng & Thanh lý</span>
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-extrabold text-rose-400">{stats.broken}</p>
          <p className="text-[11px] text-slate-400 mt-1">Chờ xử lý thu hồi</p>
        </div>
      </div>
    </div>
  )
}
