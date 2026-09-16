'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Asset } from '../admin/types/asset'
import { StatusBadge } from '../admin/components/StatusBadge'
import { formatVND } from '../admin/utils/formatters'
import { AppLayout } from '../components/layout/AppLayout'
import { DailyChecklistTable } from '../admin/components/DailyChecklistTable'
import { InspectionHistoryModal } from '../admin/components/InspectionHistoryModal'
import { HologramDashboard } from '../admin/components/HologramDashboard'
import { AssetTable } from '../admin/components/AssetTable'
import { WarrantyTable } from '../admin/components/WarrantyTable'
import { UserTable } from '../admin/components/UserTable'
import { AssetDetailModal } from '../admin/components/AssetDetailModal'
import { WarrantyDetailModal } from '../admin/components/WarrantyDetailModal'
import { useDailyInspection } from '../hooks/useDailyInspection'
import { UserRole, UserModulePermissions, DEFAULT_PERMISSIONS_BY_ROLE, UserProfile, UserStatus } from '../admin/types/user'
import { WarrantyReminder } from '../admin/types/warranty'
import {
  Laptop,
  User,
  Send,
  Wrench,
  Search,
  CheckCircle2,
  PlusCircle,
  X,
  Loader2,
  CheckSquare,
  AlertTriangle,
  ClipboardList,
  BarChart3,
  Users,
  ShieldAlert
} from 'lucide-react'

export default function UserPortalPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<UserRole>('user')
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [loading, setLoading] = useState(true)
  const [myAssets, setMyAssets] = useState<Asset[]>([])
  const [allAssets, setAllAssets] = useState<Asset[]>([])
  const [warrantyItems, setWarrantyItems] = useState<WarrantyReminder[]>([])
  const [usersList, setUsersList] = useState<UserProfile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'my-assets' | 'inspection' | 'reports' | 'assets' | 'warranty' | 'users'>('my-assets')
  const [userPermissions, setUserPermissions] = useState<UserModulePermissions | null>(null)
  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({
    inspection: true,
    reports: true,
    assets: true,
    warranty: true,
    users: true,
    notifications: true
  })

  // Modals & Detail views
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [selectedAssetForReport, setSelectedAssetForReport] = useState<Asset | null>(null)
  const [viewingAssetDetail, setViewingAssetDetail] = useState<Asset | null>(null)
  const [viewingWarrantyDetail, setViewingWarrantyDetail] = useState<WarrantyReminder | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Request form state
  const [requestAssetType, setRequestAssetType] = useState('Laptop / Máy tính làm việc')
  const [requestReason, setRequestReason] = useState('')

  // Report issue form state
  const [issueDescription, setIssueDescription] = useState('')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Calculate effective permissions
  const effectivePermissions: UserModulePermissions = useMemo(() => {
    const roleDefault = DEFAULT_PERMISSIONS_BY_ROLE[userRole] || DEFAULT_PERMISSIONS_BY_ROLE.user
    return {
      ...roleDefault,
      ...(userPermissions || {})
    }
  }, [userRole, userPermissions])

  // Permission flags based on global module switches + user permissions
  const canSeeInspection =
    enabledModules.inspection !== false && effectivePermissions.canDoInspection === true
  const canSeeReports =
    enabledModules.reports !== false && effectivePermissions.canViewReports === true
  const canSeeAllAssets =
    enabledModules.assets !== false && (effectivePermissions.canEditAssets === true || userRole === 'manager')
  const canSeeWarranty =
    enabledModules.warranty !== false && (effectivePermissions.canViewWarranty === true || effectivePermissions.canEditWarranty === true)
  const canSeeUsers =
    enabledModules.users !== false && effectivePermissions.canManageUsers === true

  // Load Module Settings from DB (admin row) + localStorage + listen to Realtime broadcast
  useEffect(() => {
    const applySettings = (parsed: any) => {
      if (parsed?.modules) {
        setEnabledModules((prev) => ({ ...prev, ...parsed.modules }))
        try {
          localStorage.setItem('qlts_module_settings', JSON.stringify(parsed))
        } catch { /* ignore */ }
      }
    }

    // 1. Đọc cache localStorage
    try {
      const saved = localStorage.getItem('qlts_module_settings')
      if (saved) applySettings(JSON.parse(saved))
    } catch { /* ignore */ }

    // 2. Fetch system module settings từ database profiles table (row role admin)
    const fetchSystemSettings = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('permissions')
          .eq('role', 'admin')
          .order('updated_at', { ascending: false })
          .limit(1)

        if (data && data.length > 0) {
          const p = data[0].permissions as any
          if (p?._system_modules) {
            applySettings({ modules: p._system_modules })
          }
        }
      } catch (e) {
        console.warn('Cannot fetch system module settings:', e)
      }
    }
    fetchSystemSettings()

    // 3. Subscribe Realtime broadcast để nhận module settings từ Admin (mọi thiết bị)
    const ch = supabase
      .channel('system:module_settings')
      .on('broadcast', { event: 'module_settings_changed' }, ({ payload }: { payload: any }) => {
        console.log('[User] Module settings changed by Admin:', payload)
        applySettings(payload)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(ch)
    }
  }, [supabase])

  const displayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Thành viên'
  const displayEmail = currentUser?.email || 'user@company.com'
  const department = currentUser?.user_metadata?.department || 'Phòng IT & Công nghệ'

  // Sử dụng Hook useDailyInspection dùng chung cho User
  const {
    inspectableDevices,
    inspectionLogs,
    stats: inspectionStats,
    historyViewingDevice,
    setHistoryViewingDevice,
    fetchData: fetchInspectionData,
    handleQuickCheck
  } = useDailyInspection({
    userRole: userRole as any,
    userName: displayName,
    userId: currentUser?.id,
    department: department,
    onShowToast: showToast
  })

  // Check auth and fetch user profile + assigned assets
  const checkAuthAndFetchAssets = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push('/auth/login')
        return
      }

      let role = (user.user_metadata?.role as UserRole) || 'user'
      let fullName = user.user_metadata?.full_name || ''
      let dept = user.user_metadata?.department || 'Phòng ban'

      // Fetch from database profiles table (role, permissions, etc.)
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name, department, status, permissions')
          .eq('id', user.id)
          .single()

        if (profile) {
          if (profile.status && profile.status !== 'active') {
            await supabase.auth.signOut()
            router.push('/auth/login')
            return
          }
          if (profile.role) role = profile.role as UserRole
          if (profile.full_name) fullName = profile.full_name
          if (profile.department) dept = profile.department
          if (profile.permissions) {
            setUserPermissions(profile.permissions)
          }
        }
      } catch (e) {
        console.warn('Cannot fetch profile:', e)
      }

      setCurrentUser({
        ...user,
        user_metadata: {
          ...user.user_metadata,
          full_name: fullName,
          role: role,
          department: dept
        }
      })
      setUserRole(role)

      // Fetch assets assigned to this user
      const userName = fullName || user.email?.split('@')[0] || ''
      const userEmail = user.email || ''

      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .or(`assignee.ilike.%${userName}%,assignee.ilike.%${userEmail}%`)

      if (data && !error) {
        setMyAssets(
          data.map((row: any) => ({
            id: String(row.id),
            code: row.code || 'TS-UNKNOWN',
            name: row.name || 'Tài sản',
            category: row.category || 'IT',
            status: row.status || 'Đang sử dụng',
            assignee: row.assignee || userName,
            department: row.department || 'Phòng ban',
            value: Number(row.value) || 0,
            purchaseDate: row.purchase_date || row.purchaseDate || '',
            location: row.location || 'Văn phòng',
            serialNumber: row.serial_number || row.serialNumber || '',
            notes: row.notes || ''
          }))
        )
      }
    } catch (err) {
      console.error('Error in user portal:', err)
      router.push('/auth/login')
    } finally {
      setLoading(false)
      setIsAuthChecking(false)
    }
  }, [router, supabase])

  // Listen to realtime user permission updates
  useEffect(() => {
    if (!currentUser?.id) return

    // 1. Channel broadcast for permission changes
    const userChannel = supabase
      .channel(`user:permissions:${currentUser.id}`)
      .on('broadcast', { event: 'permissions_updated' }, ({ payload }: { payload: any }) => {
        console.log('[User] Permissions updated via Realtime broadcast:', payload)
        if (payload?.permissions) setUserPermissions(payload.permissions)
        if (payload?.role) setUserRole(payload.role)
        showToast('Quyền hạn tài khoản của bạn vừa được Quản trị viên cập nhật!')
      })
      .subscribe()

    // 2. Postgres realtime change on profiles
    const profileSub = supabase
      .channel(`db:profile:${currentUser.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${currentUser.id}` },
        (payload: any) => {
          console.log('[User] Profile updated in DB:', payload.new)
          if (payload.new?.permissions) setUserPermissions(payload.new.permissions)
          if (payload.new?.role) setUserRole(payload.new.role)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(userChannel)
      supabase.removeChannel(profileSub)
    }
  }, [currentUser?.id, supabase])

  useEffect(() => {
    checkAuthAndFetchAssets()
    fetchInspectionData()
  }, [checkAuthAndFetchAssets, fetchInspectionData])

  // Fetch additional data when delegated modules are enabled
  useEffect(() => {
    if (canSeeAllAssets || canSeeReports) {
      supabase.from('assets').select('*').then(({ data }: { data: any }) => {
        if (data) {
          setAllAssets(
            data.map((row: any) => ({
              id: String(row.id),
              code: row.code || 'TS-UNKNOWN',
              name: row.name || 'Tài sản',
              model: row.model || '',
              category: row.category || 'IT',
              status: row.status || 'Đang sử dụng',
              assignee: row.assignee || 'Chưa cấp phát',
              department: row.department || 'Phòng ban',
              value: Number(row.value) || 0,
              purchaseDate: row.purchase_date || '',
              warrantyYears: Number(row.warranty_years) || 2,
              location: row.location || 'Văn phòng',
              serialNumber: row.serial_number || '',
              notes: row.notes || ''
            }))
          )
        }
      })
    }

    if (canSeeWarranty || canSeeReports) {
      supabase.from('warranty_reminders').select('*').then(({ data }: { data: any }) => {
        if (data) {
          setWarrantyItems(
            data.map((row: any) => ({
              id: String(row.id),
              assetCode: row.asset_code || '',
              assetName: row.asset_name || '',
              supplier: row.supplier || '',
              location: row.location || '',
              sentDate: row.sent_date || '',
              expectedReturnDate: row.expected_return_date || '',
              returnedDate: row.returned_date || '',
              status: row.status || 'dang_bao_hanh',
              issueDescription: row.issue_description || '',
              cost: Number(row.cost) || 0,
              handler: row.handler || '',
              notes: row.notes || ''
            }))
          )
        }
      })
    }

    if (canSeeUsers) {
      supabase.from('profiles').select('*').then(({ data }: { data: any }) => {
        if (data) {
          setUsersList(
            data.map((row: any) => ({
              id: row.id,
              email: row.email || '',
              fullName: row.full_name || '',
              role: row.role || 'user',
              department: row.department || '',
              avatarUrl: row.avatar_url,
              status: row.status || 'active',
              permissions: row.permissions
            }))
          )
        }
      })
    }
  }, [canSeeAllAssets, canSeeReports, canSeeWarranty, canSeeUsers, supabase])

  // Auto-switch activeTab nếu module/quyền bị tắt sau khi đã vào tab
  useEffect(() => {
    if (activeTab === 'inspection' && !canSeeInspection) setActiveTab('my-assets')
    if (activeTab === 'reports' && !canSeeReports) setActiveTab('my-assets')
    if (activeTab === 'assets' && !canSeeAllAssets) setActiveTab('my-assets')
    if (activeTab === 'warranty' && !canSeeWarranty) setActiveTab('my-assets')
    if (activeTab === 'users' && !canSeeUsers) setActiveTab('my-assets')
  }, [activeTab, canSeeInspection, canSeeReports, canSeeAllAssets, canSeeWarranty, canSeeUsers])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestReason) {
      alert('Vui lòng nhập lý do đề xuất cấp phát thiết bị')
      return
    }
    showToast('Đã gửi yêu cầu cấp phát tài sản đến Quản trị viên!')
    setIsRequestModalOpen(false)
    setRequestReason('')
  }

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault()
    if (!issueDescription) {
      alert('Vui lòng mô tả sự cố hoặc tình trạng thiết bị')
      return
    }
    showToast(`Đã gửi báo cáo sự cố cho tài sản ${selectedAssetForReport?.code}!`)
    setIsReportModalOpen(false)
    setIssueDescription('')
    setSelectedAssetForReport(null)
  }

  const filteredMyAssets = myAssets.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAllAssets = allAssets.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assignee.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const actionsSlot = (
    <button
      onClick={() => setIsRequestModalOpen(true)}
      className="h-9 inline-flex items-center gap-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
    >
      <PlusCircle className="w-4 h-4" />
      <span>Đề xuất cấp phát</span>
    </button>
  )

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 animate-pulse shadow-lg shadow-blue-500/10">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-white">Đang xác thực thông tin tài khoản...</p>
          <p className="text-xs text-slate-400">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    )
  }

  return (
    <AppLayout
      currentPortal="user"
      activeItem={
        activeTab === 'my-assets'
          ? 'my-assets'
          : activeTab === 'inspection'
          ? 'user-inspection'
          : activeTab
      }
      onSelectNavItem={(item) => {
        if (item === 'my-assets') setActiveTab('my-assets')
        if (item === 'user-inspection') setActiveTab('inspection')
        if (item === 'reports') setActiveTab('reports')
        if (item === 'assets') setActiveTab('assets')
        if (item === 'warranty') setActiveTab('warranty')
        if (item === 'users') setActiveTab('users')
        if (item === 'request-modal') setIsRequestModalOpen(true)
        if (item === 'report-modal') {
          if (myAssets.length > 0) {
            setSelectedAssetForReport(myAssets[0])
          }
          setIsReportModalOpen(true)
        }
      }}
      title={
        activeTab === 'my-assets'
          ? 'Cổng Thông Tin Tài Sản Cá Nhân'
          : activeTab === 'inspection'
          ? 'Kiểm Tra & Checklist Thiết Bị Hàng Ngày'
          : activeTab === 'reports'
          ? 'Dashboard & Báo Cáo Phân Tích'
          : activeTab === 'assets'
          ? 'Danh Mục Tài Sản Toàn Công Ty'
          : activeTab === 'warranty'
          ? 'Nhắc Việc & Tiến Độ Bảo Hành'
          : 'Quản Trị Người Dùng & Phân Quyền'
      }
      subtitle={
        activeTab === 'my-assets'
          ? 'Theo dõi và quản lý các trang thiết bị công ty đã cấp phát cho bạn'
          : activeTab === 'inspection'
          ? 'Thực hiện chấm checklist kiểm tra tình trạng máy móc thiết bị theo ca trực'
          : activeTab === 'reports'
          ? 'Biểu đồ trực quan và phân tích khấu hao thiết bị'
          : activeTab === 'assets'
          ? 'Tra cứu và quản lý toàn bộ danh mục tài sản'
          : activeTab === 'warranty'
          ? 'Theo dõi thiết bị gửi bảo hành nhà phân phối'
          : 'Danh sách tài khoản và phân quyền thành viên'
      }
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder={
        activeTab === 'my-assets'
          ? 'Tìm kiếm tài sản theo tên, mã TS...'
          : activeTab === 'inspection'
          ? 'Tìm kiếm thiết bị cần kiểm tra...'
          : 'Tìm kiếm dữ liệu...'
      }
      actionsSlot={actionsSlot}
      currentUser={
        currentUser
          ? {
              email: displayEmail,
              full_name: displayName,
              role: userRole,
              department: currentUser.user_metadata?.department,
              permissions: effectivePermissions
            }
          : null
      }
      enabledModules={enabledModules}
      counts={{
        myAssets: myAssets.length,
        assets: allAssets.length,
        warranty: warrantyItems.length,
        users: usersList.length,
        inspectionUnchecked: inspectionStats.uncheckedToday,
        inspectionAlerts: inspectionStats.unstableCount + inspectionStats.damagedCount
      }}
      onLogout={handleLogout}
    >
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-400/30 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Banner notification for Role info */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/20 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-semibold mb-1">
            <User className="w-3 h-3" /> Tài khoản: <span className="uppercase font-bold">{userRole}</span>
          </div>
          <h2 className="text-xl font-bold text-white">Xin chào, {displayName}!</h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Hệ thống quản lý tài sản và phân hệ công việc cá nhân. Các tính năng bạn nhìn thấy được cấu hình trực tiếp từ Quản trị viên hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Đề xuất cấp phát</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation Switches */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('my-assets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'my-assets'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>Tài sản của tôi ({myAssets.length})</span>
        </button>

        {canSeeInspection && (
          <button
            onClick={() => setActiveTab('inspection')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'inspection'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Nhiệm vụ Kiểm Tra & Checklist</span>
            {inspectionStats.uncheckedToday > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500/20 text-amber-300 font-mono">
                {inspectionStats.uncheckedToday} cần làm
              </span>
            )}
          </button>
        )}

        {canSeeReports && (
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'reports'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard & Báo Cáo</span>
          </button>
        )}

        {canSeeAllAssets && (
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'assets'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Danh Mục Tài Sản ({allAssets.length})</span>
          </button>
        )}

        {canSeeWarranty && (
          <button
            onClick={() => setActiveTab('warranty')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'warranty'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Nhắc Việc Bảo Hành ({warrantyItems.length})</span>
          </button>
        )}

        {canSeeUsers && (
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'users'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Quản Trị Người Dùng ({usersList.length})</span>
          </button>
        )}
      </div>

      {/* VIEW 1: MY ASSETS LIST */}
      {activeTab === 'my-assets' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Laptop className="w-5 h-5 text-indigo-400" />
                Tài sản đang phụ trách ({myAssets.length})
              </h3>
              <p className="text-xs text-slate-400">Danh sách các thiết bị công ty được giao cho bạn quản lý</p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm tài sản..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {filteredMyAssets.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-300">Bạn chưa được cấp phát tài sản nào</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nhấn nút &ldquo;Đề xuất cấp phát&rdquo; ở trên để gửi yêu cầu mượn máy tính, màn hình hoặc thiết bị làm việc.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMyAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 transition-all hover:shadow-lg hover:shadow-indigo-500/5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                        {asset.code}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1.5">{asset.name}</h4>
                      <p className="text-xs text-slate-400">Loại: {asset.category}</p>
                    </div>
                    <StatusBadge status={asset.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                    {effectivePermissions.canViewPrice && (
                      <div>
                        <span className="text-[10px] text-slate-500 block">Nguyên giá:</span>
                        <strong className="text-emerald-400">{formatVND(asset.value)}</strong>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] text-slate-500 block">Ngày cấp:</span>
                      <span>{asset.purchaseDate || 'Mới cấp'}</span>
                    </div>
                    {asset.serialNumber && (
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-500 block">S/N:</span>
                        <span className="font-mono text-slate-300">{asset.serialNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/60">
                    <button
                      onClick={() => {
                        setSelectedAssetForReport(asset)
                        setIsReportModalOpen(true)
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-rose-300 hover:text-rose-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Báo hỏng / Sự cố</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: DAILY INSPECTION CHECKLIST */}
      {activeTab === 'inspection' && canSeeInspection && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Phân hệ Thực thi Ca trực
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-sky-400" />
                Nhiệm vụ Kiểm Tra Thiết Bị Ca Trực Hôm Nay
              </h3>
              <p className="text-xs text-slate-400">
                Hãy kiểm tra tình trạng từng thiết bị và bấm chọn tình trạng tương ứng: <b>Tốt</b>, <b>Chập chờn</b> hoặc <b>Hư hỏng</b>.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 shrink-0">
              <div className="text-right">
                <p className="text-[11px] text-slate-400 font-medium">Tiến độ hôm nay</p>
                <p className="text-sm font-bold text-sky-400 font-mono">
                  {inspectionStats.checkedToday} / {inspectionStats.totalDevices} thiết bị ({inspectionStats.completionRate}%)
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-bold text-xs">
                {inspectionStats.completionRate}%
              </div>
            </div>
          </div>

          <DailyChecklistTable
            devices={inspectableDevices}
            currentUserName={displayName}
            canDoInspection={true}
            onQuickCheck={handleQuickCheck}
            onViewHistory={(dev) => setHistoryViewingDevice(dev)}
          />
        </div>
      )}

      {/* VIEW 3: HOLOGRAM DASHBOARD & REPORTS (DELEGATED) */}
      {activeTab === 'reports' && canSeeReports && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <HologramDashboard
            devices={inspectableDevices}
            inspectionLogs={inspectionLogs}
            warrantyItems={warrantyItems}
            assets={allAssets.length > 0 ? allAssets : myAssets}
            canViewPrice={effectivePermissions.canViewPrice}
            onNavigateToInspection={() => {
              if (canSeeInspection) setActiveTab('inspection')
            }}
            onNavigateToWarranty={() => {
              if (canSeeWarranty) setActiveTab('warranty')
            }}
          />
        </div>
      )}

      {/* VIEW 4: ALL ASSETS MANAGEMENT (DELEGATED) */}
      {activeTab === 'assets' && canSeeAllAssets && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-indigo-400" />
                  Danh Mục Tài Sản Toàn Công Ty ({allAssets.length})
                </h3>
                <p className="text-xs text-slate-400">Bạn đã được cấp quyền tra cứu danh mục thiết bị của công ty</p>
              </div>
            </div>

            <AssetTable
              assets={filteredAllAssets}
              onView={(a) => setViewingAssetDetail(a)}
              onEdit={(a) => setViewingAssetDetail(a)}
              onDelete={() => {}}
            />
          </div>
        </div>
      )}

      {/* VIEW 5: WARRANTY REMINDERS (DELEGATED) */}
      {activeTab === 'warranty' && canSeeWarranty && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Danh Sách Thiết Bị Đang Bảo Hành ({warrantyItems.length})
              </h3>
              <p className="text-xs text-slate-400">Theo dõi tiến độ sửa chữa thiết bị gửi tại nhà phân phối</p>
            </div>

            <WarrantyTable
              items={warrantyItems}
              warningThreshold={7}
              overdueThreshold={10}
              onView={(w) => setViewingWarrantyDetail(w)}
              onEdit={(w) => setViewingWarrantyDetail(w)}
              onDelete={() => {}}
              onQuickComplete={() => {}}
            />
          </div>
        </div>
      )}

      {/* VIEW 6: USERS (DELEGATED) */}
      {activeTab === 'users' && canSeeUsers && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                Danh Sách Thành Viên & Người Dùng ({usersList.length})
              </h3>
              <p className="text-xs text-slate-400">Tài khoản và quyền hạn nhân sự</p>
            </div>

            <UserTable
              users={usersList}
              currentAdminEmail={displayEmail}
              onEdit={() => {}}
              onToggleStatus={() => {}}
              onDelete={() => {}}
            />
          </div>
        </div>
      )}

      {/* MODAL: REQUEST ASSET */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-400" />
                Gửi đề xuất cấp phát tài sản
              </h3>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Loại thiết bị cần mượn</label>
                <select
                  value={requestAssetType}
                  onChange={(e) => setRequestAssetType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-indigo-500"
                >
                  <option value="Laptop / Máy tính làm việc">Laptop / Máy tính làm việc</option>
                  <option value="Màn hình mở rộng (Monitor)">Màn hình mở rộng (Monitor)</option>
                  <option value="Bàn phím & Chuột">Bàn phím & Chuột</option>
                  <option value="Ghế công thái học / Bàn làm việc">Ghế công thái học / Bàn làm việc</option>
                  <option value="Thiết bị văn phòng khác">Thiết bị văn phòng khác</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Lý do & Mô tả nhu cầu <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="Ví dụ: Cần thêm màn hình phụ 27 inch phục vụ công việc lập trình Front-end..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi đề xuất</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REPORT ISSUE */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-rose-400" />
                Báo cáo sự cố / Bảo trì tài sản
              </h3>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendReport} className="space-y-4 text-xs">
              {selectedAssetForReport && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <p className="text-slate-400 text-[11px]">Thiết bị báo cáo sự cố:</p>
                  <p className="font-bold text-white">{selectedAssetForReport.name}</p>
                  <p className="font-mono text-[11px] text-indigo-400">{selectedAssetForReport.code}</p>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Mô tả tình trạng lỗi / hư hỏng <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Ví dụ: Màn hình bị sọc dọc, quạt tản nhiệt kêu to hoặc bàn phím kẹt phím..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi báo cáo sự cố</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INSPECTION HISTORY */}
      <InspectionHistoryModal
        device={historyViewingDevice}
        logs={inspectionLogs}
        onClose={() => setHistoryViewingDevice(null)}
      />

      {/* MODAL: ASSET DETAIL */}
      {viewingAssetDetail && (
        <AssetDetailModal
          asset={viewingAssetDetail}
          onClose={() => setViewingAssetDetail(null)}
        />
      )}

      {/* MODAL: WARRANTY DETAIL */}
      {viewingWarrantyDetail && (
        <WarrantyDetailModal
          item={viewingWarrantyDetail}
          onClose={() => setViewingWarrantyDetail(null)}
        />
      )}
    </AppLayout>
  )
}
