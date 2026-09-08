import React from 'react'
import {
  InspectableDevice,
  DailyInspectionLog,
  HEALTH_STATUS_CONFIG,
  ACTION_REQUIRED_CONFIG
} from '../types/inspection'
import { X, History, Calendar, User, MapPin, CheckCircle2, AlertTriangle, AlertCircle, Clock } from 'lucide-react'

interface InspectionHistoryModalProps {
  device: InspectableDevice | null
  logs: DailyInspectionLog[]
  onClose: () => void
}

export const InspectionHistoryModal: React.FC<InspectionHistoryModalProps> = ({
  device,
  logs,
  onClose
}) => {
  if (!device) return null

  // Filter logs for this device, sorted descending
  const deviceLogs = logs
    .filter((l) => l.deviceId === device.id || l.serialNumber === device.serialNumber)
    .sort((a, b) => new Date(`${b.checkDate}T${b.checkTime || '00:00'}`).getTime() - new Date(`${a.checkDate}T${a.checkTime || '00:00'}`).getTime())

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Nhật Ký Kiểm Tra Thiết Bị</h3>
              <p className="text-xs text-slate-400">
                {device.name} (Model: {device.model || 'N/A'} - S/N: {device.serialNumber})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Quick Info Banner */}
        <div className="bg-slate-950/80 px-6 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            <span>Vị trí: <strong>{device.location}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <User className="w-3.5 h-3.5 text-purple-400" />
            <span>Quản lý: <strong>{device.assignee}</strong> ({device.department})</span>
          </div>
          <div className="text-slate-400">
            Tổng lượt kiểm tra: <strong className="text-white font-mono">{deviceLogs.length}</strong>
          </div>
        </div>

        {/* Log Timeline List */}
        <div className="p-6 max-h-[420px] overflow-y-auto space-y-3.5">
          {deviceLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Clock className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">Chưa có nhật ký kiểm tra nào được ghi nhận cho thiết bị này.</p>
            </div>
          ) : (
            deviceLogs.map((log) => {
              const statusCfg = HEALTH_STATUS_CONFIG[log.healthStatus] || HEALTH_STATUS_CONFIG.healthy

              return (
                <div
                  key={log.id}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2.5 transition-all hover:border-slate-700"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {/* Date & Time */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.checkDate}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">({log.checkTime || 'Ca ngày'})</span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusCfg.bg} ${statusCfg.border} ${statusCfg.color}`}
                    >
                      {log.healthStatus === 'healthy' && <CheckCircle2 className="w-3 h-3 shrink-0" />}
                      {log.healthStatus === 'unstable' && <AlertTriangle className="w-3 h-3 shrink-0" />}
                      {log.healthStatus === 'damaged' && <AlertCircle className="w-3 h-3 shrink-0 animate-bounce" />}
                      <span>{statusCfg.label}</span>
                    </span>
                  </div>

                  {/* Inspector info */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Người kiểm tra:</span>
                    <strong className="text-white">{log.checkedByName}</strong>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                      {log.checkedByRole}
                    </span>
                  </div>

                  {/* Issue Category & Notes */}
                  {log.notes && (
                    <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1">
                      {log.issueCategory && (
                        <div className="text-[11px] text-indigo-300 font-semibold">
                          Hạng mục: {log.issueCategory}
                        </div>
                      )}
                      <p className="italic text-slate-300">{log.notes}</p>
                    </div>
                  )}

                  {/* Action Plan */}
                  {log.actionRequired && log.actionRequired !== 'none' && (
                    <div className="text-[11px] flex items-center gap-1.5 text-amber-300">
                      <span>Đề xuất:</span>
                      <strong className="underline">
                        {ACTION_REQUIRED_CONFIG[log.actionRequired]?.label}
                      </strong>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
