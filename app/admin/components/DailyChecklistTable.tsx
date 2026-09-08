import React, { useState } from 'react'
import {
  InspectableDevice,
  HealthStatus,
  HEALTH_STATUS_CONFIG,
  ActionRequired,
  ACTION_REQUIRED_CONFIG,
  ISSUE_CATEGORIES
} from '../types/inspection'
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  History,
  MapPin,
  User,
  X,
  Save,
  Send,
  Sliders,
  Search,
  Filter
} from 'lucide-react'

interface DailyChecklistTableProps {
  devices: InspectableDevice[]
  currentUserName: string
  canDoInspection: boolean
  onQuickCheck: (
    device: InspectableDevice,
    status: HealthStatus,
    issueCategory?: string,
    notes?: string,
    actionRequired?: ActionRequired
  ) => void
  onViewHistory: (device: InspectableDevice) => void
}

export const DailyChecklistTable: React.FC<DailyChecklistTableProps> = ({
  devices,
  currentUserName,
  canDoInspection,
  onQuickCheck,
  onViewHistory
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unstable' | 'damaged' | 'unchecked' | 'healthy'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('Tất cả')

  // Modal for logging issues when status is 'unstable' or 'damaged'
  const [reportingDevice, setReportingDevice] = useState<{
    device: InspectableDevice
    targetStatus: 'unstable' | 'damaged'
  } | null>(null)
  const [issueCategory, setIssueCategory] = useState<string>('Nguồn / Khởi động')
  const [notes, setNotes] = useState('')
  const [actionRequired, setActionRequired] = useState<ActionRequired>('monitor')

  const locationsList = Array.from(new Set(devices.map((d) => d.location).filter(Boolean)))

  const filteredDevices = devices.filter((device) => {
    const s = searchTerm.toLowerCase()
    const matchesSearch =
      device.name.toLowerCase().includes(s) ||
      device.code.toLowerCase().includes(s) ||
      device.model.toLowerCase().includes(s) ||
      device.serialNumber.toLowerCase().includes(s) ||
      (device.imei && device.imei.toLowerCase().includes(s)) ||
      device.location.toLowerCase().includes(s) ||
      device.assignee.toLowerCase().includes(s)

    const matchesLocation = selectedLocation === 'Tất cả' || device.location === selectedLocation

    const currentStatus = device.todayStatus || 'unchecked'
    let matchesTab = true
    if (activeTab === 'unstable') matchesTab = currentStatus === 'unstable'
    else if (activeTab === 'damaged') matchesTab = currentStatus === 'damaged'
    else if (activeTab === 'healthy') matchesTab = currentStatus === 'healthy'
    else if (activeTab === 'unchecked') matchesTab = currentStatus === 'unchecked'

    return matchesSearch && matchesLocation && matchesTab
  })

  const handleStatusClick = (device: InspectableDevice, status: HealthStatus) => {
    if (!canDoInspection) {
      alert('Tài khoản của bạn chưa được cấp quyền chấm Checklist kiểm tra.')
      return
    }

    if (status === 'healthy') {
      // 1-Click instant save for healthy
      onQuickCheck(device, 'healthy', undefined, 'Hoạt động ổn định bình thường trong ca trực', 'none')
    } else if (status === 'unstable' || status === 'damaged') {
      // Open issue modal to capture detailed issue description
      setIssueCategory('Nguồn / Khởi động')
      setNotes(device.todayLog?.notes || '')
      setActionRequired(status === 'damaged' ? 'urgent_replace' : 'monitor')
      setReportingDevice({ device, targetStatus: status })
    }
  }

  const handleSaveIssueReport = () => {
    if (!reportingDevice) return
    onQuickCheck(
      reportingDevice.device,
      reportingDevice.targetStatus,
      issueCategory,
      notes.trim() || `Phát hiện tình trạng ${reportingDevice.targetStatus === 'damaged' ? 'hư hỏng' : 'chập chờn'}`,
      actionRequired
    )
    setReportingDevice(null)
  }

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-4 shadow-xl shadow-black/20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Quick Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Tất cả ({devices.length})
          </button>

          <button
            onClick={() => setActiveTab('unstable')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'unstable'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold'
                : 'bg-slate-800 text-amber-300 hover:bg-amber-500/10'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Chập chờn ⚠️ ({devices.filter((d) => d.todayStatus === 'unstable').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('damaged')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'damaged'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold'
                : 'bg-slate-800 text-rose-300 hover:bg-rose-500/10'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Hư hỏng 🚨 ({devices.filter((d) => d.todayStatus === 'damaged').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('unchecked')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'unchecked'
                ? 'bg-slate-700 text-white font-bold'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Chưa check ({devices.filter((d) => !d.todayStatus || d.todayStatus === 'unchecked').length})
          </button>

          <button
            onClick={() => setActiveTab('healthy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'healthy'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-800 text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            Tốt ({devices.filter((d) => d.todayStatus === 'healthy').length})
          </button>
        </div>

        {/* Search & Location filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm Model, S/N, IMEI..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-1.5 px-2.5 text-xs text-slate-300 outline-none"
          >
            <option value="Tất cả">Vị trí (Tất cả)</option>
            {locationsList.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Checklist Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">Thiết bị & Model</th>
                <th className="py-3.5 px-4">Serial / IMEI</th>
                <th className="py-3.5 px-4">Vị trí & Quản lý</th>
                <th className="py-3.5 px-4 text-center">Trạng thái ca hôm nay</th>
                <th className="py-3.5 px-4 text-center">Chấm Checklist (1-Click)</th>
                <th className="py-3.5 px-4">Người check & Ghi chú</th>
                <th className="py-3.5 px-4 text-right">Lịch sử</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Không tìm thấy thiết bị nào khớp với tiêu chí tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device, index) => {
                  const status = device.todayStatus || 'unchecked'
                  const statusCfg = HEALTH_STATUS_CONFIG[status]
                  const isUnstable = status === 'unstable'
                  const isDamaged = status === 'damaged'

                  return (
                    <tr
                      key={device.id}
                      className={`hover:bg-slate-850/50 transition-colors ${
                        isDamaged
                          ? 'bg-rose-950/20'
                          : isUnstable
                          ? 'bg-amber-950/15'
                          : ''
                      }`}
                    >
                      {/* Index */}
                      <td className="py-3 px-4 text-center font-mono text-slate-500 text-[11px]">
                        {index + 1}
                      </td>

                      {/* Device & Model */}
                      <td className="py-3 px-4 min-w-[200px]">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {isDamaged && (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-bounce" />
                          )}
                          {isUnstable && (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          )}
                          <span className="truncate">{device.name}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          Model: <strong className="text-slate-300 font-semibold">{device.model || 'Chưa rõ'}</strong> | Mã: {device.code}
                        </div>
                      </td>

                      {/* S/N & IMEI */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="text-slate-200 font-semibold flex items-center gap-1">
                          <span className="text-slate-500 font-sans text-[10px]">S/N:</span>
                          <span>{device.serialNumber || 'N/A'}</span>
                        </div>
                        {device.imei && (
                          <div className="text-slate-400 flex items-center gap-1 mt-0.5">
                            <span className="text-slate-500 font-sans text-[10px]">IMEI:</span>
                            <span>{device.imei}</span>
                          </div>
                        )}
                      </td>

                      {/* Location & Assignee */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-slate-200">
                          <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span className="font-medium truncate">{device.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <User className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{device.assignee} ({device.department})</span>
                        </div>
                      </td>

                      {/* Today Status Badge */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusCfg.bg} ${statusCfg.border} ${statusCfg.color}`}
                        >
                          {status === 'healthy' && <CheckCircle2 className="w-3 h-3 shrink-0" />}
                          {status === 'unstable' && <AlertTriangle className="w-3 h-3 shrink-0" />}
                          {status === 'damaged' && <AlertCircle className="w-3 h-3 shrink-0 animate-bounce" />}
                          {status === 'unchecked' && <Clock className="w-3 h-3 shrink-0" />}
                          <span>{statusCfg.shortLabel}</span>
                        </span>
                      </td>

                      {/* 1-Click Action Buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                          {/* 🟢 Healthy */}
                          <button
                            onClick={() => handleStatusClick(device, 'healthy')}
                            disabled={!canDoInspection}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                              status === 'healthy'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                            title="Đánh giá: Tốt / Ổn định"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Tốt</span>
                          </button>

                          {/* 🟡 Unstable */}
                          <button
                            onClick={() => handleStatusClick(device, 'unstable')}
                            disabled={!canDoInspection}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                              status === 'unstable'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'text-amber-400 hover:bg-amber-500/20'
                            }`}
                            title="Đánh giá: Chập chờn / Có dấu hiệu bất thường"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            <span>Chập chờn</span>
                          </button>

                          {/* 🔴 Damaged */}
                          <button
                            onClick={() => handleStatusClick(device, 'damaged')}
                            disabled={!canDoInspection}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                              status === 'damaged'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'text-rose-400 hover:bg-rose-500/20'
                            }`}
                            title="Đánh giá: Hư hỏng / Lỗi nặng"
                          >
                            <AlertCircle className="w-3 h-3" />
                            <span>Hỏng</span>
                          </button>
                        </div>
                      </td>

                      {/* Inspector & Notes */}
                      <td className="py-3 px-4 max-w-[200px]">
                        {device.todayLog ? (
                          <div className="space-y-0.5">
                            <div className="text-[11px] font-semibold text-slate-200">
                              {device.todayLog.checkedByName}{' '}
                              <span className="text-[10px] text-slate-400 font-normal">
                                ({device.todayLog.checkTime})
                              </span>
                            </div>
                            {device.todayLog.notes && (
                              <p className="text-[10px] text-slate-400 truncate italic">
                                {device.todayLog.notes}
                              </p>
                            )}
                            {device.todayLog.actionRequired && device.todayLog.actionRequired !== 'none' && (
                              <div className="text-[10px] text-amber-300 font-medium">
                                Kế hoạch: {ACTION_REQUIRED_CONFIG[device.todayLog.actionRequired]?.label}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Chưa kiểm tra</span>
                        )}
                      </td>

                      {/* View History Button */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onViewHistory(device)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-indigo-400 border border-slate-700/60 transition-colors"
                          title="Xem toàn bộ nhật ký lịch sử kiểm tra"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Unstable / Damaged Reporting */}
      {reportingDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    reportingDevice.targetStatus === 'damaged'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {reportingDevice.targetStatus === 'damaged' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Ghi nhận sự cố:{' '}
                    <span
                      className={
                        reportingDevice.targetStatus === 'damaged'
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }
                    >
                      {reportingDevice.targetStatus === 'damaged'
                        ? 'HƯ HỎNG 🚨'
                        : 'CHẬP CHỜN ⚠️'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {reportingDevice.device.name} ({reportingDevice.device.serialNumber})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReportingDevice(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Fields */}
            <div className="space-y-3 text-xs">
              {/* Issue Category */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Hạng mục lỗi / Biểu hiện:
                </label>
                <select
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white outline-none"
                >
                  {ISSUE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action plan */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Đề xuất kế hoạch xử lý:
                </label>
                <select
                  value={actionRequired}
                  onChange={(e) => setActionRequired(e.target.value as ActionRequired)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white outline-none font-medium"
                >
                  {Object.entries(ACTION_REQUIRED_CONFIG).map(([k, { label }]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Detailed notes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Mô tả chi tiết hiện tượng lỗi: <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="VD: Cổng LAN 2 chập chờn, đèn cam nhấp nháy, nguồn nóng trên 65 độ C..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 outline-none resize-none"
                />
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
                <Send className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Hệ thống sẽ tự động ghi log ca trực và bắn cảnh báo tới Telegram nếu được bật.</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setReportingDevice(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveIssueReport}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-lg flex items-center gap-1.5 ${
                  reportingDevice.targetStatus === 'damaged'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                    : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu & Ghi log ca trực</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
