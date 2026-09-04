'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

// Types
import { Asset, FilterTab, AssetStats } from './types/asset'
import { UserProfile, UserRole, UserStatus, UserFilterTab, UserStats as UserStatsType } from './types/user'
import { exportAssetsToCSV } from './utils/formatters'

// Shared App Layout
import { AppLayout } from '../components/layout/AppLayout'

// Modular Components - Asset Management
import { AdminStats } from './components/AdminStats'
import { AssetFilters } from './components/AssetFilters'
import { AssetTable } from './components/AssetTable'
import { AssetFormModal } from './components/AssetFormModal'
import { AssetDetailModal } from './components/AssetDetailModal'
import { DeleteConfirmModal } from './components/DeleteConfirmModal'

// Modular Components - User Management
import { UserStats } from './components/UserStats'
import { UserFilters } from './components/UserFilters'
import { UserTable } from './components/UserTable'
import { UserFormModal } from './components/UserFormModal'
import { DeleteUserModal } from './components/DeleteUserModal'

// Icons
import { CheckCircle2, AlertCircle, Loader2, Download, Plus } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()

  // Authenticated Admin User & Auth Checking State
  const [adminUser, setAdminUser] = useState<{ full_name?: string; email?: string; role?: 'admin' | 'user' } | null>(null)
  const [isAuthChecking, setIsAuthChecking] = useState(true)

  // Active View Tab Switcher ('assets' | 'users')
  const [activeView, setActiveView] = useState<'assets' | 'users'>('assets')

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3000)
  }

  // ==========================================
  // SECTION: ASSET MANAGEMENT STATE & LOGIC
  // ==========================================
  const [assets, setAssets] = useState<Asset[]>([])
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [assetSearchTerm, setAssetSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả')
  const [selectedStatus, setSelectedStatus] = useState<string>('Tất cả')
  const [activeAssetTab, setActiveAssetTab] = useState<FilterTab>('all')

  // Asset Modals
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null)
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null)

  const mapDbRowToAsset = (row: any): Asset => ({
    id: String(row.id),
    code: row.code || 'TS-UNKNOWN',
    name: row.name || 'Tài sản không tên',
    category: row.category || 'IT',
    status: row.status || 'Sẵn sàng',
    assignee: row.assignee || 'Chưa cấp phát',
    department: row.department || 'Phòng IT & Công nghệ',
    value: Number(row.value) || 0,
    purchaseDate: row.purchase_date || row.purchaseDate || new Date().toISOString().split('T')[0],
    location: row.location || 'Kho Trung Tâm',
    serialNumber: row.serial_number || row.serialNumber || '',
    notes: row.notes || ''
  })

  const fetchAssets = useCallback(async () => {
    try {
      setLoadingAssets(true)
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Lỗi tải dữ liệu Supabase Assets:', error.message)
      } else if (data) {
        setAssets(data.map(mapDbRowToAsset))
      }
    } catch (err: any) {
      console.error('Fetch assets error:', err)
    } finally {
      setLoadingAssets(false)
    }
  }, [supabase])

  // ==========================================
  // SECTION: USER MANAGEMENT STATE & LOGIC
  // ==========================================
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [userActiveTab, setUserActiveTab] = useState<UserFilterTab>('all')
  const [selectedUserRole, setSelectedUserRole] = useState<string>('Tất cả')
  const [selectedUserStatus, setSelectedUserStatus] = useState<string>('Tất cả')

  // User Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null)

  const mapDbRowToUser = (row: any): UserProfile => {
    let st: UserStatus = 'active'
    if (row.status === 'banned') st = 'banned'
    else if (row.status === 'inactive' || row.status === 'disabled') st = 'inactive'

    return {
      id: String(row.id),
      email: row.email || '',
      fullName: row.full_name || row.fullName || 'Thành viên',
      role: (row.role === 'admin' ? 'admin' : 'user') as UserRole,
      department: row.department || 'Phòng ban',
      avatarUrl: row.avatar_url || '',
      status: st,
      createdAt: row.created_at || new Date().toISOString()
    }
  }

  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Lỗi tải danh sách profiles:', error.message)
      } else if (data) {
        setUsers(data.map(mapDbRowToUser))
      }
    } catch (err: any) {
      console.error('Fetch users error:', err)
    } finally {
      setLoadingUsers(false)
    }
  }, [supabase])

  // ==========================================
  // AUTH GUARD & REALTIME SYNC
  // ==========================================
  useEffect(() => {
    const checkRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        let role = user.user_metadata?.role || 'user'
        let fullName = user.user_metadata?.full_name

        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, full_name, status')
            .eq('id', user.id)
            .single()

          if (profile) {
            if (profile.status && profile.status !== 'active') {
              await supabase.auth.signOut()
              router.push('/auth/login')
              return
            }
            if (profile.role) role = profile.role
            if (profile.full_name) fullName = profile.full_name
          }
        } catch (e) {
          console.warn('Cannot fetch profile:', e)
        }

        if (role !== 'admin') {
          router.push('/user')
          return
        }

        setAdminUser({
          full_name: fullName || 'Admin Manager',
          email: user.email,
          role: 'admin'
        })
        setIsAuthChecking(false)
      } catch (e) {
        router.push('/auth/login')
      }
    }
    checkRole()
  }, [router, supabase])

  useEffect(() => {
    fetchAssets()
    fetchUsers()

    const assetsChannel = supabase
      .channel('realtime_assets_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assets' },
        () => {
          fetchAssets()
        }
      )
      .subscribe()

    const profilesChannel = supabase
      .channel('realtime_profiles_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchUsers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(assetsChannel)
      supabase.removeChannel(profilesChannel)
    }
  }, [fetchAssets, fetchUsers, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  // ==========================================
  // ASSET COMPUTATIONS & HANDLERS
  // ==========================================
  const nextAssetCode = useMemo(() => {
    const nextNum = (assets.length + 1).toString().padStart(3, '0')
    return `TS-IT-${nextNum}`
  }, [assets.length])

  const assetStats: AssetStats = useMemo(() => {
    const totalCount = assets.length
    const totalVal = assets.reduce((sum, item) => sum + (item.value || 0), 0)
    const inUse = assets.filter((a) => a.status === 'Đang sử dụng').length
    const available = assets.filter((a) => a.status === 'Sẵn sàng').length
    const maintenance = assets.filter((a) => a.status === 'Bảo trì').length
    const broken = assets.filter((a) => a.status === 'Hỏng' || a.status === 'Thanh lý').length
    return { totalCount, totalVal, inUse, available, maintenance, broken }
  }, [assets])

  const filteredAssets = useMemo(() => {
    return assets.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(assetSearchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(assetSearchTerm.toLowerCase()) ||
        item.assignee.toLowerCase().includes(assetSearchTerm.toLowerCase()) ||
        item.department.toLowerCase().includes(assetSearchTerm.toLowerCase())

      const matchesCategory = selectedCategory === 'Tất cả' || item.category === selectedCategory
      const matchesStatus = selectedStatus === 'Tất cả' || item.status === selectedStatus

      let matchesTab = true
      if (activeAssetTab === 'using') matchesTab = item.status === 'Đang sử dụng'
      if (activeAssetTab === 'available') matchesTab = item.status === 'Sẵn sàng'
      if (activeAssetTab === 'maintenance') matchesTab = item.status === 'Bảo trì'
      if (activeAssetTab === 'broken') matchesTab = item.status === 'Hỏng' || item.status === 'Thanh lý'

      return matchesSearch && matchesCategory && matchesStatus && matchesTab
    })
  }, [assets, assetSearchTerm, selectedCategory, selectedStatus, activeAssetTab])

  const handleOpenAddAssetModal = () => {
    setEditingAsset(null)
    setIsAddAssetModalOpen(true)
  }

  const handleOpenEditAssetModal = (asset: Asset) => {
    setEditingAsset(asset)
    setIsAddAssetModalOpen(true)
  }

  const handleSaveAsset = async (formData: Partial<Asset>) => {
    if (editingAsset) {
      const updatedFields = {
        name: formData.name,
        category: formData.category,
        status: formData.status,
        assignee: formData.assignee,
        department: formData.department,
        value: Number(formData.value) || 0,
        purchase_date: formData.purchaseDate,
        location: formData.location,
        serial_number: formData.serialNumber,
        notes: formData.notes
      }

      const { error } = await supabase
        .from('assets')
        .update(updatedFields)
        .eq('id', editingAsset.id)

      if (error) {
        showToast(`Lỗi cập nhật: ${error.message}`, 'error')
        return
      }

      setAssets((prev) =>
        prev.map((a) => (a.id === editingAsset.id ? ({ ...a, ...formData } as Asset) : a))
      )
      showToast(`Đã cập nhật thông tin tài sản ${formData.code || editingAsset.code}`)
    } else {
      const newAssetCodeValue = formData.code || nextAssetCode
      const dbPayload = {
        code: newAssetCodeValue,
        name: formData.name || 'Tài sản mới',
        category: formData.category || 'IT',
        status: formData.status || 'Sẵn sàng',
        assignee: formData.assignee || 'Chưa cấp phát',
        department: formData.department || 'Phòng IT & Công nghệ',
        value: Number(formData.value) || 0,
        purchase_date: formData.purchaseDate || new Date().toISOString().split('T')[0],
        location: formData.location || 'Kho Trung Tâm',
        serial_number: formData.serialNumber || '',
        notes: formData.notes || ''
      }

      const { data, error } = await supabase
        .from('assets')
        .insert([dbPayload])
        .select()

      if (error) {
        showToast(`Lỗi thêm tài sản: ${error.message}`, 'error')
        return
      } else if (data && data[0]) {
        setAssets((prev) => [mapDbRowToAsset(data[0]), ...prev])
        showToast(`Thêm thành công tài sản mới ${newAssetCodeValue}`)
      }
    }
    setIsAddAssetModalOpen(false)
  }

  const handleDeleteAssetConfirm = async () => {
    if (!deletingAssetId) return
    const target = assets.find((a) => a.id === deletingAssetId)

    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', deletingAssetId)

    if (error) {
      showToast(`Lỗi xóa: ${error.message}`, 'error')
      setDeletingAssetId(null)
      return
    }

    setAssets((prev) => prev.filter((a) => a.id !== deletingAssetId))
    showToast(`Đã xóa tài sản ${target?.code || ''}`)
    setDeletingAssetId(null)
  }

  const assetToDelete = useMemo(() => {
    return assets.find((a) => a.id === deletingAssetId) || null
  }, [assets, deletingAssetId])

  const handleExport = () => {
    exportAssetsToCSV(filteredAssets)
    showToast('Đã xuất báo cáo CSV thành công!')
  }

  // ==========================================
  // USER COMPUTATIONS & HANDLERS
  // ==========================================
  const userStats: UserStatsType = useMemo(() => {
    const totalUsers = users.length
    const adminCount = users.filter((u) => u.role === 'admin').length
    const employeeCount = users.filter((u) => u.role === 'user').length
    const activeCount = users.filter((u) => u.status === 'active').length
    const inactiveCount = users.filter((u) => u.status === 'inactive').length
    const bannedCount = users.filter((u) => u.status === 'banned').length
    return { totalUsers, adminCount, employeeCount, activeCount, inactiveCount, bannedCount }
  }, [users])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(userSearchTerm.toLowerCase())

      let matchesRole = true
      if (selectedUserRole !== 'Tất cả') {
        matchesRole = user.role === selectedUserRole
      }

      let matchesStatus = true
      if (selectedUserStatus !== 'Tất cả') {
        matchesStatus = user.status === selectedUserStatus
      }

      let matchesTab = true
      if (userActiveTab === 'admin') matchesTab = user.role === 'admin'
      if (userActiveTab === 'user') matchesTab = user.role === 'user'
      if (userActiveTab === 'active') matchesTab = user.status === 'active'
      if (userActiveTab === 'inactive') matchesTab = user.status === 'inactive'
      if (userActiveTab === 'banned') matchesTab = user.status === 'banned'

      return matchesSearch && matchesRole && matchesStatus && matchesTab
    })
  }, [users, userSearchTerm, selectedUserRole, selectedUserStatus, userActiveTab])

  const handleOpenAddUserModal = () => {
    setEditingUser(null)
    setIsUserModalOpen(true)
  }

  const handleOpenEditUserModal = (user: UserProfile) => {
    setEditingUser(user)
    setIsUserModalOpen(true)
  }

  const handleSaveUser = async (formData: {
    id?: string
    fullName: string
    email: string
    role: UserRole
    department: string
    status: UserStatus
    password?: string
  }) => {
    if (formData.id) {
      const updatePayload = {
        full_name: formData.fullName,
        role: formData.role,
        department: formData.department,
        status: formData.status
      }

      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', formData.id)

      if (error) {
        showToast(`Lỗi cập nhật người dùng: ${error.message}`, 'error')
        return
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === formData.id
            ? {
                ...u,
                fullName: formData.fullName,
                role: formData.role,
                department: formData.department,
                status: formData.status
              }
            : u
        )
      )
      showToast(`Đã cập nhật thông tin & phân quyền cho ${formData.email}`)
    } else {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password || 'Password@123',
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role,
            department: formData.department
          }
        }
      })

      if (authError) {
        showToast(`Lỗi tạo tài khoản: ${authError.message}`, 'error')
        return
      }

      const newUserId = authData.user?.id || `user_${Date.now()}`
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: newUserId,
          email: formData.email,
          full_name: formData.fullName,
          role: formData.role,
          department: formData.department,
          status: formData.status
        })

      if (profileError) {
        console.warn('Profile upsert notice:', profileError.message)
      }

      fetchUsers()
      showToast(`Đã tạo tài khoản mới thành công cho ${formData.email}`)
    }
    setIsUserModalOpen(false)
  }

  const handleUpdateUserStatus = async (user: UserProfile, newStatus: UserStatus) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', user.id)

    if (error) {
      showToast(`Lỗi cập nhật trạng thái: ${error.message}`, 'error')
      return
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    )

    const label =
      newStatus === 'active'
        ? 'Kích hoạt thành công'
        : newStatus === 'inactive'
        ? 'Đã chuyển sang tạm ngưng'
        : 'Đã khóa tài khoản (Banned)'

    showToast(`${label} cho ${user.email}`)
    setUserToDelete(null)
  }

  const handleToggleUserStatus = async (user: UserProfile) => {
    const nextStatus: UserStatus = user.status === 'active' ? 'banned' : 'active'
    await handleUpdateUserStatus(user, nextStatus)
  }

  const handleConfirmDeleteUser = async (user: UserProfile) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (error) {
      // Fallback: If hard delete fails (due to Foreign Key to auth.users or assets), lock the account (Banned)
      console.warn('Cannot hard delete user profile:', error.message)
      await handleUpdateUserStatus(user, 'banned')
      showToast(`Đã tự động Khóa tài khoản (Banned) thay vì xóa cứng do ràng buộc dữ liệu.`, 'error')
      setUserToDelete(null)
      return
    }

    setUsers((prev) => prev.filter((u) => u.id !== user.id))
    showToast(`Đã xóa hồ sơ người dùng ${user.email}`)
    setUserToDelete(null)
  }

  // Header quick actions slot depending on active tab
  const actionsSlot = (
    <>
      {activeView === 'assets' ? (
        <>
          <button
            onClick={handleExport}
            className="h-9 hidden sm:inline-flex items-center gap-1.5 px-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-all shrink-0"
            title="Xuất danh sách ra file CSV"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Xuất CSV</span>
          </button>

          <button
            onClick={handleOpenAddAssetModal}
            className="h-9 inline-flex items-center gap-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm tài sản</span>
          </button>
        </>
      ) : (
        <button
          onClick={handleOpenAddUserModal}
          className="h-9 inline-flex items-center gap-1.5 px-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm người dùng</span>
        </button>
      )}
    </>
  )

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-pulse shadow-lg shadow-indigo-500/10">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-white">Đang xác thực quyền truy cập Quản trị viên...</p>
          <p className="text-xs text-slate-400">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    )
  }

  return (
    <AppLayout
      currentPortal="admin"
      activeItem={activeView}
      onSelectNavItem={(item) => setActiveView(item as 'assets' | 'users')}
      title={activeView === 'assets' ? 'Quản lý Tài sản Doanh nghiệp' : 'Quản lý Người dùng & Phân quyền'}
      subtitle={
        activeView === 'assets'
          ? 'Theo dõi, phân bổ, bảo trì và kiểm kê toàn bộ thiết bị'
          : 'Quản lý danh sách tài khoản, vai trò Role và trạng thái hoạt động'
      }
      searchTerm={activeView === 'assets' ? assetSearchTerm : userSearchTerm}
      onSearchChange={activeView === 'assets' ? setAssetSearchTerm : setUserSearchTerm}
      searchPlaceholder={
        activeView === 'assets'
          ? 'Tìm theo Mã TS, Tên tài sản, Người quản lý...'
          : 'Tìm theo Họ tên, Email, Phòng ban...'
      }
      actionsSlot={actionsSlot}
      currentUser={adminUser}
      counts={{ assets: assets.length, users: users.length }}
      onLogout={handleLogout}
    >
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border animate-bounce ${
            toastMessage.type === 'error'
              ? 'bg-rose-600 border-rose-400/30'
              : 'bg-emerald-600 border-emerald-400/30'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* VIEW 1: ASSETS */}
      {activeView === 'assets' && (
        <>
          <AdminStats stats={assetStats} />

          <AssetFilters
            stats={assetStats}
            totalFiltered={filteredAssets.length}
            activeTab={activeAssetTab}
            onTabChange={setActiveAssetTab}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            searchTerm={assetSearchTerm}
            onSearchChange={setAssetSearchTerm}
            onResetFilters={() => {
              setAssetSearchTerm('')
              setSelectedCategory('Tất cả')
              setSelectedStatus('Tất cả')
              setActiveAssetTab('all')
            }}
          />

          {loadingAssets ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-xs text-slate-400">Đang đồng bộ dữ liệu tài sản từ Supabase...</p>
            </div>
          ) : (
            <AssetTable
              assets={filteredAssets}
              onView={setViewingAsset}
              onEdit={handleOpenEditAssetModal}
              onDelete={setDeletingAssetId}
            />
          )}
        </>
      )}

      {/* VIEW 2: USERS */}
      {activeView === 'users' && (
        <>
          <UserStats stats={userStats} />

          <UserFilters
            stats={userStats}
            totalFiltered={filteredUsers.length}
            activeTab={userActiveTab}
            onTabChange={setUserActiveTab}
            selectedRole={selectedUserRole}
            onRoleChange={setSelectedUserRole}
            selectedStatus={selectedUserStatus}
            onStatusChange={setSelectedUserStatus}
            searchTerm={userSearchTerm}
            onSearchChange={setUserSearchTerm}
            onResetFilters={() => {
              setUserSearchTerm('')
              setUserActiveTab('all')
              setSelectedUserRole('Tất cả')
              setSelectedUserStatus('Tất cả')
            }}
          />

          {loadingUsers ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              <p className="text-xs text-slate-400">Đang tải danh sách tài khoản người dùng...</p>
            </div>
          ) : (
            <UserTable
              users={filteredUsers}
              currentAdminEmail={adminUser?.email}
              onEdit={handleOpenEditUserModal}
              onToggleStatus={handleToggleUserStatus}
              onDelete={setUserToDelete}
            />
          )}
        </>
      )}

      {/* Modals for Assets */}
      <AssetFormModal
        isOpen={isAddAssetModalOpen}
        editingAsset={editingAsset}
        nextAssetCode={nextAssetCode}
        onClose={() => setIsAddAssetModalOpen(false)}
        onSave={handleSaveAsset}
      />

      <AssetDetailModal
        asset={viewingAsset}
        onClose={() => setViewingAsset(null)}
      />

      <DeleteConfirmModal
        assetToDelete={assetToDelete}
        onClose={() => setDeletingAssetId(null)}
        onConfirm={handleDeleteAssetConfirm}
      />

      {/* Modals for Users */}
      <UserFormModal
        isOpen={isUserModalOpen}
        editingUser={editingUser}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUser}
      />

      <DeleteUserModal
        userToDelete={userToDelete}
        onClose={() => setUserToDelete(null)}
        onUpdateStatus={handleUpdateUserStatus}
        onConfirmDelete={handleConfirmDeleteUser}
      />
    </AppLayout>
  )
}
