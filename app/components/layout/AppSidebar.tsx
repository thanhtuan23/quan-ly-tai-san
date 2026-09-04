'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Laptop,
  Users,
  UserCheck,
  PlusCircle,
  Wrench,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react'

export type PortalType = 'admin' | 'user'

interface AppSidebarProps {
  currentPortal: PortalType
  activeItem?: string
  onSelectNavItem?: (itemId: string) => void
  currentUser?: {
    id?: string
    email?: string
    full_name?: string
    role?: 'admin' | 'user'
    department?: string
  } | null
  isMobileOpen: boolean
  onCloseMobile: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  counts?: {
    assets?: number
    users?: number
    myAssets?: number
  }
  onLogout?: () => void
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentPortal,
  activeItem = '',
  onSelectNavItem,
  currentUser,
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
  counts = {},
  onLogout,
}) => {
  const router = useRouter()

  const displayName = currentUser?.full_name || currentUser?.email?.split('@')[0] || 'Thành viên'
  const displayEmail = currentUser?.email || 'user@company.com'
  const userRole = currentUser?.role || 'user'
  const isAdmin = userRole === 'admin'

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

  const handleItemClick = (itemId: string, targetRoute?: string) => {
    onCloseMobile()
    if (onSelectNavItem) {
      onSelectNavItem(itemId)
    }
    if (targetRoute) {
      router.push(targetRoute)
    }
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 ease-in-out ${
          /* Mobile slide-in */
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          /* Desktop width */
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } w-72`}
      >
        {/* Top: Brand Header & App Title */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div
            onClick={() => router.push(currentPortal === 'admin' ? '/admin' : '/user')}
            className="flex items-center gap-3 cursor-pointer select-none overflow-hidden"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-md shadow-indigo-600/20">
              <Building2 className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-wide bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent truncate">
                    Trang chủ
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold border uppercase tracking-wider ${
                      currentPortal === 'admin'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    }`}
                  >
                    {currentPortal === 'admin' ? 'Admin' : 'User'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Quản lý tài sản nội bộ</p>
              </div>
            )}
          </div>

          {/* Close on Mobile / Collapse on Desktop */}
          <div className="flex items-center">
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title={isCollapsed ? 'Mở rộng thanh menu' : 'Thu gọn thanh menu'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Middle: Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {/* Section: Admin Portal Navigation */}
          {currentPortal === 'admin' && (
            <div className="space-y-1.5">
              {!isCollapsed && (
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
                  Quản trị hệ thống
                </p>
              )}

              {/* Item: Asset Management */}
              <button
                onClick={() => handleItemClick('assets', '/admin')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all group ${
                  activeItem === 'assets'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title="Quản lý danh sách tài sản"
              >
                <Laptop
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    activeItem === 'assets' ? 'text-white' : 'text-indigo-400'
                  }`}
                />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="truncate">Quản lý Tài sản</span>
                    {typeof counts.assets === 'number' && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                          activeItem === 'assets'
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {counts.assets}
                      </span>
                    )}
                  </div>
                )}
              </button>

              {/* Item: User Management */}
              <button
                onClick={() => handleItemClick('users', '/admin')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all group ${
                  activeItem === 'users'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title="Quản lý tài khoản người dùng"
              >
                <Users
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    activeItem === 'users' ? 'text-white' : 'text-purple-400'
                  }`}
                />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="truncate">Quản lý Người dùng</span>
                    {typeof counts.users === 'number' && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                          activeItem === 'users'
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {counts.users}
                      </span>
                    )}
                  </div>
                )}
              </button>
            </div>
          )}

          {/* Section: User Portal Navigation */}
          {currentPortal === 'user' && (
            <div className="space-y-1.5">
              {!isCollapsed && (
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
                  Không gian cá nhân
                </p>
              )}

              {/* Item: My Assets */}
              <button
                onClick={() => handleItemClick('my-assets', '/user')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all group ${
                  activeItem === 'my-assets'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title="Tài sản của tôi"
              >
                <Laptop
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    activeItem === 'my-assets' ? 'text-white' : 'text-blue-400'
                  }`}
                />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="truncate">Tài sản của tôi</span>
                    {typeof counts.myAssets === 'number' && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                          activeItem === 'my-assets'
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {counts.myAssets}
                      </span>
                    )}
                  </div>
                )}
              </button>

              {/* Item: Request Asset */}
              <button
                onClick={() => handleItemClick('request-modal')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all group text-slate-300 hover:bg-slate-800/80 hover:text-white ${
                  isCollapsed ? 'justify-center px-0' : ''
                }`}
                title="Gửi đề xuất cấp phát thiết bị mới"
              >
                <PlusCircle className="w-4 h-4 shrink-0 text-emerald-400 transition-transform group-hover:scale-110" />
                {!isCollapsed && <span className="truncate">Đề xuất cấp phát</span>}
              </button>

              {/* Item: Report Issue */}
              <button
                onClick={() => handleItemClick('report-modal')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all group text-slate-300 hover:bg-slate-800/80 hover:text-white ${
                  isCollapsed ? 'justify-center px-0' : ''
                }`}
                title="Báo cáo sự cố hoặc hư hỏng"
              >
                <Wrench className="w-4 h-4 shrink-0 text-rose-400 transition-transform group-hover:scale-110" />
                {!isCollapsed && <span className="truncate">Báo hỏng / Sự cố</span>}
              </button>
            </div>
          )}

          {/* Section: Switch Portal Shortcut for Admins */}
          {isAdmin && (
            <div className="space-y-1.5 pt-4 border-t border-slate-800/80">
              {!isCollapsed && (
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
                  Chuyển đổi phân hệ
                </p>
              )}

              {currentPortal === 'admin' ? (
                <button
                  onClick={() => router.push('/user')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all group bg-blue-950/40 border border-blue-800/40 text-blue-300 hover:bg-blue-900/60 hover:text-white ${
                    isCollapsed ? 'justify-center px-0' : ''
                  }`}
                  title="Chuyển sang Cổng Nhân viên (Xem tài sản cá nhân)"
                >
                  <UserCheck className="w-4 h-4 shrink-0 text-blue-400" />
                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="truncate">Cổng Nhân viên</span>
                      <ExternalLink className="w-3 h-3 text-blue-400" />
                    </div>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => router.push('/admin')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all group bg-purple-950/40 border border-purple-800/40 text-purple-300 hover:bg-purple-900/60 hover:text-white ${
                    isCollapsed ? 'justify-center px-0' : ''
                  }`}
                  title="Chuyển sang Trang Quản trị Admin"
                >
                  <ShieldCheck className="w-4 h-4 shrink-0 text-purple-400" />
                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="truncate">Trang Quản trị Admin</span>
                      <ExternalLink className="w-3 h-3 text-purple-400" />
                    </div>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom: User Card & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div
            className={`flex items-center gap-2.5 rounded-2xl p-2 transition-all ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            {/* User Avatar & Info */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                  userRole === 'admin'
                    ? 'bg-purple-950/80 border-purple-500/40 text-purple-300 shadow-sm'
                    : 'bg-blue-950/80 border-blue-500/40 text-blue-300 shadow-sm'
                }`}
              >
                {initials}
              </div>

              {!isCollapsed && (
                <div className="min-w-0 text-left">
                  <p className="text-xs font-bold text-white truncate">{displayName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{displayEmail}</p>
                </div>
              )}
            </div>

            {/* Logout button */}
            {!isCollapsed && (
              <button
                onClick={handleLogoutClick}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-colors shrink-0"
                title="Đăng xuất khỏi hệ thống"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {isCollapsed && (
            <div className="pt-2 flex justify-center">
              <button
                onClick={handleLogoutClick}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
