import React from 'react'
import { FilterTab, AssetStats } from '../types/asset'
import { CATEGORY_OPTIONS, STATUS_OPTIONS } from '../data/initialAssets'
import { Filter, ShieldCheck, RefreshCw, Search } from 'lucide-react'

interface AssetFiltersProps {
  stats: AssetStats
  totalFiltered: number
  activeTab: FilterTab
  onTabChange: (tab: FilterTab) => void
  selectedCategory: string
  onCategoryChange: (cat: string) => void
  selectedStatus: string
  onStatusChange: (status: string) => void
  searchTerm: string
  onSearchChange: (search: string) => void
  onResetFilters: () => void
}

export const AssetFilters: React.FC<AssetFiltersProps> = ({
  stats,
  totalFiltered,
  activeTab,
  onTabChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  searchTerm,
  onSearchChange,
  onResetFilters,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4">
      {/* Status Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => onTabChange('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Tất cả ({stats.totalCount})
          </button>
          <button
            onClick={() => onTabChange('using')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'using'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Đang sử dụng ({stats.inUse})
          </button>
          <button
            onClick={() => onTabChange('available')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'available'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Sẵn sàng ({stats.available})
          </button>
          <button
            onClick={() => onTabChange('maintenance')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'maintenance'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Đang bảo trì ({stats.maintenance})
          </button>
          <button
            onClick={() => onTabChange('broken')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'broken'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Hỏng & Thanh lý ({stats.broken})
          </button>
        </div>

        {/* Total Results Summary Badge */}
        <span className="text-xs text-slate-400 font-medium">
          Hiển thị <strong className="text-white">{totalFiltered}</strong> / {stats.totalCount} tài sản
        </span>
      </div>

      {/* Filter Dropdowns & Mobile Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Mobile search bar */}
        <div className="md:hidden relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm tài sản..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 outline-none"
          />
        </div>

        {/* Category Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'Tất cả' ? 'Tất cả Loại tài sản' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter Dropdown */}
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
          >
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st === 'Tất cả' ? 'Tất cả Trạng thái' : st}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filter Button */}
        <button
          onClick={onResetFilters}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Đặt lại bộ lọc</span>
        </button>
      </div>
    </div>
  )
}
