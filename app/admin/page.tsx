'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

// Types
import { Asset, FilterTab, AssetStats } from './types/asset'
import {
  UserProfile,
  UserRole,
  UserStatus,
  UserFilterTab,
  UserStats as UserStatsType,
  UserModulePermissions,
  DEFAULT_PERMISSIONS_BY_ROLE
} from './types/user'
import {
  WarrantyReminder,
  WarrantyStatus,
  WarrantyFilterTab,
  WarrantyStats as WarrantyStatsType,
  COMMON_LOCATIONS,
  COMMON_SUPPLIERS
} from './types/warranty'
import {
  AppModuleId,
  ModuleSettings,
  DEFAULT_MODULE_SETTINGS,
  TelegramNotificationSettings
} from './types/modules'
import {
  InspectableDevice,
  DailyInspectionLog,
  HealthStatus,
  ActionRequired,
  InspectionStats as InspectionStatsType
} from './types/inspection'

// Formatters & Utilities
import { exportAssetsToCSV } from './utils/formatters'
import {
  calculateDaysElapsed,
  getWarningLevel,
  exportWarrantyToCSV
} from './utils/warrantyFormatters'
import { calculateDepreciation } from './utils/depreciation'
import {
  sendTelegramMessage,
  formatInspectionTelegramAlert,
  formatWarrantyTelegramAlert
} from './utils/telegramNotifier'

// Shared App Layout
import { AppLayout } from '../components/layout/AppLayout'

// Modular Components - Asset Management
import { AdminStats } from './components/AdminStats'
import { AssetFilters } from './components/AssetFilters'
import { AssetTable } from './components/AssetTable'
import { AssetFormModal } from './components/AssetFormModal'
import { AssetDetailModal } from './components/AssetDetailModal'
import { DeleteConfirmModal } from './components/DeleteConfirmModal'

// Modular Components - User Management & Permissions
import { UserStats } from './components/UserStats'
import { UserFilters } from './components/UserFilters'
import { UserTable } from './components/UserTable'
import { UserFormModal } from './components/UserFormModal'
import { DeleteUserModal } from './components/DeleteUserModal'
import { UserPermissionsModal } from './components/UserPermissionsModal'

// Modular Components - Warranty & Reminders Management
import { WarrantyStats } from './components/WarrantyStats'
import { WarrantyFilters } from './components/WarrantyFilters'
import { WarrantyTable } from './components/WarrantyTable'
import { WarrantyFormModal } from './components/WarrantyFormModal'
import { WarrantyDetailModal } from './components/WarrantyDetailModal'
import { DeleteWarrantyModal } from './components/DeleteWarrantyModal'

// Modular Components - Daily Inspection & Checklist
import { InspectionStats } from './components/InspectionStats'
import { DailyChecklistTable } from './components/DailyChecklistTable'
import { InspectionHistoryModal } from './components/InspectionHistoryModal'
import { DailyAuditWidget } from './components/DailyAuditWidget'

// Modular Components - Hologram Dashboard & Reports
import { HologramDashboard } from './components/HologramDashboard'

// Modular Components - Module & Notification Settings
import { ModuleSettingsModal } from './components/ModuleSettingsModal'
import { TelegramSettingsModal } from './components/TelegramSettingsModal'

// Icons
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Plus,
  Sliders,
  Send,
  CheckSquare,
  BarChart3,
  Laptop,
  AlertTriangle,
  Users
} from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()

  // Authenticated Admin / Manager User & Auth Checking State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [isAuthChecking, setIsAuthChecking] = useState(true)

  // Module Configuration State
  const [moduleSettings, setModuleSettings] = useState<ModuleSettings>(DEFAULT_MODULE_SETTINGS)
  const [isModuleSettingsOpen, setIsModuleSettingsOpen] = useState(false)
  const [isTelegramSettingsOpen, setIsTelegramSettingsOpen] = useState(false)

  // Active View Tab Switcher ('inspection' | 'reports' | 'assets' | 'warranty' | 'users')
  const [activeView, setActiveView] = useState<AppModuleId>('inspection')

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3000)
  }

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  // Load Module Settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('qlts_module_settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        setModuleSettings((prev) => ({
          ...prev,
          ...parsed,
          modules: { ...prev.modules, ...(parsed.modules || {}) },
          telegram: { ...prev.telegram, ...(parsed.telegram || {}) }
        }))
      }
    } catch {
      // Ignore JSON parse error
    }
  }, [])

  const handleSaveModuleSettings = (newSettings: ModuleSettings) => {
    setModuleSettings(newSettings)
    try {
      localStorage.setItem('qlts_module_settings', JSON.stringify(newSettings))
    } catch {
      // Ignore storage error
    }
    showToast('Đã lưu cấu hình Module và quy tắc cảnh báo!')

    if (!newSettings.modules[activeView]) {
      const firstEnabled = (Object.keys(newSettings.modules) as AppModuleId[]).find(
        (k) => newSettings.modules[k]
      )
      if (firstEnabled) setActiveView(firstEnabled)
    }
  }

  const handleSaveTelegramSettings = (newTelegram: TelegramNotificationSettings) => {
    const updated = { ...moduleSettings, telegram: newTelegram }
    setModuleSettings(updated)
    try {
      localStorage.setItem('qlts_module_settings', JSON.stringify(updated))
    } catch {
      // Ignore
    }
    showToast('Đã lưu cấu hình Telegram Bot API!')
  }

  // ==========================================
  // SECTION 1: ASSET MANAGEMENT STATE & LOGIC
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

  const mapDbRowToAsset = (row: any): Asset => {
    const originalVal = Number(row.value) || 0
    const pDate = row.purchase_date || row.purchaseDate || new Date().toISOString().split('T')[0]
    const wYears = Number(row.warranty_years) || 2
    const dep = calculateDepreciation(originalVal, pDate, wYears)

    return {
      id: String(row.id),
      code: row.code || 'TS-UNKNOWN',
      name: row.name || 'Tài sản không tên',
      model: row.model || '',
      category: row.category || 'IT',
      status: row.status || 'Sẵn sàng',
      assignee: row.assignee || 'Chưa cấp phát',
      department: row.department || 'Phòng IT & Công nghệ',
      value: originalVal,
      purchaseDate: pDate,
      warrantyYears: wYears,
      location: row.location || 'Kho Trung Tâm',
      serialNumber: row.serial_number || row.serialNumber || '',
      imei: row.imei || '',
      notes: row.notes || '',
      depreciationRate: dep.depreciationRate,
      currentValue: dep.currentValue,
      lifecycleStatus: dep.lifecycleStatus
    }
  }

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
  // SECTION 2: DAILY INSPECTION & CHECKLIST LOGIC
  // ==========================================
  const [inspectionLogs, setInspectionLogs] = useState<DailyInspectionLog[]>([])
  const [loadingInspection, setLoadingInspection] = useState(false)
  const [historyViewingDevice, setHistoryViewingDevice] = useState<InspectableDevice | null>(null)

  const fetchInspectionLogs = useCallback(async () => {
    try {
      setLoadingInspection(true)
      const { data, error } = await supabase
        .from('daily_inspection_logs')
        .select('*')
        .order('check_date', { ascending: false })

      if (error) {
        console.warn('Lỗi tải daily_inspection_logs:', error.message)
      } else if (data) {
        setInspectionLogs(
          data.map((row: any) => ({
            id: String(row.id),
            deviceId: String(row.device_id),
            deviceCode: row.device_code || '',
            deviceName: row.device_name || '',
            model: row.model || '',
            category: row.category || 'IT',
            serialNumber: row.serial_number || '',
            imei: row.imei || '',
            location: row.location || 'Văn phòng',
            department: row.department || 'Phòng ban',
            checkDate: row.check_date || todayStr,
            checkTime: row.check_time || '08:00',
            checkedById: row.checked_by_id || '',
            checkedByName: row.checked_by_name || 'Nhân viên',
            checkedByRole: (row.checked_by_role as UserRole) || 'user',
            healthStatus: (row.health_status as HealthStatus) || 'healthy',
            issueCategory: row.issue_category || '',
            notes: row.notes || '',
            actionRequired: (row.action_required as ActionRequired) || 'none',
            telegramNotified: Boolean(row.telegram_notified),
            createdAt: row.created_at
          }))
        )
      }
    } catch (err: any) {
      console.error('Fetch inspection error:', err)
    } finally {
      setLoadingInspection(false)
    }
  }, [supabase, todayStr])

  // Map assets to inspectable devices with today's status
  const inspectableDevices: InspectableDevice[] = useMemo(() => {
    return assets.map((a) => {
      const todayLog = inspectionLogs.find(
        (l) => (l.deviceId === a.id || l.serialNumber === a.serialNumber) && l.checkDate === todayStr
      )

      return {
        id: a.id,
        code: a.code,
        name: a.name,
        model: a.model || a.name,
        category: a.category,
        serialNumber: a.serialNumber || 'N/A',
        imei: a.imei,
        location: a.location,
        department: a.department,
        assignee: a.assignee,
        purchaseDate: a.purchaseDate,
        warrantyMonths: (a.warrantyYears || 2) * 12,
        purchasePrice: a.value,
        todayStatus: todayLog ? todayLog.healthStatus : 'unchecked',
        todayLog
      }
    })
  }, [assets, inspectionLogs, todayStr])

  const inspectionStats: InspectionStatsType = useMemo(() => {
    const totalDevices = inspectableDevices.length
    const checkedToday = inspectableDevices.filter((d) => d.todayStatus && d.todayStatus !== 'unchecked').length
    const uncheckedToday = totalDevices - checkedToday
    const healthyCount = inspectableDevices.filter((d) => d.todayStatus === 'healthy').length
    const unstableCount = inspectableDevices.filter((d) => d.todayStatus === 'unstable').length
    const damagedCount = inspectableDevices.filter((d) => d.todayStatus === 'damaged').length
    const completionRate = totalDevices > 0 ? Math.round((checkedToday / totalDevices) * 100) : 0

    return {
      totalDevices,
      checkedToday,
      uncheckedToday,
      healthyCount,
      unstableCount,
      damagedCount,
      completionRate
    }
  }, [inspectableDevices])

  // Handle Quick Inspection Checklist submission
  const handleQuickCheck = async (
    device: InspectableDevice,
    healthStatus: HealthStatus,
    issueCategory?: string,
    notes?: string,
    actionRequired: ActionRequired = 'none'
  ) => {
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const inspectorName = currentUser?.fullName || 'Quản trị viên'
    const inspectorRole = currentUser?.role || 'admin'
    const inspectorId = currentUser?.id || 'usr-admin'

    const newLog: DailyInspectionLog = {
      id: `log-${Date.now()}`,
      deviceId: device.id,
      deviceCode: device.code,
      deviceName: device.name,
      model: device.model || '',
      category: device.category,
      serialNumber: device.serialNumber,
      imei: device.imei,
      location: device.location,
      department: device.department,
      checkDate: todayStr,
      checkTime: nowTime,
      checkedById: inspectorId,
      checkedByName: inspectorName,
      checkedByRole: inspectorRole,
      healthStatus,
      issueCategory,
      notes: notes || '',
      actionRequired,
      createdAt: new Date().toISOString()
    }

    // Insert into Supabase
    try {
      await supabase.from('daily_inspection_logs').insert([
        {
          device_id: device.id,
          device_code: device.code,
          device_name: device.name,
          model: device.model,
          category: device.category,
          serial_number: device.serialNumber,
          imei: device.imei,
          location: device.location,
          department: device.department,
          check_date: todayStr,
          check_time: nowTime,
          checked_by_id: inspectorId,
          checked_by_name: inspectorName,
          checked_by_role: inspectorRole,
          health_status: healthStatus,
          issue_category: issueCategory,
          notes: notes,
          action_required: actionRequired
        }
      ])
    } catch (e) {
      console.warn('Supabase insert log exception:', e)
    }

    // Update local state
    setInspectionLogs((prev) => [newLog, ...prev.filter((l) => !(l.deviceId === device.id && l.checkDate === todayStr))])

    const statusLabel =
      healthStatus === 'healthy' ? 'Tốt ✅' : healthStatus === 'unstable' ? 'Chập chờn ⚠️' : 'Hư hỏng 🚨'
    showToast(`Đã chấm Checklist [${statusLabel}] cho ${device.name}`)

    // Trigger Telegram notification if alert condition met
    if (
      moduleSettings.telegram.enabled &&
      moduleSettings.telegram.botToken &&
      moduleSettings.telegram.chatId
    ) {
      const shouldSend =
        (healthStatus === 'damaged' && moduleSettings.telegram.alertOnDamaged) ||
        (healthStatus === 'unstable' && moduleSettings.telegram.alertOnUnstable)

      if (shouldSend) {
        const msg = formatInspectionTelegramAlert(newLog)
        sendTelegramMessage({
          botToken: moduleSettings.telegram.botToken,
          chatId: moduleSettings.telegram.chatId,
          message: msg
        }).catch((err) => console.warn('Telegram send error:', err))
      }
    }
  }

  // ==========================================
  // SECTION 3: WARRANTY REMINDERS STATE & LOGIC
  // ==========================================
  const [warrantyItems, setWarrantyItems] = useState<WarrantyReminder[]>([])
  const [loadingWarranty, setLoadingWarranty] = useState(false)
  const [warrantySearchTerm, setWarrantySearchTerm] = useState('')
  const [selectedWarrantyLocation, setSelectedWarrantyLocation] = useState<string>('Tất cả')
  const [selectedWarrantySupplier, setSelectedWarrantySupplier] = useState<string>('Tất cả')
  const [selectedWarrantyStatus, setSelectedWarrantyStatus] = useState<string>('Tất cả')
  const [activeWarrantyTab, setActiveWarrantyTab] = useState<WarrantyFilterTab>('all')

  // Warranty Modals
  const [isAddWarrantyModalOpen, setIsAddWarrantyModalOpen] = useState(false)
  const [editingWarrantyItem, setEditingWarrantyItem] = useState<WarrantyReminder | null>(null)
  const [viewingWarrantyItem, setViewingWarrantyItem] = useState<WarrantyReminder | null>(null)
  const [deletingWarrantyItem, setDeletingWarrantyItem] = useState<WarrantyReminder | null>(null)

  const mapDbRowToWarranty = (row: any): WarrantyReminder => ({
    id: String(row.id),
    stt: Number(row.stt) || 1,
    productName: row.product_name || row.productName || 'Thiết bị bảo hành',
    productCode: row.product_code || row.productCode || 'SP-UNKNOWN',
    imei: row.imei || '',
    serialNumber: row.serial_number || row.serialNumber || '',
    location: row.location || 'Chi nhánh Hải Dương',
    supplier: row.supplier || 'Synnex FPT',
    receivedDate: row.received_date || row.receivedDate || todayStr,
    sentToSupplierDate: row.sent_to_supplier_date || row.sentToSupplierDate || todayStr,
    expectedReturnDate: row.expected_return_date || row.expectedReturnDate || '',
    completedDate: row.completed_date || row.completedDate || '',
    status: (row.status as WarrantyStatus) || 'da_gui_npp',
    rmaCode: row.rma_code || row.rmaCode || '',
    cost: Number(row.cost) || 0,
    notes: row.notes || '',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString()
  })

  const fetchWarrantyItems = useCallback(async () => {
    try {
      setLoadingWarranty(true)
      const { data, error } = await supabase
        .from('warranty_reminders')
        .select('*')
        .order('stt', { ascending: true })

      if (error) {
        console.warn('Lỗi tải warranty_reminders từ Supabase:', error.message)
      } else if (data) {
        setWarrantyItems(data.map(mapDbRowToWarranty))
      }
    } catch (err: any) {
      console.error('Fetch warranty error:', err)
    } finally {
      setLoadingWarranty(false)
    }
  }, [supabase, todayStr])

  const nextWarrantyStt = useMemo(() => {
    if (warrantyItems.length === 0) return 1
    const maxStt = Math.max(...warrantyItems.map((i) => i.stt || 0))
    return maxStt + 1
  }, [warrantyItems])

  const warrantyStats: WarrantyStatsType = useMemo(() => {
    const total = warrantyItems.length
    const inNpp = warrantyItems.filter((i) => i.status !== 'hoan_thanh').length
    const warningCount = warrantyItems.filter((i) => {
      const level = getWarningLevel(i, moduleSettings.warningThresholdDays, moduleSettings.overdueThresholdDays)
      return level === 'warning'
    }).length
    const overdueCount = warrantyItems.filter((i) => {
      const level = getWarningLevel(i, moduleSettings.warningThresholdDays, moduleSettings.overdueThresholdDays)
      return level === 'overdue'
    }).length
    const completedCount = warrantyItems.filter((i) => i.status === 'hoan_thanh').length

    return { total, inNpp, warningCount, overdueCount, completedCount }
  }, [warrantyItems, moduleSettings.warningThresholdDays, moduleSettings.overdueThresholdDays])

  const filteredWarrantyItems = useMemo(() => {
    return warrantyItems.filter((item) => {
      const s = warrantySearchTerm.toLowerCase()
      const matchesSearch =
        item.productName.toLowerCase().includes(s) ||
        item.productCode.toLowerCase().includes(s) ||
        item.serialNumber.toLowerCase().includes(s) ||
        (item.imei && item.imei.toLowerCase().includes(s)) ||
        item.location.toLowerCase().includes(s) ||
        item.supplier.toLowerCase().includes(s) ||
        (item.rmaCode && item.rmaCode.toLowerCase().includes(s))

      const matchesLocation =
        selectedWarrantyLocation === 'Tất cả' || item.location === selectedWarrantyLocation
      const matchesSupplier =
        selectedWarrantySupplier === 'Tất cả' || item.supplier === selectedWarrantySupplier
      const matchesStatus =
        selectedWarrantyStatus === 'Tất cả' || item.status === selectedWarrantyStatus

      const level = getWarningLevel(item, moduleSettings.warningThresholdDays, moduleSettings.overdueThresholdDays)
      let matchesTab = true
      if (activeWarrantyTab === 'urgent') {
        matchesTab = (level === 'warning' || level === 'overdue') && item.status !== 'hoan_thanh'
      } else if (activeWarrantyTab === 'in_npp') {
        matchesTab = item.status !== 'hoan_thanh'
      } else if (activeWarrantyTab === 'completed') {
        matchesTab = item.status === 'hoan_thanh'
      }

      return matchesSearch && matchesLocation && matchesSupplier && matchesStatus && matchesTab
    })
  }, [
    warrantyItems,
    warrantySearchTerm,
    selectedWarrantyLocation,
    selectedWarrantySupplier,
    selectedWarrantyStatus,
    activeWarrantyTab,
    moduleSettings.warningThresholdDays,
    moduleSettings.overdueThresholdDays
  ])

  const warrantyLocationsList = useMemo(() => {
    const customLocs = warrantyItems.map((i) => i.location).filter(Boolean)
    return Array.from(new Set([...COMMON_LOCATIONS, ...customLocs]))
  }, [warrantyItems])

  const warrantySuppliersList = useMemo(() => {
    const customSups = warrantyItems.map((i) => i.supplier).filter(Boolean)
    return Array.from(new Set([...COMMON_SUPPLIERS, ...customSups]))
  }, [warrantyItems])

  const handleSaveWarrantyItem = async (formData: Partial<WarrantyReminder>) => {
    if (editingWarrantyItem) {
      const dbPayload = {
        stt: formData.stt,
        product_name: formData.productName,
        product_code: formData.productCode,
        imei: formData.imei,
        serial_number: formData.serialNumber,
        location: formData.location,
        supplier: formData.supplier,
        received_date: formData.receivedDate,
        sent_to_supplier_date: formData.sentToSupplierDate,
        expected_return_date: formData.expectedReturnDate,
        completed_date: formData.completedDate,
        status: formData.status,
        rma_code: formData.rmaCode,
        cost: formData.cost,
        notes: formData.notes,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase.from('warranty_reminders').update(dbPayload).eq('id', editingWarrantyItem.id)
      if (error) console.warn('Update error:', error.message)

      setWarrantyItems((prev) =>
        prev.map((w) => (w.id === editingWarrantyItem.id ? ({ ...w, ...formData } as WarrantyReminder) : w))
      )
      showToast(`Đã cập nhật phiếu bảo hành ${formData.productName}`)
    } else {
      const dbPayload = {
        stt: formData.stt || nextWarrantyStt,
        product_name: formData.productName || 'Thiết bị mới',
        product_code: formData.productCode || 'SP-UNKNOWN',
        imei: formData.imei || null,
        serial_number: formData.serialNumber || '',
        location: formData.location || 'Chi nhánh Hải Dương',
        supplier: formData.supplier || 'Synnex FPT',
        received_date: formData.receivedDate || todayStr,
        sent_to_supplier_date: formData.sentToSupplierDate || todayStr,
        expected_return_date: formData.expectedReturnDate || null,
        completed_date: formData.completedDate || null,
        status: formData.status || 'da_gui_npp',
        rma_code: formData.rmaCode || null,
        cost: formData.cost || 0,
        notes: formData.notes || ''
      }

      const { data, error } = await supabase.from('warranty_reminders').insert([dbPayload]).select()

      if (error || !data || !data[0]) {
        const localItem: WarrantyReminder = {
          id: `w-${Date.now()}`,
          ...formData,
          stt: formData.stt || nextWarrantyStt,
          productName: formData.productName || 'Thiết bị mới',
          productCode: formData.productCode || 'SP-UNKNOWN',
          serialNumber: formData.serialNumber || '',
          location: formData.location || 'Chi nhánh Hải Dương',
          supplier: formData.supplier || 'Synnex FPT',
          receivedDate: formData.receivedDate || todayStr,
          sentToSupplierDate: formData.sentToSupplierDate || todayStr,
          status: formData.status || 'da_gui_npp'
        }
        setWarrantyItems((prev) => [...prev, localItem])
      } else {
        setWarrantyItems((prev) => [...prev, mapDbRowToWarranty(data[0])])
      }
      showToast(`Tạo phiếu bảo hành thành công: ${formData.productName}`)
    }
    setIsAddWarrantyModalOpen(false)
  }

  const handleDeleteWarrantyConfirm = async () => {
    if (!deletingWarrantyItem) return
    const target = deletingWarrantyItem
    await supabase.from('warranty_reminders').delete().eq('id', target.id)
    setWarrantyItems((prev) => prev.filter((w) => w.id !== target.id))
    showToast(`Đã xóa phiếu bảo hành ${target.productName}`)
    setDeletingWarrantyItem(null)
  }

  const handleUpdateWarrantyStatus = async (item: WarrantyReminder, newStatus: WarrantyStatus) => {
    const isNowCompleted = newStatus === 'hoan_thanh'
    const completedDateVal = isNowCompleted ? todayStr : null

    await supabase
      .from('warranty_reminders')
      .update({
        status: newStatus,
        completed_date: completedDateVal,
        updated_at: new Date().toISOString()
      })
      .eq('id', item.id)

    setWarrantyItems((prev) =>
      prev.map((w) =>
        w.id === item.id
          ? {
            ...w,
            status: newStatus,
            completedDate: isNowCompleted ? (completedDateVal || '') : w.completedDate
          }
          : w
      )
    )

    if (viewingWarrantyItem?.id === item.id) {
      setViewingWarrantyItem((prev) =>
        prev
          ? {
            ...prev,
            status: newStatus,
            completedDate: isNowCompleted ? (completedDateVal || '') : prev.completedDate
          }
          : null
      )
    }
    showToast(`Đã cập nhật trạng thái phiếu ${item.productName}`)
  }

  // ==========================================
  // SECTION 4: USER MANAGEMENT & PERMISSIONS
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
  const [permissionsUser, setPermissionsUser] = useState<UserProfile | null>(null)

  const mapDbRowToUser = (row: any): UserProfile => {
    let st: UserStatus = 'active'
    if (row.status === 'banned') st = 'banned'
    else if (row.status === 'inactive' || row.status === 'disabled') st = 'inactive'

    let r: UserRole = 'user'
    if (row.role === 'admin' || row.custom_role === 'admin') r = 'admin'
    else if (row.role === 'manager' || row.custom_role === 'manager') r = 'manager'

    return {
      id: String(row.id),
      email: row.email || '',
      fullName: row.full_name || row.fullName || 'Thành viên',
      role: r,
      department: row.department || 'Phòng ban',
      avatarUrl: row.avatar_url || '',
      status: st,
      permissions: row.permissions || DEFAULT_PERMISSIONS_BY_ROLE[r],
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
        console.warn('Lỗi tải profiles:', error.message)
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

        let role: UserRole = 'user'
        let fullName = user.user_metadata?.full_name || ''
        let userPerms: UserModulePermissions = DEFAULT_PERMISSIONS_BY_ROLE.user

        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, full_name, status, permissions, custom_role')
            .eq('id', user.id)
            .single()

          if (profile) {
            if (profile.status && profile.status !== 'active') {
              await supabase.auth.signOut()
              router.replace('/auth/login?error=blocked')
              return
            }

            // Ưu tiên role admin/manager chính xác từ database
            if (profile.role === 'admin' || profile.custom_role === 'admin') {
              role = 'admin'
            } else if (profile.role === 'manager' || profile.custom_role === 'manager') {
              role = 'manager'
            } else if (profile.role) {
              role = profile.role as UserRole
            } else if (user.user_metadata?.role) {
              role = user.user_metadata.role as UserRole
            }

            if (profile.full_name) fullName = profile.full_name
            if (profile.permissions) {
              userPerms = profile.permissions
            } else {
              userPerms = DEFAULT_PERMISSIONS_BY_ROLE[role] || DEFAULT_PERMISSIONS_BY_ROLE.user
            }
          } else {
            if (user.user_metadata?.role === 'admin') role = 'admin'
            else if (user.user_metadata?.role === 'manager') role = 'manager'
            userPerms = DEFAULT_PERMISSIONS_BY_ROLE[role]
          }
        } catch (e) {
          console.warn('Cannot fetch profile:', e)
          if (user.user_metadata?.role === 'admin') role = 'admin'
          userPerms = DEFAULT_PERMISSIONS_BY_ROLE[role]
        }

        // Đảm bảo Admin luôn có đầy đủ quyền hạn quản trị
        if (role === 'admin') {
          userPerms = {
            ...DEFAULT_PERMISSIONS_BY_ROLE.admin,
            ...userPerms,
            canManageUsers: true,
            canManageSettings: true
          }
        }

        // Chặn người dùng thường (role 'user') không được vào trang Admin
        if (role === 'user') {
          router.replace('/user')
          return
        }

        const profileObj: UserProfile = {
          id: user.id,
          email: user.email || '',
          fullName: fullName || (role === 'admin' ? 'Quản trị viên Hệ thống' : 'Quản lý Hệ thống'),
          role,
          department: user.user_metadata?.department || 'Ban Điều Hành',
          status: 'active',
          permissions: userPerms
        }

        setCurrentUser(profileObj)
        setIsAuthChecking(false)
      } catch (e) {
        router.push('/auth/login')
      }
    }
    checkRole()
  }, [router, supabase])

  useEffect(() => {
    fetchAssets()
    fetchInspectionLogs()
    fetchWarrantyItems()
    fetchUsers()

    const assetsCh = supabase.channel('realtime_assets').on('postgres_changes', { event: '*', schema: 'public', table: 'assets' }, () => fetchAssets()).subscribe()
    const inspectionCh = supabase.channel('realtime_inspection').on('postgres_changes', { event: '*', schema: 'public', table: 'daily_inspection_logs' }, () => fetchInspectionLogs()).subscribe()
    const warrantyCh = supabase.channel('realtime_warranty').on('postgres_changes', { event: '*', schema: 'public', table: 'warranty_reminders' }, () => fetchWarrantyItems()).subscribe()
    const profilesCh = supabase.channel('realtime_profiles').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchUsers()).subscribe()

    return () => {
      supabase.removeChannel(assetsCh)
      supabase.removeChannel(inspectionCh)
      supabase.removeChannel(warrantyCh)
      supabase.removeChannel(profilesCh)
    }
  }, [fetchAssets, fetchInspectionLogs, fetchWarrantyItems, fetchUsers, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  // Handle Save User Permissions
  const handleSaveUserPermissions = async (
    userId: string,
    newRole: UserRole,
    newPermissions: UserModulePermissions
  ) => {
    await supabase
      .from('profiles')
      .update({
        role: newRole,
        custom_role: newRole,
        permissions: newPermissions
      })
      .eq('id', userId)

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole, permissions: newPermissions } : u))
    )

    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, role: newRole, permissions: newPermissions } : null))
    }

    showToast(`Đã lưu ma trận phân quyền chi tiết cho người dùng!`)
  }

  // Save Asset Form
  const handleSaveAsset = async (formData: Partial<Asset>) => {
    if (editingAsset) {
      const updatedFields = {
        name: formData.name,
        model: formData.model,
        category: formData.category,
        status: formData.status,
        assignee: formData.assignee,
        department: formData.department,
        value: Number(formData.value) || 0,
        purchase_date: formData.purchaseDate,
        warranty_years: Number(formData.warrantyYears) || 2,
        location: formData.location,
        serial_number: formData.serialNumber,
        imei: formData.imei,
        notes: formData.notes
      }

      await supabase.from('assets').update(updatedFields).eq('id', editingAsset.id)
      setAssets((prev) =>
        prev.map((a) => (a.id === editingAsset.id ? mapDbRowToAsset({ ...a, ...updatedFields }) : a))
      )
      showToast(`Đã cập nhật tài sản ${formData.code || editingAsset.code}`)
    } else {
      const nextNum = (assets.length + 1).toString().padStart(3, '0')
      const newCode = formData.code || `TS-IT-${nextNum}`
      const dbPayload = {
        code: newCode,
        name: formData.name || 'Tài sản mới',
        model: formData.model || '',
        category: formData.category || 'IT',
        status: formData.status || 'Sẵn sàng',
        assignee: formData.assignee || 'Chưa cấp phát',
        department: formData.department || 'Phòng IT & Công nghệ',
        value: Number(formData.value) || 0,
        purchase_date: formData.purchaseDate || todayStr,
        warranty_years: Number(formData.warrantyYears) || 2,
        location: formData.location || 'Kho Trung Tâm',
        serial_number: formData.serialNumber || '',
        imei: formData.imei || '',
        notes: formData.notes || ''
      }

      const { data } = await supabase.from('assets').insert([dbPayload]).select()
      if (data && data[0]) {
        setAssets((prev) => [mapDbRowToAsset(data[0]), ...prev])
      } else {
        setAssets((prev) => [mapDbRowToAsset({ id: `a-${Date.now()}`, ...dbPayload }), ...prev])
      }
      showToast(`Thêm tài sản mới thành công: ${newCode}`)
    }
    setIsAddAssetModalOpen(false)
  }

  // Delete Asset
  const handleDeleteAssetConfirm = async () => {
    if (!deletingAssetId) return
    const target = assets.find((a) => a.id === deletingAssetId)
    await supabase.from('assets').delete().eq('id', deletingAssetId)
    setAssets((prev) => prev.filter((a) => a.id !== deletingAssetId))
    showToast(`Đã xóa tài sản ${target?.code || ''}`)
    setDeletingAssetId(null)
  }

  // Filtered Assets list
  const filteredAssets = useMemo(() => {
    return assets.filter((item) => {
      const s = assetSearchTerm.toLowerCase()
      const matchesSearch =
        item.name.toLowerCase().includes(s) ||
        item.code.toLowerCase().includes(s) ||
        (item.model && item.model.toLowerCase().includes(s)) ||
        (item.serialNumber && item.serialNumber.toLowerCase().includes(s)) ||
        item.assignee.toLowerCase().includes(s) ||
        item.department.toLowerCase().includes(s)

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

  // Asset stats calculation
  const assetStats: AssetStats = useMemo(() => {
    const totalCount = assets.length
    const totalVal = assets.reduce((sum, item) => sum + (item.value || 0), 0)
    const inUse = assets.filter((a) => a.status === 'Đang sử dụng').length
    const available = assets.filter((a) => a.status === 'Sẵn sàng').length
    const maintenance = assets.filter((a) => a.status === 'Bảo trì').length
    const broken = assets.filter((a) => a.status === 'Hỏng' || a.status === 'Thanh lý').length
    return { totalCount, totalVal, inUse, available, maintenance, broken }
  }, [assets])

  // User Stats & Filters
  const userStats: UserStatsType = useMemo(() => {
    const totalUsers = users.length
    const adminCount = users.filter((u) => u.role === 'admin').length
    const managerCount = users.filter((u) => u.role === 'manager').length
    const employeeCount = users.filter((u) => u.role === 'user').length
    const activeCount = users.filter((u) => u.status === 'active').length
    const inactiveCount = users.filter((u) => u.status === 'inactive').length
    const bannedCount = users.filter((u) => u.status === 'banned').length
    return { totalUsers, adminCount, managerCount, employeeCount, activeCount, inactiveCount, bannedCount }
  }, [users])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(userSearchTerm.toLowerCase())

      let matchesRole = true
      if (selectedUserRole !== 'Tất cả') matchesRole = user.role === selectedUserRole

      let matchesStatus = true
      if (selectedUserStatus !== 'Tất cả') matchesStatus = user.status === selectedUserStatus

      let matchesTab = true
      if (userActiveTab === 'admin') matchesTab = user.role === 'admin'
      if (userActiveTab === 'manager') matchesTab = user.role === 'manager'
      if (userActiveTab === 'user') matchesTab = user.role === 'user'
      if (userActiveTab === 'active') matchesTab = user.status === 'active'
      if (userActiveTab === 'inactive') matchesTab = user.status === 'inactive'
      if (userActiveTab === 'banned') matchesTab = user.status === 'banned'

      return matchesSearch && matchesRole && matchesStatus && matchesTab
    })
  }, [users, userSearchTerm, selectedUserRole, selectedUserStatus, userActiveTab])

  // Header quick actions slot depending on active tab
  const actionsSlot = (
    <div className="flex items-center gap-2">
      {/* Settings Module Switcher Button */}
      {currentUser?.role === 'admin' && (
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => setIsModuleSettingsOpen(true)}
            className="h-9 inline-flex items-center gap-1.5 px-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition-all shrink-0"
            title="Cấu hình Bật/Tắt các phân hệ"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Modules</span>
          </button>

          <button
            onClick={() => setIsTelegramSettingsOpen(true)}
            className="h-9 inline-flex items-center gap-1.5 px-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-semibold text-sky-300 transition-all shrink-0"
            title="Cấu hình Telegram Bot API"
          >
            <Send className="w-3.5 h-3.5 text-sky-400" />
            <span>Telegram Bot</span>
          </button>
        </div>
      )}

      {/* VIEW: INSPECTION ACTIONS */}
      {activeView === 'inspection' && (
        <button
          onClick={() => setActiveView('reports')}
          className="h-9 inline-flex items-center gap-1.5 px-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] shrink-0"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Xem Dashboard Báo Cáo</span>
        </button>
      )}

      {/* VIEW: ASSETS ACTIONS */}
      {activeView === 'assets' && (
        <>
          <button
            onClick={() => exportAssetsToCSV(filteredAssets)}
            className="h-9 hidden sm:inline-flex items-center gap-1.5 px-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-all shrink-0"
            title="Xuất danh sách ra file CSV"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Xuất CSV</span>
          </button>

          {(currentUser?.permissions?.canEditAssets || currentUser?.role === 'admin') && (
            <button
              onClick={() => {
                setEditingAsset(null)
                setIsAddAssetModalOpen(true)
              }}
              className="h-9 inline-flex items-center gap-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm tài sản</span>
            </button>
          )}
        </>
      )}

      {/* VIEW: WARRANTY ACTIONS */}
      {activeView === 'warranty' && (
        <>
          <button
            onClick={() => exportWarrantyToCSV(filteredWarrantyItems)}
            className="h-9 hidden sm:inline-flex items-center gap-1.5 px-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-all shrink-0"
            title="Xuất danh sách bảo hành ra file CSV"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Xuất CSV</span>
          </button>

          {(currentUser?.permissions?.canEditWarranty || currentUser?.role === 'admin') && (
            <button
              onClick={() => {
                setEditingWarrantyItem(null)
                setIsAddWarrantyModalOpen(true)
              }}
              className="h-9 inline-flex items-center gap-1.5 px-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-600/30 transition-all hover:scale-[1.02] shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo phiếu bảo hành</span>
            </button>
          )}
        </>
      )}

      {/* VIEW: USERS ACTIONS */}
      {activeView === 'users' && currentUser?.role === 'admin' && (
        <button
          onClick={() => {
            setEditingUser(null)
            setIsUserModalOpen(true)
          }}
          className="h-9 inline-flex items-center gap-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm người dùng</span>
        </button>
      )}
    </div>
  )

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-pulse shadow-lg shadow-indigo-500/10">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-white">Đang xác thực quyền truy cập...</p>
          <p className="text-xs text-slate-400">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    )
  }

  const canViewPrice = Boolean(currentUser?.permissions?.canViewPrice || currentUser?.role === 'admin')
  const canDoInspection = Boolean(currentUser?.permissions?.canDoInspection || currentUser?.role !== 'user')

  return (
    <AppLayout
      currentPortal="admin"
      activeItem={activeView}
      onSelectNavItem={(item) => setActiveView(item as AppModuleId)}
      title={
        activeView === 'inspection'
          ? 'Kiểm Tra Thiết Bị & Nhật Ký Ca Trực'
          : activeView === 'reports'
            ? 'Dashboard Hologram & Báo Cáo Phân Tích'
            : activeView === 'assets'
              ? 'Quản Lý Tài Sản & Khấu Hao'
              : activeView === 'warranty'
                ? 'Nhắc Việc Bảo Hành & Sửa Chữa'
                : 'Quản Trị Người Dùng & Phân Quyền'
      }
      subtitle={
        activeView === 'inspection'
          ? 'Checklist tình trạng thiết bị (Tốt / Chập chờn / Hư hỏng) và giám sát tiến độ ca trực'
          : activeView === 'reports'
            ? 'Thống kê trực quan báo cáo Ngày, Tuần, Tháng, biểu đồ sức khỏe và kế hoạch thay thế'
            : activeView === 'assets'
              ? 'Theo dõi vòng đời tài sản, đánh giá khấu trừ độ hao mòn, cảnh báo hết bảo hành'
              : activeView === 'warranty'
                ? 'Theo dõi thiết bị gửi bảo hành từ chi nhánh qua NPP, cảnh báo hạn 7-10 ngày'
                : 'Quản lý danh sách tài khoản, vai trò (Admin/Manager/User) và ma trận phân quyền chi tiết'
      }
      searchTerm={
        activeView === 'assets'
          ? assetSearchTerm
          : activeView === 'warranty'
            ? warrantySearchTerm
            : userSearchTerm
      }
      onSearchChange={
        activeView === 'assets'
          ? setAssetSearchTerm
          : activeView === 'warranty'
            ? setWarrantySearchTerm
            : setUserSearchTerm
      }
      searchPlaceholder="Tìm kiếm nhanh..."
      actionsSlot={actionsSlot}
      currentUser={currentUser}
      counts={{
        assets: assets.length,
        warranty: warrantyItems.length,
        warrantyWarning: warrantyStats.warningCount + warrantyStats.overdueCount,
        inspectionUnchecked: inspectionStats.uncheckedToday,
        inspectionAlerts: inspectionStats.unstableCount + inspectionStats.damagedCount,
        users: users.length
      }}
      enabledModules={moduleSettings.modules}
      onOpenSettings={() => setIsModuleSettingsOpen(true)}
      onOpenTelegramSettings={() => setIsTelegramSettingsOpen(true)}
      onLogout={handleLogout}
    >
      {/* Toast Feedback Alert */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border animate-bounce ${toastMessage.type === 'error'
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

      {/* VIEW 1: DAILY INSPECTION & CHECKLIST */}
      {activeView === 'inspection' && moduleSettings.modules.inspection && (
        <>
          {/* Shift Audit Widget */}
          <DailyAuditWidget
            devices={inspectableDevices}
            logs={inspectionLogs}
            todayStr={todayStr}
            onSwitchToInspectionTab={() => { }}
          />

          {/* Inspection Stats */}
          <InspectionStats stats={inspectionStats} />

          {/* Daily Checklist Table */}
          {loadingInspection ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
              <p className="text-xs text-slate-400">Đang tải nhật ký kiểm tra ca trực...</p>
            </div>
          ) : (
            <DailyChecklistTable
              devices={inspectableDevices}
              currentUserName={currentUser?.fullName || 'Quản lý'}
              canDoInspection={canDoInspection}
              onQuickCheck={handleQuickCheck}
              onViewHistory={(d) => setHistoryViewingDevice(d)}
            />
          )}
        </>
      )}

      {/* VIEW 2: HOLOGRAM DASHBOARD & REPORTS */}
      {activeView === 'reports' && moduleSettings.modules.reports && (
        <HologramDashboard
          devices={inspectableDevices}
          inspectionLogs={inspectionLogs}
          warrantyItems={warrantyItems}
          assets={assets}
          canViewPrice={canViewPrice}
          onNavigateToInspection={() => setActiveView('inspection')}
          onNavigateToWarranty={() => setActiveView('warranty')}
        />
      )}

      {/* VIEW 3: ASSETS & DEPRECIATION */}
      {activeView === 'assets' && moduleSettings.modules.assets && (
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
              onEdit={(a) => {
                setEditingAsset(a)
                setIsAddAssetModalOpen(true)
              }}
              onDelete={setDeletingAssetId}
            />
          )}
        </>
      )}

      {/* VIEW 4: WARRANTY REMINDERS */}
      {activeView === 'warranty' && moduleSettings.modules.warranty && (
        <>
          <WarrantyStats stats={warrantyStats} />

          <WarrantyFilters
            stats={warrantyStats}
            totalFiltered={filteredWarrantyItems.length}
            activeTab={activeWarrantyTab}
            onTabChange={setActiveWarrantyTab}
            selectedLocation={selectedWarrantyLocation}
            onLocationChange={setSelectedWarrantyLocation}
            selectedSupplier={selectedWarrantySupplier}
            onSupplierChange={setSelectedWarrantySupplier}
            selectedStatus={selectedWarrantyStatus}
            onStatusChange={setSelectedWarrantyStatus}
            searchTerm={warrantySearchTerm}
            onSearchChange={setWarrantySearchTerm}
            locationOptions={warrantyLocationsList}
            supplierOptions={warrantySuppliersList}
            onResetFilters={() => {
              setWarrantySearchTerm('')
              setSelectedWarrantyLocation('Tất cả')
              setSelectedWarrantySupplier('Tất cả')
              setSelectedWarrantyStatus('Tất cả')
              setActiveWarrantyTab('all')
            }}
          />

          {loadingWarranty ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-xs text-slate-400">Đang tải dữ liệu bảo hành...</p>
            </div>
          ) : (
            <WarrantyTable
              items={filteredWarrantyItems}
              warningThreshold={moduleSettings.warningThresholdDays}
              overdueThreshold={moduleSettings.overdueThresholdDays}
              onView={setViewingWarrantyItem}
              onEdit={(w) => {
                setEditingWarrantyItem(w)
                setIsAddWarrantyModalOpen(true)
              }}
              onDelete={setDeletingWarrantyItem}
              onQuickComplete={(item) => handleUpdateWarrantyStatus(item, 'hoan_thanh')}
            />
          )}
        </>
      )}

      {/* VIEW 5: USERS & PERMISSIONS */}
      {activeView === 'users' && moduleSettings.modules.users && (
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
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-xs text-slate-400">Đang tải danh sách tài khoản người dùng...</p>
            </div>
          ) : (
            <UserTable
              users={filteredUsers}
              currentAdminEmail={currentUser?.email}
              onEdit={(u) => setPermissionsUser(u)}
              onToggleStatus={async (u) => {
                const nextSt: UserStatus = u.status === 'active' ? 'banned' : 'active'
                await supabase.from('profiles').update({ status: nextSt }).eq('id', u.id)
                setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: nextSt } : x)))
                showToast(`Đã đổi trạng thái tài khoản ${u.email}`)
              }}
              onDelete={setUserToDelete}
            />
          )}
        </>
      )}

      {/* MODALS: Inspection History */}
      <InspectionHistoryModal
        device={historyViewingDevice}
        logs={inspectionLogs}
        onClose={() => setHistoryViewingDevice(null)}
      />

      {/* MODALS: User Permissions */}
      <UserPermissionsModal
        isOpen={Boolean(permissionsUser)}
        user={permissionsUser}
        onClose={() => setPermissionsUser(null)}
        onSavePermissions={handleSaveUserPermissions}
      />

      {/* MODALS: Telegram Bot Settings */}
      <TelegramSettingsModal
        isOpen={isTelegramSettingsOpen}
        settings={moduleSettings.telegram}
        onClose={() => setIsTelegramSettingsOpen(false)}
        onSave={handleSaveTelegramSettings}
      />

      {/* MODALS: Module Settings */}
      <ModuleSettingsModal
        isOpen={isModuleSettingsOpen}
        settings={moduleSettings}
        onClose={() => setIsModuleSettingsOpen(false)}
        onSaveSettings={handleSaveModuleSettings}
        onOpenTelegramSettings={() => setIsTelegramSettingsOpen(true)}
      />

      {/* MODALS: Assets */}
      <AssetFormModal
        isOpen={isAddAssetModalOpen}
        editingAsset={editingAsset}
        nextAssetCode={`TS-IT-${(assets.length + 1).toString().padStart(3, '0')}`}
        onClose={() => setIsAddAssetModalOpen(false)}
        onSave={handleSaveAsset}
      />

      <AssetDetailModal
        asset={viewingAsset}
        onClose={() => setViewingAsset(null)}
      />

      <DeleteConfirmModal
        assetToDelete={assets.find((a) => a.id === deletingAssetId) || null}
        onClose={() => setDeletingAssetId(null)}
        onConfirm={handleDeleteAssetConfirm}
      />

      {/* MODALS: Warranty */}
      <WarrantyFormModal
        isOpen={isAddWarrantyModalOpen}
        editingItem={editingWarrantyItem}
        nextStt={nextWarrantyStt}
        onClose={() => setIsAddWarrantyModalOpen(false)}
        onSave={handleSaveWarrantyItem}
      />

      <WarrantyDetailModal
        item={viewingWarrantyItem}
        warningThreshold={moduleSettings.warningThresholdDays}
        overdueThreshold={moduleSettings.overdueThresholdDays}
        onClose={() => setViewingWarrantyItem(null)}
        onUpdateStatus={handleUpdateWarrantyStatus}
      />

      <DeleteWarrantyModal
        item={deletingWarrantyItem}
        onClose={() => setDeletingWarrantyItem(null)}
        onConfirm={handleDeleteWarrantyConfirm}
      />

      {/* MODALS: Users */}
      <UserFormModal
        isOpen={isUserModalOpen}
        editingUser={editingUser}
        onClose={() => setIsUserModalOpen(false)}
        onSave={async (formData) => {
          if (formData.id) {
            await supabase.from('profiles').update({
              full_name: formData.fullName,
              role: formData.role,
              department: formData.department,
              status: formData.status
            }).eq('id', formData.id)
            fetchUsers()
            showToast(`Cập nhật thành công ${formData.email}`)
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
            if (!authError && authData.user) {
              await supabase.from('profiles').upsert({
                id: authData.user.id,
                email: formData.email,
                full_name: formData.fullName,
                role: formData.role,
                department: formData.department,
                status: formData.status
              })
            }
            fetchUsers()
            showToast(`Đã tạo tài khoản mới ${formData.email}`)
          }
          setIsUserModalOpen(false)
        }}
      />

      <DeleteUserModal
        userToDelete={userToDelete}
        onClose={() => setUserToDelete(null)}
        onUpdateStatus={async (u, st) => {
          await supabase.from('profiles').update({ status: st }).eq('id', u.id)
          setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: st } : x)))
          showToast(`Đã cập nhật trạng thái ${u.email}`)
          setUserToDelete(null)
        }}
        onConfirmDelete={async (u) => {
          const { error } = await supabase.from('profiles').delete().eq('id', u.id)
          if (error) {
            await supabase.from('profiles').update({ status: 'banned' }).eq('id', u.id)
            showToast('Đã khóa tài khoản do ràng buộc dữ liệu.', 'error')
          } else {
            setUsers((prev) => prev.filter((x) => x.id !== u.id))
            showToast(`Đã xóa hồ sơ ${u.email}`)
          }
          setUserToDelete(null)
        }}
      />
    </AppLayout>
  )
}
