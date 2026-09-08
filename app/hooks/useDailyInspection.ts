import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
  InspectableDevice,
  DailyInspectionLog,
  HealthStatus,
  ActionRequired,
  InspectionStats
} from '../admin/types/inspection'
import { UserRole } from '../admin/types/user'
import { Asset } from '../admin/types/asset'

interface UseDailyInspectionOptions {
  userRole?: UserRole
  userName?: string
  userId?: string
  department?: string
  filterAssignedOnly?: boolean // Nếu true, chỉ lấy thiết bị được phân công hoặc thuộc phòng ban của user
  onShowToast?: (msg: string) => void
}

export function useDailyInspection(options: UseDailyInspectionOptions = {}) {
  const {
    userRole = 'user',
    userName = 'Thành viên',
    userId = '',
    department = '',
    filterAssignedOnly = false,
    onShowToast
  } = options

  const supabase = createClient()
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  const [assets, setAssets] = useState<Asset[]>([])
  const [inspectionLogs, setInspectionLogs] = useState<DailyInspectionLog[]>([])
  const [loading, setLoading] = useState(false)
  const [historyViewingDevice, setHistoryViewingDevice] = useState<InspectableDevice | null>(null)

  // 1. Tải dữ liệu tài sản & logs hôm nay từ Supabase
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch assets
      let assetsQuery = supabase.from('assets').select('*').order('created_at', { ascending: false })
      const { data: rawAssets, error: assetErr } = await assetsQuery
      if (assetErr) console.warn('Lỗi tải assets:', assetErr.message)

      let mappedAssets: Asset[] = []
      if (rawAssets) {
        mappedAssets = rawAssets.map((row: any) => ({
          id: String(row.id),
          code: row.code || 'TS-UNKNOWN',
          name: row.name || 'Tài sản',
          category: row.category || 'IT',
          status: row.status || 'Sẵn sàng',
          assignee: row.assignee || 'Chưa cấp phát',
          department: row.department || 'Phòng ban',
          value: Number(row.value) || 0,
          purchaseDate: row.purchase_date || row.purchaseDate || '',
          location: row.location || 'Văn phòng',
          serialNumber: row.serial_number || row.serialNumber || '',
          notes: row.notes || '',
          model: row.model || row.name,
          imei: row.imei || ''
        }))
      }

      // Fetch logs
      const { data: rawLogs, error: logErr } = await supabase
        .from('daily_inspection_logs')
        .select('*')
        .order('check_date', { ascending: false })

      if (logErr) console.warn('Lỗi tải inspection logs:', logErr.message)

      let mappedLogs: DailyInspectionLog[] = []
      if (rawLogs) {
        mappedLogs = rawLogs.map((row: any) => ({
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
      }

      setAssets(mappedAssets)
      setInspectionLogs(mappedLogs)
    } catch (err: any) {
      console.error('useDailyInspection fetchData error:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase, todayStr])

  // 2. Chuyển đổi danh sách assets thành inspectableDevices kèm trạng thái hôm nay
  const inspectableDevices: InspectableDevice[] = useMemo(() => {
    let sourceAssets = assets
    if (filterAssignedOnly && userName) {
      const uName = userName.toLowerCase()
      const uDept = department.toLowerCase()
      sourceAssets = assets.filter((a) => {
        const matchAssignee = a.assignee?.toLowerCase().includes(uName)
        const matchDept = department && a.department?.toLowerCase().includes(uDept)
        return matchAssignee || matchDept
      })
      // Nếu không có thiết bị riêng, vẫn cho xem các thiết bị chung của văn phòng
      if (sourceAssets.length === 0) {
        sourceAssets = assets
      }
    }

    return sourceAssets.map((a) => {
      const todayLog = inspectionLogs.find(
        (l) => (l.deviceId === a.id || (l.serialNumber && l.serialNumber === a.serialNumber)) && l.checkDate === todayStr
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
        warrantyMonths: 24,
        purchasePrice: a.value,
        todayStatus: todayLog ? todayLog.healthStatus : 'unchecked',
        todayLog
      }
    })
  }, [assets, inspectionLogs, todayStr, filterAssignedOnly, userName, department])

  // 3. Tính toán thống kê
  const stats: InspectionStats = useMemo(() => {
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

  // 4. Hàm thực hiện kiểm tra nhanh (chấm checklist)
  const handleQuickCheck = async (
    device: InspectableDevice,
    healthStatus: HealthStatus,
    issueCategory?: string,
    notes?: string,
    actionRequired: ActionRequired = 'none'
  ) => {
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

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
      checkedById: userId || 'user',
      checkedByName: userName,
      checkedByRole: userRole,
      healthStatus,
      issueCategory,
      notes: notes || '',
      actionRequired,
      createdAt: new Date().toISOString()
    }

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
          checked_by_id: userId || 'user',
          checked_by_name: userName,
          checked_by_role: userRole,
          health_status: healthStatus,
          issue_category: issueCategory,
          notes: notes,
          action_required: actionRequired
        }
      ])
    } catch (e) {
      console.warn('Supabase insert log error:', e)
    }

    // Cập nhật state nội bộ
    setInspectionLogs((prev) => [
      newLog,
      ...prev.filter((l) => !(l.deviceId === device.id && l.checkDate === todayStr))
    ])

    const statusLabel =
      healthStatus === 'healthy' ? 'Tốt ✅' : healthStatus === 'unstable' ? 'Chập chờn ⚠️' : 'Hư hỏng 🚨'
    if (onShowToast) {
      onShowToast(`Đã ghi nhận Checklist [${statusLabel}] cho ${device.name}`)
    }
  }

  return {
    assets,
    inspectionLogs,
    inspectableDevices,
    stats,
    loading,
    historyViewingDevice,
    setHistoryViewingDevice,
    fetchData,
    handleQuickCheck
  }
}
