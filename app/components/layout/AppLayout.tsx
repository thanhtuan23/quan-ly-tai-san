'use client'

import React, { useState } from 'react'
import { AppSidebar, PortalType } from './AppSidebar'
import { AppHeader } from './AppHeader'

interface AppLayoutProps {
  currentPortal: PortalType
  activeItem?: string
  onSelectNavItem?: (itemId: string) => void
  title: string
  subtitle?: string
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
  counts?: {
    assets?: number
    users?: number
    myAssets?: number
  }
  onLogout?: () => void
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentPortal,
  activeItem,
  onSelectNavItem,
  title,
  subtitle,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  actionsSlot,
  currentUser,
  counts,
  onLogout,
  children,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500/30 selection:text-white">
      {/* Shared Sidebar */}
      <AppSidebar
        currentPortal={currentPortal}
        activeItem={activeItem}
        onSelectNavItem={onSelectNavItem}
        currentUser={currentUser}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        counts={counts}
        onLogout={onLogout}
      />

      {/* Main Content Wrapper (shifted by sidebar width on desktop) */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Shared Top Header */}
        <AppHeader
          title={title}
          subtitle={subtitle}
          portal={currentPortal}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          actionsSlot={actionsSlot}
          currentUser={currentUser}
          onLogout={onLogout}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  )
}
