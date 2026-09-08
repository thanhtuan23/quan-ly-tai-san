import React from 'react'
import { WarrantyStats as WarrantyStatsType } from '../types/warranty'
import { Wrench, Clock, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'

interface WarrantyStatsProps {
  stats: WarrantyStatsType
}

export const WarrantyStats: React.FC<WarrantyStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
      {/* 1. Tổng thiết bị bảo hành */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg shadow-black/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-400">Tổng phiếu</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Wrench className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">{stats.total}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Toàn bộ thiết bị tiếp nhận</p>
        </div>
      </div>

      {/* 2. Đang ở NPP */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg shadow-black/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-sky-400">Đang ở NPP</span>
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-sky-400 tracking-tight">{stats.inNpp}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">NPP đang sửa chữa</p>
        </div>
      </div>

      {/* 3. Cảnh báo (7 - 10 ngày) */}
      <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/50 transition-all shadow-lg shadow-amber-500/5 bg-gradient-to-br from-amber-500/5 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Cảnh báo (7-10d)
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-amber-300 tracking-tight">{stats.warningCount}</div>
          <p className="text-[11px] text-amber-300/80 mt-0.5 font-medium">Cần gọi giục tiến độ</p>
        </div>
      </div>

      {/* 4. Quá hạn (> 10 ngày) */}
      <div className="bg-slate-900/80 border border-rose-500/40 rounded-2xl p-4 flex flex-col justify-between hover:border-rose-500/60 transition-all shadow-lg shadow-rose-500/10 bg-gradient-to-br from-rose-500/10 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-rose-300 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 animate-bounce" />
            Quá hạn (&gt;10d)
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-rose-400 tracking-tight">{stats.overdueCount}</div>
          <p className="text-[11px] text-rose-300/90 mt-0.5 font-medium">Xử lý khẩn cấp</p>
        </div>
      </div>

      {/* 5. Đã hoàn thành */}
      <div className="col-span-2 md:col-span-1 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg shadow-black/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-emerald-400">Đã hoàn thành</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">{stats.completedCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Đã bàn giao chi nhánh</p>
        </div>
      </div>
    </div>
  )
}
