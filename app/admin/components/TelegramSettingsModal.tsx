import React, { useState } from 'react'
import { TelegramNotificationSettings } from '../types/modules'
import { sendTelegramMessage } from '../utils/telegramNotifier'
import { X, Send, Save, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react'

interface TelegramSettingsModalProps {
  isOpen: boolean
  settings: TelegramNotificationSettings
  onClose: () => void
  onSave: (newSettings: TelegramNotificationSettings) => void
}

export const TelegramSettingsModal: React.FC<TelegramSettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSave
}) => {
  const [localSettings, setLocalSettings] = useState<TelegramNotificationSettings>(settings)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  if (!isOpen) return null

  const handleTestSend = async () => {
    if (!localSettings.botToken || !localSettings.chatId) {
      setTestResult({
        success: false,
        message: 'Vui lòng điền Telegram Bot Token và Chat ID trước khi gửi thử nghiệm.'
      })
      return
    }

    setTesting(true)
    setTestResult(null)

    const testMessage = `
🎉 <b>[QLTS PRO - TEST TELEGRAM NOTIFICATION]</b>
━━━━━━━━━━━━━━━━━━━
✅ Kết nối Telegram Bot API thành công!
⏰ Thời gian: ${new Date().toLocaleTimeString()} - Ngày ${new Date().toLocaleDateString('vi-VN')}
🤖 <b>Hệ thống:</b> Quản lý tài sản & Nhắc việc kiểm tra thiết bị tự động.
━━━━━━━━━━━━━━━━━━━
<i>Thông báo này được gửi tự động khi kiểm tra kết nối từ bảng điều khiển Admin.</i>
`.trim()

    const res = await sendTelegramMessage({
      botToken: localSettings.botToken.trim(),
      chatId: localSettings.chatId.trim(),
      message: testMessage
    })

    setTesting(false)
    if (res.success) {
      setTestResult({
        success: true,
        message: 'Gửi tin nhắn thử nghiệm tới Telegram thành công! Hãy kiểm tra ứng dụng Telegram.'
      })
    } else {
      setTestResult({
        success: false,
        message: `Lỗi kết nối Telegram: ${res.error}`
      })
    }
  }

  const handleSave = () => {
    onSave(localSettings)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cấu Hình Cảnh Báo Telegram Bot API</h3>
              <p className="text-xs text-slate-400">Tự động gửi cảnh báo thiết bị lỗi và quá hạn bảo hành</p>
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
        <div className="p-6 space-y-4 text-xs">
          {/* Toggle Enable */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
            <div>
              <span className="font-bold text-white block">Kích hoạt thông báo qua Telegram:</span>
              <span className="text-[11px] text-slate-400">Bật/tắt toàn bộ kênh thông báo tự động</span>
            </div>
            <button
              type="button"
              onClick={() =>
                setLocalSettings((prev) => ({ ...prev, enabled: !prev.enabled }))
              }
              className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${
                localSettings.enabled ? 'bg-sky-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  localSettings.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Bot Token Input */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Telegram Bot Token: <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={localSettings.botToken}
              onChange={(e) =>
                setLocalSettings((prev) => ({ ...prev, botToken: e.target.value }))
              }
              placeholder="VD: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 outline-none font-mono"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Lấy từ @BotFather trên Telegram (miễn phí và tạo trong 30 giây).
            </span>
          </div>

          {/* Chat ID Input */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Telegram Chat ID / Group ID: <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={localSettings.chatId}
              onChange={(e) =>
                setLocalSettings((prev) => ({ ...prev, chatId: e.target.value }))
              }
              placeholder="VD: -100123456789 (Group ID) hoặc 987654321 (User ID)"
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 outline-none font-mono"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              ID của bạn hoặc ID Group quản trị kỹ thuật nơi nhận cảnh báo.
            </span>
          </div>

          {/* Trigger rules */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="font-bold text-slate-300 block text-[11px] uppercase tracking-wider">
              Tự động gửi thông báo khi:
            </span>

            <label className="flex items-center gap-2.5 cursor-pointer text-slate-300 select-none">
              <input
                type="checkbox"
                checked={localSettings.alertOnDamaged}
                onChange={(e) =>
                  setLocalSettings((prev) => ({ ...prev, alertOnDamaged: e.target.checked }))
                }
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-sky-500"
              />
              <span>Phát hiện thiết bị <strong>Hư hỏng 🚨</strong> trong ca kiểm tra hàng ngày</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-slate-300 select-none">
              <input
                type="checkbox"
                checked={localSettings.alertOnUnstable}
                onChange={(e) =>
                  setLocalSettings((prev) => ({ ...prev, alertOnUnstable: e.target.checked }))
                }
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-sky-500"
              />
              <span>Phát hiện thiết bị <strong>Chập chờn ⚠️</strong> trong ca kiểm tra hàng ngày</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-slate-300 select-none">
              <input
                type="checkbox"
                checked={localSettings.alertOnWarrantyOverdue}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    alertOnWarrantyOverdue: e.target.checked
                  }))
                }
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-sky-500"
              />
              <span>Phiếu bảo hành tại NPP bị <strong>Quá hạn (&gt; 10 ngày)</strong></span>
            </label>
          </div>

          {/* Test button & feedback */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleTestSend}
              disabled={testing || !localSettings.botToken || !localSettings.chatId}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-sky-300 rounded-xl font-bold border border-sky-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              {testing ? (
                <span className="w-4 h-4 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Gửi thử tin nhắn Test tới Telegram</span>
            </button>

            {testResult && (
              <div
                className={`mt-3 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
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
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Lưu cấu hình Telegram</span>
          </button>
        </div>
      </div>
    </div>
  )
}
