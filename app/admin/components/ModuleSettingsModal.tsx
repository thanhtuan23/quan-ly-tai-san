import React, { useState } from 'react'
import { AppModuleId, AVAILABLE_MODULES, ModuleSettings } from '../types/modules'
import {
  X,
  Settings,
  Sliders,
  Laptop,
  AlertTriangle,
  Users,
  Save,
  ShieldAlert,
  CheckSquare,
  BarChart3,
  Send
} from 'lucide-react'

interface ModuleSettingsModalProps {
  isOpen: boolean
  settings: ModuleSettings
  onClose: () => void
  onSaveSettings: (newSettings: ModuleSettings) => void
  onOpenTelegramSettings?: () => void
}

export const ModuleSettingsModal: React.FC<ModuleSettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSaveSettings,
  onOpenTelegramSettings
}) => {
  const [localSettings, setLocalSettings] = useState<ModuleSettings>(settings)

  if (!isOpen) return null

  const handleToggleModule = (modId: AppModuleId) => {
    // Phải có ít nhất 1 module hoạt động
    const currentEnabledCount = Object.values(localSettings.modules).filter(Boolean).length
    const isCurrentlyEnabled = localSettings.modules[modId]

    if (isCurrentlyEnabled && currentEnabledCount <= 1) {
      alert('Hệ thống cần duy trì ít nhất 1 Module hoạt động!')
      return
    }

    setLocalSettings((prev) => ({
      ...prev,
      modules: {
        ...prev.modules,
        [modId]: !isCurrentlyEnabled
      }
    }))
  }

  const handleSave = () => {
    onSaveSettings(localSettings)
    onClose()
  }

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'CheckSquare':
        return <CheckSquare className="w-5 h-5 text-sky-400" />
      case 'BarChart3':
        return <BarChart3 className="w-5 h-5 text-purple-400" />
      case 'Laptop':
        return <Laptop className="w-5 h-5 text-indigo-400" />
      case 'AlertTriangle':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />
      case 'Users':
        return <Users className="w-5 h-5 text-emerald-400" />
      case 'Send':
        return <Send className="w-5 h-5 text-blue-400" />
      default:
        return <Sliders className="w-5 h-5 text-slate-400" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Quản Lý Phân Hệ (Modules Registry)</h3>
              <p className="text-xs text-slate-400">Bật / Tắt các phân hệ độc lập và cấu hình quy tắc cảnh báo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Section 1: Enable / Disable Modules */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Danh Sách Phân Hệ Hoạt Động
            </h4>

            <div className="space-y-2.5">
              {AVAILABLE_MODULES.map((mod) => {
                const isEnabled = localSettings.modules[mod.id]

                return (
                  <div
                    key={mod.id}
                    onClick={() => handleToggleModule(mod.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 ${
                      isEnabled
                        ? 'bg-slate-950 border-slate-700/80 hover:border-indigo-500/40'
                        : 'bg-slate-950/40 border-slate-800/40 opacity-60 hover:opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-800/80 flex items-center justify-center shrink-0">
                        {getModuleIcon(mod.icon)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white truncate">{mod.name}</span>
                          {mod.badgeText && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                              {mod.badgeText}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{mod.description}</p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <div
                      className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 shrink-0 ${
                        isEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section 2: Telegram Shortcut */}
          {onOpenTelegramSettings && (
            <div className="p-3.5 rounded-2xl bg-sky-950/20 border border-sky-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Send className="w-5 h-5 text-sky-400 shrink-0" />
                <div>
                  <span className="font-bold text-xs text-white block">Cấu hình Telegram Bot API</span>
                  <span className="text-[10px] text-slate-400">
                    Trạng thái: {localSettings.telegram?.enabled ? '🟢 Đang bật' : '⚪ Đang tắt'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenTelegramSettings()
                }}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors"
              >
                Cài đặt Bot
              </button>
            </div>
          )}

          {/* Section 3: Warning Thresholds */}
          <div className="space-y-3 pt-3 border-t border-slate-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Ngưỡng Cảnh Báo Bảo Hành NPP (Ngày)
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                <label className="block text-[11px] font-semibold text-amber-300">
                  Cảnh báo tiến độ (Warning ⚠️)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={localSettings.overdueThresholdDays - 1}
                    value={localSettings.warningThresholdDays}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        warningThresholdDays: Number(e.target.value) || 7
                      }))
                    }
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl py-1.5 px-3 text-xs text-white outline-none font-bold"
                  />
                  <span className="text-xs text-slate-400 shrink-0">ngày</span>
                </div>
                <p className="text-[10px] text-slate-500">Mặc định: 7 ngày</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                <label className="block text-[11px] font-semibold text-rose-400">
                  Quá hạn khẩn cấp (Overdue 🚨)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={localSettings.warningThresholdDays + 1}
                    max={60}
                    value={localSettings.overdueThresholdDays}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        overdueThresholdDays: Number(e.target.value) || 10
                      }))
                    }
                    className="w-full bg-slate-900 border border-slate-700 focus:border-rose-500 rounded-xl py-1.5 px-3 text-xs text-white outline-none font-bold"
                  />
                  <span className="text-xs text-slate-400 shrink-0">ngày</span>
                </div>
                <p className="text-[10px] text-slate-500">Mặc định: 10 ngày</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Áp dụng cấu hình</span>
          </button>
        </div>
      </div>
    </div>
  )
}
