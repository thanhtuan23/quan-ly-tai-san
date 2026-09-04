import React from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Search, Download, Plus, LogOut, X } from 'lucide-react'

interface AdminHeaderProps {
  searchTerm: string
  onSearchChange: (val: string) => void
  onExportCSV: () => void
  onOpenAddModal: () => void
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onExportCSV,
  onOpenAddModal,
}) => {
  const router = useRouter()

  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wide bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Quản lý tài sản JGA
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                ADMIN 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Hệ thống quản lý tài sản doanh nghiệp</p>
          </div>
        </div>
      </div>

      {/* Global Quick Search Header Input */}
      <div className="hidden md:flex items-center max-w-md w-full mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo Mã TS, Tên tài sản, Người quản lý..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Header Admin Profile & Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onExportCSV}
          className="hidden sm:inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-all"
          title="Xuất danh sách ra file CSV"
        >
          <Download className="w-4 h-4 text-indigo-400" />
          <span>Xuất CSV</span>
        </button>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm tài sản</span>
        </button>

        <div className="h-6 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

        {/* User Account Info */}
        <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-900/60 border border-indigo-700/50 flex items-center justify-center text-indigo-300 font-bold text-xs">
            AD
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-slate-200 leading-tight">Admin Manager</p>
            <p className="text-[10px] text-slate-400">admin@jga.vn</p>
          </div>
          <button
            onClick={() => router.push('/auth/login')}
            className="text-slate-400 hover:text-rose-400 p-1 rounded-lg transition-colors ml-1"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
