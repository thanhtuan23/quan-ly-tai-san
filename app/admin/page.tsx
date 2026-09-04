'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { Asset, FilterTab, AssetStats } from './types/asset'
import { exportAssetsToCSV } from './utils/formatters'
import { createClient } from '@/utils/supabase/client'

// Modular Components
import { AdminHeader } from './components/AdminHeader'
import { AdminStats } from './components/AdminStats'
import { AssetFilters } from './components/AssetFilters'
import { AssetTable } from './components/AssetTable'
import { AssetFormModal } from './components/AssetFormModal'
import { AssetDetailModal } from './components/AssetDetailModal'
import { useRouter } from 'next/navigation'
import { DeleteConfirmModal } from './components/DeleteConfirmModal'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()

  // Authenticated Admin User
  const [adminUser, setAdminUser] = useState<{ full_name?: string; email?: string } | null>(null)

  // Main assets data state
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)

  // Filtering states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả')
  const [selectedStatus, setSelectedStatus] = useState<string>('Tất cả')
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null)
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null)

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Check if Supabase is properly configured in .env.local
  const isSupabaseConfigured = useCallback(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    return (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('your_supabase_project_url')
  }, [])

  // Helper function to map DB row (snake_case) to Frontend Asset interface
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

  // Fetch Assets from Supabase Database
  const fetchAssets = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Lỗi tải dữ liệu Supabase:', error.message)
      } else if (data) {
        setAssets(data.map(mapDbRowToAsset))
      }
    } catch (err: any) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [isSupabaseConfigured, supabase])

  // Check user role on mount
  useEffect(() => {
    const checkRole = async () => {
      if (!isSupabaseConfigured()) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      const role = user.user_metadata?.role || 'user'
      if (role !== 'admin') {
        // Not admin! Redirect to user portal
        router.push('/user')
        return
      }
      setAdminUser({
        full_name: user.user_metadata?.full_name,
        email: user.email
      })
    }
    checkRole()
  }, [isSupabaseConfigured, router, supabase])

  // Initial Load & Realtime subscription
  useEffect(() => {
    fetchAssets()

    // Setup Supabase Realtime Channel
    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('realtime_assets_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'assets' },
          () => {
            fetchAssets()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [fetchAssets, isSupabaseConfigured, supabase])

  // Next asset code generator
  const nextAssetCode = useMemo(() => {
    const nextNum = (assets.length + 1).toString().padStart(3, '0')
    return `TS-IT-${nextNum}`
  }, [assets.length])

  // Summary Metrics calculations
  const stats: AssetStats = useMemo(() => {
    const totalCount = assets.length
    const totalVal = assets.reduce((sum, item) => sum + (item.value || 0), 0)
    const inUse = assets.filter((a) => a.status === 'Đang sử dụng').length
    const available = assets.filter((a) => a.status === 'Sẵn sàng').length
    const maintenance = assets.filter((a) => a.status === 'Bảo trì').length
    const broken = assets.filter((a) => a.status === 'Hỏng' || a.status === 'Thanh lý').length

    return { totalCount, totalVal, inUse, available, maintenance, broken }
  }, [assets])

  // Filtered Assets list
  const filteredAssets = useMemo(() => {
    return assets.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.assignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === 'Tất cả' || item.category === selectedCategory
      const matchesStatus = selectedStatus === 'Tất cả' || item.status === selectedStatus

      let matchesTab = true
      if (activeTab === 'using') matchesTab = item.status === 'Đang sử dụng'
      if (activeTab === 'available') matchesTab = item.status === 'Sẵn sàng'
      if (activeTab === 'maintenance') matchesTab = item.status === 'Bảo trì'
      if (activeTab === 'broken') matchesTab = item.status === 'Hỏng' || item.status === 'Thanh lý'

      return matchesSearch && matchesCategory && matchesStatus && matchesTab
    })
  }, [assets, searchTerm, selectedCategory, selectedStatus, activeTab])

  // Modal Handlers
  const handleOpenAddModal = () => {
    setEditingAsset(null)
    setIsAddModalOpen(true)
  }

  const handleOpenEditModal = (asset: Asset) => {
    setEditingAsset(asset)
    setIsAddModalOpen(true)
  }

  // Create or Update Asset in Supabase & Local State
  const handleSaveAsset = async (formData: Partial<Asset>) => {
    if (editingAsset) {
      // UPDATE ASSET
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

      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('assets')
          .update(updatedFields)
          .eq('id', editingAsset.id)

        if (error) {
          showToast(`Lỗi cập nhật Supabase: ${error.message}`, 'error')
          return
        }
      }

      // Optimistic local update
      setAssets((prev) =>
        prev.map((a) => (a.id === editingAsset.id ? ({ ...a, ...formData } as Asset) : a))
      )
      showToast(`Đã cập nhật thông tin tài sản ${formData.code || editingAsset.code}`)
    } else {
      // INSERT NEW ASSET
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

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('assets')
          .insert([dbPayload])
          .select()

        if (error) {
          showToast(`Lỗi thêm tài sản vào Supabase: ${error.message}`, 'error')
          return
        } else if (data && data[0]) {
          setAssets((prev) => [mapDbRowToAsset(data[0]), ...prev])
          showToast(`Thêm thành công tài sản mới ${newAssetCodeValue}`)
          setIsAddModalOpen(false)
          return
        }
      }

      // Fallback local insertion
      const localNewAsset: Asset = {
        id: Date.now().toString(),
        ...dbPayload,
        purchaseDate: dbPayload.purchase_date,
        serialNumber: dbPayload.serial_number
      }
      setAssets((prev) => [localNewAsset, ...prev])
      showToast(`Thêm thành công tài sản mới ${newAssetCodeValue}`)
    }
    setIsAddModalOpen(false)
  }

  // Delete Asset in Supabase & Local State
  const handleDeleteConfirm = async () => {
    if (!deletingAssetId) return
    const target = assets.find((a) => a.id === deletingAssetId)

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', deletingAssetId)

      if (error) {
        showToast(`Lỗi xóa Supabase: ${error.message}`, 'error')
        setDeletingAssetId(null)
        return
      }
    }

    setAssets((prev) => prev.filter((a) => a.id !== deletingAssetId))
    showToast(`Đã xóa tài sản ${target?.code || ''}`)
    setDeletingAssetId(null)
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('Tất cả')
    setSelectedStatus('Tất cả')
    setActiveTab('all')
  }

  const handleExport = () => {
    exportAssetsToCSV(filteredAssets)
    showToast('Đã xuất báo cáo CSV thành công!')
  }

  const assetToDelete = useMemo(() => {
    return assets.find((a) => a.id === deletingAssetId) || null
  }, [assets, deletingAssetId])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
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

      {/* TOP NAVBAR HEADER */}
      <AdminHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onExportCSV={handleExport}
        onOpenAddModal={handleOpenAddModal}
        adminUser={adminUser}
      />

      {/* BODY CONTENT AREA */}
      <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* SUMMARY STATS DASHBOARD CARDS */}
        <AdminStats stats={stats} />

        {/* TOOLBAR: TAB NAVIGATION & SEARCH & FILTERS */}
        <AssetFilters
          stats={stats}
          totalFiltered={filteredAssets.length}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onResetFilters={handleResetFilters}
        />

        {/* ASSET DATA GRID TABLE */}
        {loading ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-xs text-slate-400">Đang đồng bộ dữ liệu tài sản từ Supabase...</p>
          </div>
        ) : (
          <AssetTable
            assets={filteredAssets}
            onView={setViewingAsset}
            onEdit={handleOpenEditModal}
            onDelete={setDeletingAssetId}
          />
        )}
      </main>

      {/* MODAL: ADD / EDIT ASSET */}
      <AssetFormModal
        isOpen={isAddModalOpen}
        editingAsset={editingAsset}
        nextAssetCode={nextAssetCode}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveAsset}
      />

      {/* MODAL: VIEW ASSET DETAILS */}
      <AssetDetailModal
        asset={viewingAsset}
        onClose={() => setViewingAsset(null)}
      />

      {/* MODAL: DELETE CONFIRMATION */}
      <DeleteConfirmModal
        assetToDelete={assetToDelete}
        onClose={() => setDeletingAssetId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
