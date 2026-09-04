'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Menu, Search, X, LogOut } from 'lucide-react'

interface AppHeaderProps {
  title: string
  subtitle?: string
  portal: 'admin' | 'user'
  onOpenMobileSidebar: () => void
  searchTerm?: string
  onSearchChange?: (val: string) => void
  searchPlaceholder?: string
  actionsSlot?: React.ReactNode
  currentUser?: {
    id?: string
    email?: string
    full_name?: string
    role?: 'admin' | 'user'
    department?: string
  } | null
  onLogout?: () => void
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  portal,
  onOpenMobileSidebar,
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm thông tin...',
  actionsSlot,
  currentUser,
  onLogout,
}) => {
  const router = useRouter()

  const displayName = currentUser?.full_name || currentUser?.email?.split('@')[0] || 'Thành viên'
  const displayEmail = currentUser?.email || 'user@company.com'
  const userRole = currentUser?.role || 'user'

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'QL'

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout()
    } else {
      router.push('/auth/login')
    }
  }

  return (
    <header className="h-16 min-h-[64px] max-h-[64px] bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between gap-3 shadow-sm shrink-0 select-none">
      {/* Left Column: Mobile Hamburger & Page Title (Fixed frame, no height growth) */}
      <div className="flex items-center gap-3 min-w-0 max-w-[200px] sm:max-w-xs md:max-w-sm shrink-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden w-9 h-9 flex items-center justify-center bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl border border-slate-700 transition-colors shrink-0"
          title="Mở menu điều hướng"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate leading-tight">
              {title}
            </h1>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold border shrink-0 uppercase tracking-wider ${
                portal === 'admin'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
              }`}
            >
              {portal === 'admin' ? 'ADMIN' : 'USER'}
            </span>
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-400 hidden xl:block truncate leading-tight mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Center Column: Global Quick Search (Fixed height h-9) */}
      {typeof onSearchChange === 'function' && (
        <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm xl:max-w-md mx-2 lg:mx-4">
          <div className="relative w-full h-9 flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-9 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-8 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Right Column: Actions Slot & User Profile Card (Fixed height h-9) */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 justify-end h-9">
        {/* Custom Actions Slot (Buttons aligned to standard h-9) */}
        {actionsSlot && (
          <div className="flex items-center gap-1.5 sm:gap-2 h-9">
            {actionsSlot}
          </div>
        )}

        <div className="h-5 w-[1px] bg-slate-800 mx-0.5 hidden sm:block" />

        {/* User Card Pill (Fixed height h-9) */}
        <div className="h-9 flex items-center gap-2 bg-slate-950 px-2.5 sm:px-3 rounded-xl border border-slate-800 shadow-sm shrink-0">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 border ${
              userRole === 'admin'
                ? 'bg-purple-900/60 border-purple-700/50 text-purple-300'
                : 'bg-blue-900/60 border-blue-700/50 text-blue-300'
            }`}
          >
            {initials}
          </div>

          <div className="hidden xl:block text-left min-w-0">
            <p className="text-xs font-bold text-slate-200 leading-none truncate max-w-[100px]">
              {displayName}
            </p>
            <p className="text-[9px] text-slate-400 truncate max-w-[100px] leading-none mt-0.5">
              {userRole === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
            </p>
          </div>

          <button
            onClick={handleLogoutClick}
            className="text-slate-400 hover:text-rose-400 p-0.5 rounded-lg transition-colors ml-0.5"
            title="Đăng xuất"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
