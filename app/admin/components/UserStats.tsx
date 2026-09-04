import React from 'react'
import { UserStats as UserStatsType } from '../types/user'
import { Users, ShieldCheck, UserCheck, ShieldAlert } from 'lucide-react'

interface UserStatsProps {
  stats: UserStatsType
}

export const UserStats: React.FC<UserStatsProps> = ({ stats }) => {
  const nonActiveCount = (stats.inactiveCount || 0) + (stats.bannedCount || 0)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Users */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Tổng tài khoản</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-extrabold text-white">{stats.totalUsers}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Đang lưu trữ trong hệ thống
          </p>
        </div>
      </div>

      {/* Card 2: Admins */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Quản trị viên (Admin)</span>
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-extrabold text-purple-400">{stats.adminCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Có toàn quyền quản trị
          </p>
        </div>
      </div>

      {/* Card 3: Employees */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Nhân viên (User)</span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-extrabold text-blue-400">{stats.employeeCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Theo dõi & nhận bàn giao TS
          </p>
        </div>
      </div>

      {/* Card 4: Active / Inactive / Banned */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Trạng thái tài khoản</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-emerald-400">{stats.activeCount}</p>
            <span className="text-xs text-slate-400 font-medium">hoạt động</span>
            {nonActiveCount > 0 && (
              <span className="text-xs text-amber-400 font-medium ml-1">
                ({stats.inactiveCount || 0} tạm ngưng, {stats.bannedCount || 0} khóa)
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {nonActiveCount === 0 ? 'Tất cả tài khoản sẵn sàng' : 'Có tài khoản bị chặn đăng nhập'}
          </p>
        </div>
      </div>
    </div>
  )
}
