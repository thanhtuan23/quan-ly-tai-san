import React, { useState, useMemo } from 'react'
import { InspectableDevice, DailyInspectionLog } from '../types/inspection'
import { WarrantyReminder } from '../types/warranty'
import { Asset } from '../types/asset'
import { calculateDepreciation } from '../utils/depreciation'
import { formatVND } from '../utils/formatters'
import {
  Activity,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  Wrench,
  TrendingDown,
  Clock,
  Sparkles,
  Download,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCcw
} from 'lucide-react'

interface HologramDashboardProps {
  devices: InspectableDevice[]
  inspectionLogs: DailyInspectionLog[]
  warrantyItems: WarrantyReminder[]
  assets: Asset[]
  canViewPrice: boolean
  onNavigateToInspection: () => void
  onNavigateToWarranty: () => void
}

export const HologramDashboard: React.FC<HologramDashboardProps> = ({
  devices,
  inspectionLogs,
  warrantyItems,
  assets,
  canViewPrice,
  onNavigateToInspection,
  onNavigateToWarranty
}) => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  // Filter logs by period
  const filteredLogs = useMemo(() => {
    const now = new Date()
    return inspectionLogs.filter((log) => {
      const logDate = new Date(log.checkDate)
      if (isNaN(logDate.getTime())) return false

      if (period === 'daily') {
        const todayStr = now.toISOString().split('T')[0]
        return log.checkDate === todayStr
      } else if (period === 'weekly') {
        const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
        return diffDays <= 7
      } else {
        const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
        return diffDays <= 30
      }
    })
  }, [inspectionLogs, period])

  // Aggregate health stats
  const healthStats = useMemo(() => {
    const healthyCount = devices.filter((d) => d.todayStatus === 'healthy').length
    const unstableCount = devices.filter((d) => d.todayStatus === 'unstable').length
    const damagedCount = devices.filter((d) => d.todayStatus === 'damaged').length
    const uncheckedCount = devices.filter((d) => !d.todayStatus || d.todayStatus === 'unchecked').length
    const total = devices.length
    const healthyPercent = total > 0 ? Math.round((healthyCount / total) * 100) : 0

    return { healthyCount, unstableCount, damagedCount, uncheckedCount, total, healthyPercent }
  }, [devices])

  // Replacement priority list (Devices currently damaged or unstable)
  const replacementList = useMemo(() => {
    return devices.filter(
      (d) => d.todayStatus === 'damaged' || d.todayStatus === 'unstable'
    )
  }, [devices])

  // Depreciation and Lifecycle calculation for all assets
  const lifecycleSummary = useMemo(() => {
    let totalOriginalValue = 0
    let totalCurrentValue = 0
    let endOfLifeCount = 0
    let expiringSoonCount = 0
    let inWarrantyCount = 0

    assets.forEach((a) => {
      const dep = calculateDepreciation(a.value, a.purchaseDate, a.warrantyYears || 2)
      totalOriginalValue += dep.originalValue
      totalCurrentValue += dep.currentValue

      if (dep.lifecycleStatus === 'end_of_life') endOfLifeCount++
      else if (dep.lifecycleStatus === 'expiring_soon') expiringSoonCount++
      else inWarrantyCount++
    })

    const overallDepreciationRate =
      totalOriginalValue > 0
        ? Math.round(((totalOriginalValue - totalCurrentValue) / totalOriginalValue) * 100)
        : 0

    return {
      totalOriginalValue,
      totalCurrentValue,
      overallDepreciationRate,
      endOfLifeCount,
      expiringSoonCount,
      inWarrantyCount
    }
  }, [assets])

  return (
    <div className="space-y-6">
      {/* 1. Futuristic Hologram Header & Period Switcher */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950/50 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl shadow-indigo-500/10">
        {/* Hologram glowing backdrop light */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>HOLOGRAM EXECUTIVE DASHBOARD & REPORTS</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              Trung Tâm Báo Cáo Sức Khỏe & Vòng Đời Thiết Bị
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Dữ liệu tổng hợp từ nhật ký kiểm tra hàng ngày, theo dõi độ hao mòn khấu hao, và cảnh báo thiết bị cần thay thế / bảo hành.
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <button
              onClick={() => setPeriod('daily')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                period === 'daily'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Hôm nay</span>
            </button>

            <button
              onClick={() => setPeriod('weekly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                period === 'weekly'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>7 ngày qua</span>
            </button>

            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                period === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tháng này</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tỷ lệ sức khỏe ổn định */}
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-5 shadow-xl shadow-emerald-500/5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400">Chỉ số Sức Khỏe Thiết Bị</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {healthStats.healthyPercent}%
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${healthStats.healthyPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {healthStats.healthyCount} / {healthStats.total} thiết bị đang chạy tốt
            </p>
          </div>
        </div>

        {/* Card 2: Thiết bị có nguy cơ (Chập chờn + Hư hỏng) */}
        <div className="bg-slate-900/90 border border-rose-500/30 rounded-3xl p-5 shadow-xl shadow-rose-500/5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400">Sự Cố Cần Kế Hoạch Xử Lý</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-4 h-4 animate-bounce" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-rose-400 tracking-tight">
              {healthStats.damagedCount + healthStats.unstableCount}
            </div>
            <div className="flex items-center gap-2 text-[11px] mt-2 font-medium">
              <span className="text-rose-300 font-bold">{healthStats.damagedCount} hư hỏng</span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-300 font-bold">{healthStats.unstableCount} chập chờn</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Cần lên phương án thay thế / bảo hành</p>
          </div>
        </div>

        {/* Card 3: Thiết bị đang bảo hành tại NPP */}
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-5 shadow-xl shadow-indigo-500/5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400">Đang Bảo Hành Tại NPP</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-indigo-300 tracking-tight">
              {warrantyItems.filter((w) => w.status !== 'hoan_thanh').length}
            </div>
            <p className="text-[11px] text-slate-300 mt-2">
              Phiếu bảo hành đang chờ NPP xử lý
            </p>
            <button
              onClick={onNavigateToWarranty}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 mt-1 transition-colors"
            >
              <span>Xem phân hệ bảo hành</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Vòng đời & Khấu hao tổng */}
        <div className="bg-slate-900/90 border border-purple-500/30 rounded-3xl p-5 shadow-xl shadow-purple-500/5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400">Vòng Đời & Độ Hao Mòn</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-purple-300 tracking-tight">
              {lifecycleSummary.overallDepreciationRate}%
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Hết bảo hành (Hết vòng đời): <strong className="text-rose-400 font-bold">{lifecycleSummary.endOfLifeCount}</strong> SP
            </p>
            {canViewPrice && (
              <p className="text-[10px] text-emerald-400 mt-1 font-mono">
                Giá trị còn lại: {formatVND(lifecycleSummary.totalCurrentValue)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Replacement Priority Action Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Danh sách thiết bị cần thay thế / xử lý ngay */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Kế Hoạch Thay Thế & Sửa Chữa Ưu Tiên</h3>
                <p className="text-[11px] text-slate-400">
                  Các thiết bị phát hiện lỗi hỏng hoặc chập chờn trong đợt kiểm tra
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateToInspection}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
            >
              <span>Vào chấm Checklist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {replacementList.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-300">Tất cả thiết bị đều đang hoạt động tốt!</p>
              <p className="text-xs text-slate-500">Chưa có thiết bị nào bị báo hỏng hoặc chập chờn trong ca này.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {replacementList.map((device) => {
                const isDamaged = device.todayStatus === 'damaged'
                const log = device.todayLog

                return (
                  <div
                    key={device.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isDamaged
                        ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
                        : 'bg-amber-950/15 border-amber-500/30 hover:border-amber-500/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${
                            isDamaged
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {isDamaged ? 'Hư hỏng 🚨' : 'Chập chờn ⚠️'}
                        </span>
                        <h4 className="font-bold text-xs text-white">{device.name}</h4>
                        <span className="text-[11px] font-mono text-slate-400">
                          (S/N: {device.serialNumber})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        <strong>Vị trí:</strong> {device.location} • <strong>Quản lý:</strong>{' '}
                        {device.assignee} ({device.department})
                      </p>
                      {log?.notes && (
                        <p className="text-[11px] text-slate-400 italic">
                          Mô tả lỗi: &ldquo;{log.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      {log?.actionRequired && log.actionRequired !== 'none' && (
                        <div className="text-[11px] font-bold text-amber-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 inline-block mb-1">
                          Đề xuất: {log.actionRequired}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-500">
                        Check lúc: {log?.checkTime || 'N/A'} bởi {log?.checkedByName || 'Admin'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Khấu hao & Vòng đời sản phẩm */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Vòng Đời & Khấu Hao</h3>
              <p className="text-[11px] text-slate-400">Đánh giá thời hạn bảo hành & giá trị</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Rule quote */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed">
              💡 <strong>Quy tắc khấu hao:</strong> Thiết bị hết thời hạn bảo hành (24/36 tháng) đồng nghĩa với việc hết vòng đời kỹ thuật tiêu chuẩn, cần lập phương án khấu trừ và thay thế mới.
            </div>

            {/* Lifecycle Breakdown List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Trong hạn bảo hành:
                </span>
                <strong className="text-emerald-400 font-mono text-sm">
                  {lifecycleSummary.inWarrantyCount} thiết bị
                </strong>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Sắp hết bảo hành (&lt; 3 tháng):
                </span>
                <strong className="text-amber-400 font-mono text-sm">
                  {lifecycleSummary.expiringSoonCount} thiết bị
                </strong>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-rose-500/20 bg-rose-950/10">
                <span className="text-rose-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  Hết bảo hành (Hết vòng đời):
                </span>
                <strong className="text-rose-400 font-mono text-sm">
                  {lifecycleSummary.endOfLifeCount} thiết bị
                </strong>
              </div>
            </div>

            {/* Financial view if authorized */}
            {canViewPrice ? (
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-indigo-500/20 space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Định giá tài sản hệ thống
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Nguyên giá:</span>
                  <span className="text-slate-200 font-mono font-bold">
                    {formatVND(lifecycleSummary.totalOriginalValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Giá trị còn lại:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {formatVND(lifecycleSummary.totalCurrentValue)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-[10px] text-slate-500 italic text-center">
                (Thông tin giá tiền và định giá khấu hao bị ẩn theo phân quyền tài khoản của bạn)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
