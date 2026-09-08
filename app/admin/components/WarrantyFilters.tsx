import React from 'react'
import { WarrantyFilterTab, WarrantyStats, WarrantyStatus, WARRANTY_STATUS_LABELS } from '../types/warranty'
import { Search, RotateCcw, AlertTriangle, Clock, CheckCircle2, Filter } from 'lucide-react'

interface WarrantyFiltersProps {
  stats: WarrantyStats
  totalFiltered: number
  activeTab: WarrantyFilterTab
  onTabChange: (tab: WarrantyFilterTab) => void
  selectedLocation: string
  onLocationChange: (location: string) => void
  selectedSupplier: string
  onSupplierChange: (supplier: string) => void
  selectedStatus: string
  onStatusChange: (status: string) => void
  searchTerm: string
  onSearchChange: (term: string) => void
  locationOptions: string[]
  supplierOptions: string[]
  onResetFilters: () => void
}

export const WarrantyFilters: React.FC<WarrantyFiltersProps> = ({
  stats,
  totalFiltered,
  activeTab,
  onTabChange,
  selectedLocation,
  onLocationChange,
  selectedSupplier,
  onSupplierChange,
  selectedStatus,
  onStatusChange,
  searchTerm,
  onSearchChange,
  locationOptions,
  supplierOptions,
  onResetFilters,
}) => {
  const isFiltered =
    searchTerm !== '' ||
    selectedLocation !== 'Tất cả' ||
    selectedSupplier !== 'Tất cả' ||
    selectedStatus !== 'Tất cả' ||
    activeTab !== 'all'

  const urgentTotal = stats.warningCount + stats.overdueCount

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-5 mb-6 space-y-4 shadow-xl shadow-black/20">
      {/* 1. Quick Tabs Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab: All */}
          <button
            onClick={() => onTabChange('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-white'
            }`}
          >
            <span>Tất cả</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {stats.total}
            </span>
          </button>

          {/* Tab: Urgent Warning (7-10d & >10d) */}
          <button
            onClick={() => onTabChange('urgent')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'urgent'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-bold'
                : 'bg-slate-800/80 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 border border-rose-500/20'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Cần xử lý gấp</span>
            {urgentTotal > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                  activeTab === 'urgent'
                    ? 'bg-white/20 text-white'
                    : 'bg-rose-500/20 text-rose-300 animate-pulse'
                }`}
              >
                {urgentTotal}
              </span>
            )}
          </button>

          {/* Tab: In Supplier / In NPP */}
          <button
            onClick={() => onTabChange('in_npp')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'in_npp'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30 font-bold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Đang ở NPP</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                activeTab === 'in_npp' ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {stats.inNpp}
            </span>
          </button>

          {/* Tab: Completed */}
          <button
            onClick={() => onTabChange('completed')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'completed'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã hoàn thành</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                activeTab === 'completed' ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {stats.completedCount}
            </span>
          </button>
        </div>

        {/* Filtered Count indicator */}
        <div className="text-xs text-slate-400 font-medium">
          Hiển thị <strong className="text-white font-bold">{totalFiltered}</strong> / {stats.total} phiếu
        </div>
      </div>

      {/* 2. Controls & Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo Tên SP, IMEI, S/N, NPP..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>

        {/* Location Filter */}
        <div>
          <select
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-2.5 px-3 text-xs text-slate-200 outline-none transition-all"
          >
            <option value="Tất cả">Nơi gửi về (Tất cả)</option>
            {locationOptions.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Supplier / NPP Filter */}
        <div>
          <select
            value={selectedSupplier}
            onChange={(e) => onSupplierChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-2.5 px-3 text-xs text-slate-200 outline-none transition-all"
          >
            <option value="Tất cả">Nhà Phân Phối / NPP (Tất cả)</option>
            {supplierOptions.map((sup) => (
              <option key={sup} value={sup}>
                {sup}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter & Reset Button */}
        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-2.5 px-3 text-xs text-slate-200 outline-none transition-all"
          >
            <option value="Tất cả">Trạng thái (Tất cả)</option>
            {Object.entries(WARRANTY_STATUS_LABELS).map(([stKey, { label }]) => (
              <option key={stKey} value={stKey}>
                {label}
              </option>
            ))}
          </select>

          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition-colors shrink-0"
              title="Đặt lại toàn bộ bộ lọc"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
