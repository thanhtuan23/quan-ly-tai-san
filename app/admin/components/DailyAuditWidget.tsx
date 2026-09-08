import React from 'react'
import { DailyInspectionLog, InspectableDevice } from '../types/inspection'
import { CheckCircle2, AlertTriangle, AlertCircle, UserCheck, Shield, Clock, ArrowRight } from 'lucide-react'

interface DailyAuditWidgetProps {
  devices: InspectableDevice[]
  logs: DailyInspectionLog[]
  todayStr: string
  onSwitchToInspectionTab: () => void
}

export const DailyAuditWidget: React.FC<DailyAuditWidgetProps> = ({
  devices,
  logs,
  todayStr,
  onSwitchToInspectionTab
}) => {
  const todayLogs = logs.filter((l) => l.checkDate === todayStr)
  const checkedDevicesCount = new Set(todayLogs.map((l) => l.deviceId)).size
  const totalDevices = devices.length
  const completionPercent = totalDevices > 0 ? Math.round((checkedDevicesCount / totalDevices) * 100) : 0

  // Inspectors who checked today
  const inspectors = Array.from(new Set(todayLogs.map((l) => `${l.checkedByName} (${l.checkedByRole})`)))

  // Unstable & Damaged devices today
  const problematicLogs = todayLogs.filter(
    (l) => l.healthStatus === 'unstable' || l.healthStatus === 'damaged'
  )

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-5 shadow-xl shadow-black/20 space-y-4">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Kiểm Soát Ca Trực Hôm Nay ({todayStr})</h4>
            <p className="text-[11px] text-slate-400">
              Giám sát tiến độ nhân viên checklist và các thiết bị phát sinh sự cố
            </p>
          </div>
        </div>

        <button
          onClick={onSwitchToInspectionTab}
          className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <span>Vào bảng Checklist</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress & Inspectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* Progress Bar */}
        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-semibold">Tiến độ kiểm tra:</span>
            <strong className="text-indigo-300 font-bold font-mono">
              {checkedDevicesCount}/{totalDevices} ({completionPercent}%)
            </strong>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                completionPercent === 100
                  ? 'bg-emerald-500'
                  : completionPercent > 50
                  ? 'bg-indigo-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500">
            {completionPercent === 100
              ? '✅ Toàn bộ thiết bị đã được kiểm tra trong ca!'
              : `⏳ Còn ${totalDevices - checkedDevicesCount} thiết bị chưa được checklist.`}
          </p>
        </div>

        {/* Inspectors list */}
        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 space-y-1.5">
          <span className="text-slate-400 font-semibold block">Nhân sự đã trực hôm nay:</span>
          {inspectors.length === 0 ? (
            <span className="text-slate-500 italic text-[11px] block">Chưa có ai chấm checklist</span>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
              {inspectors.map((ins, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold"
                >
                  {ins}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Alerts summary */}
        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 space-y-1.5">
          <span className="text-slate-400 font-semibold block">Cảnh báo ca trực:</span>
          {problematicLogs.length === 0 ? (
            <div className="text-emerald-400 flex items-center gap-1.5 text-xs font-semibold pt-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Không có thiết bị lỗi hôm nay</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-rose-400 font-bold flex items-center gap-1.5 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 animate-bounce" />
                <span>Phát hiện {problematicLogs.length} thiết bị bất thường!</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Gồm {problematicLogs.filter((l) => l.healthStatus === 'damaged').length} hư hỏng,{' '}
                {problematicLogs.filter((l) => l.healthStatus === 'unstable').length} chập chờn.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
