import React from 'react'
import { UserStats, UserFilterTab } from '../types/user'
import { Search, RotateCcw, Filter, Users, ShieldCheck, UserCheck, ShieldAlert, Ban, Clock } from 'lucide-react'

interface UserFiltersProps {
  stats: UserStats
  totalFiltered: number
  activeTab: UserFilterTab
  onTabChange: (tab: UserFilterTab) => void
  selectedRole: string
  onRoleChange: (role: string) => void
  selectedStatus: string
  onStatusChange: (status: string) => void
  searchTerm: string
  onSearchChange: (val: string) => void
  onResetFilters: () => void
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  stats,
  totalFiltered,
  activeTab,
  onTabChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  searchTerm,
  onSearchChange,
  onResetFilters,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 lg:p-6 space-y-4 shadow-xl">
      {/* Top Filter Bar: Tabs & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => onTabChange('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Tất cả ({stats.totalUsers})</span>
          </button>

          <button
            onClick={() => onTabChange('admin')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin ({stats.adminCount})</span>
          </button>

          <button
            onClick={() => onTabChange('user')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'user'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Nhân viên ({stats.employeeCount})</span>
          </button>

          <button
            onClick={() => onTabChange('active')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'active'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Hoạt động ({stats.activeCount})</span>
          </button>

          <button
            onClick={() => onTabChange('inactive')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'inactive'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Tạm ngưng ({stats.inactiveCount || 0})</span>
          </button>

          <button
            onClick={() => onTabChange('banned')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'banned'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Đã khóa ({stats.bannedCount || 0})</span>
          </button>
        </div>

        {/* Search & Reset */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm theo Tên, Email, Phòng ban..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <button
            onClick={onResetFilters}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Đặt lại bộ lọc"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Dropdown Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400 font-medium">Lọc theo:</span>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Vai trò:</span>
            <select
              value={selectedRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 outline-none focus:border-indigo-500 text-xs"
            >
              <option value="Tất cả">Tất cả vai trò</option>
              <option value="admin">Quản trị viên (Admin)</option>
              <option value="user">Nhân viên (User)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Trạng thái:</span>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 outline-none focus:border-indigo-500 text-xs"
            >
              <option value="Tất cả">Tất cả trạng thái</option>
              <option value="active">🟢 Đang hoạt động (Active)</option>
              <option value="inactive">🟡 Tạm ngưng (Inactive)</option>
              <option value="banned">🔴 Đã khóa (Banned)</option>
            </select>
          </div>
        </div>

        {/* Counter Results */}
        <div className="text-slate-400 font-medium">
          Hiển thị <strong className="text-indigo-400">{totalFiltered}</strong> / {stats.totalUsers} tài khoản
        </div>
      </div>
    </div>
  )
}
