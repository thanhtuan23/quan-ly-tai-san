import React from 'react'
import { InspectionStats as InspectionStatsType } from '../types/inspection'
import { CheckSquare, CheckCircle2, AlertTriangle, AlertCircle, Clock, Percent } from 'lucide-react'

interface InspectionStatsProps {
  stats: InspectionStatsType
}

export const InspectionStats: React.FC<InspectionStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Tổng thiết bị */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg shadow-black/20">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-slate-400">Tổng thiết bị</span>
          <div className="w-7 h-7 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <CheckSquare className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-white tracking-tight">{stats.totalDevices}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Cần kiểm tra định kỳ</p>
        </div>
      </div>

      {/* 2. Đã kiểm tra hôm nay */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg shadow-black/20">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-sky-400">Đã kiểm tra</span>
          <div className="w-7 h-7 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-sky-400 tracking-tight">{stats.checkedToday}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Trong ca trực hôm nay</p>
        </div>
      </div>

      {/* 3. Hoạt động tốt */}
      <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-3.5 flex flex-col justify-between hover:border-emerald-500/50 transition-all shadow-lg shadow-emerald-500/5 bg-gradient-to-br from-emerald-500/5 to-transparent">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-emerald-400">Tốt / Ổn định</span>
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-emerald-400 tracking-tight">{stats.healthyCount}</div>
          <p className="text-[10px] text-emerald-400/80 mt-0.5">Vận hành bình thường</p>
        </div>
      </div>

      {/* 4. Chập chờn ⚠️ */}
      <div className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-3.5 flex flex-col justify-between hover:border-amber-500/60 transition-all shadow-lg shadow-amber-500/10 bg-gradient-to-br from-amber-500/10 to-transparent">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Chập chờn ⚠️
          </span>
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-amber-300 tracking-tight">{stats.unstableCount}</div>
          <p className="text-[10px] text-amber-300/80 mt-0.5 font-medium">Cần theo dõi sát</p>
        </div>
      </div>

      {/* 5. Hư hỏng 🚨 */}
      <div className="bg-slate-900/80 border border-rose-500/40 rounded-2xl p-3.5 flex flex-col justify-between hover:border-rose-500/60 transition-all shadow-lg shadow-rose-500/10 bg-gradient-to-br from-rose-500/10 to-transparent">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-rose-300 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 animate-bounce" />
            Hư hỏng 🚨
          </span>
          <div className="w-7 h-7 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-rose-400 tracking-tight">{stats.damagedCount}</div>
          <p className="text-[10px] text-rose-300/90 mt-0.5 font-medium">Lên kế hoạch thay thế</p>
        </div>
      </div>

      {/* 6. Tỷ lệ hoàn thành ca */}
      <div className="col-span-2 sm:col-span-1 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg shadow-black/20">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-purple-400">Tiến độ ca</span>
          <div className="w-7 h-7 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Percent className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-purple-300 tracking-tight">
            {stats.completionRate}%
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {stats.uncheckedToday > 0 ? `Còn ${stats.uncheckedToday} chưa check` : 'Đã xong ca trực!'}
          </p>
        </div>
      </div>
    </div>
  )
}
