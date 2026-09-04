import React, { useState } from 'react'
import { UserProfile, UserStatus } from '../types/user'
import { AlertTriangle, X, Trash2, Ban, Clock, CheckCircle2, ShieldAlert } from 'lucide-react'

interface DeleteUserModalProps {
  userToDelete: UserProfile | null
  onClose: () => void
  onUpdateStatus: (user: UserProfile, newStatus: UserStatus) => Promise<void>
  onConfirmDelete: (user: UserProfile) => Promise<void>
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  userToDelete,
  onClose,
  onUpdateStatus,
  onConfirmDelete,
}) => {
  const [loading, setLoading] = useState(false)
  const [showHardDeleteConfirm, setShowHardDeleteConfirm] = useState(false)

  if (!userToDelete) return null

  const handleStatusChange = async (status: UserStatus) => {
    try {
      setLoading(true)
      await onUpdateStatus(userToDelete, status)
    } finally {
      setLoading(false)
    }
  }

  const handleHardDelete = async () => {
    try {
      setLoading(true)
      await onConfirmDelete(userToDelete)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Quản lý quyền truy cập tài khoản</h3>
              <p className="text-xs text-slate-400">Khóa hoặc thay đổi trạng thái đăng nhập</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {/* User Detail Info Box */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Thành viên:</span>
              <strong className="text-white">{userToDelete.fullName || 'Chưa đặt tên'}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Email đăng nhập:</span>
              <span className="text-indigo-400 font-mono font-medium">{userToDelete.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Vai trò hiện tại:</span>
              <span className="font-semibold text-slate-200 capitalize">
                {userToDelete.role === 'admin' ? 'Quản trị viên (Admin)' : 'Nhân viên (User)'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Trạng thái hiện tại:</span>
              <span>
                {userToDelete.status === 'active' && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-semibold border border-emerald-500/30">
                    🟢 Đang hoạt động
                  </span>
                )}
                {userToDelete.status === 'inactive' && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[11px] font-semibold border border-amber-500/30">
                    🟡 Tạm ngưng
                  </span>
                )}
                {userToDelete.status === 'banned' && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-[11px] font-semibold border border-rose-500/30">
                    🔴 Đã bị khóa
                  </span>
                )}
              </span>
            </div>
          </div>

          {!showHardDeleteConfirm ? (
            <>
              <p className="text-slate-300 leading-relaxed font-medium">
                Chọn hành động bạn muốn thực hiện đối với tài khoản này:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* Option 1: Ban / Lock */}
                {userToDelete.status !== 'banned' && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleStatusChange('banned')}
                    className="p-3 rounded-2xl bg-rose-950/30 border border-rose-800/40 hover:bg-rose-900/50 hover:border-rose-600 text-left transition-all group"
                  >
                    <div className="flex items-center gap-2 font-bold text-rose-400 mb-1">
                      <Ban className="w-4 h-4" />
                      <span>Khóa tài khoản (Banned)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Chặn đăng nhập ngay lập tức. Bảo toàn 100% lịch sử giao nhận tài sản.
                    </p>
                  </button>
                )}

                {/* Option 2: Inactive / Suspend */}
                {userToDelete.status !== 'inactive' && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleStatusChange('inactive')}
                    className="p-3 rounded-2xl bg-amber-950/30 border border-amber-800/40 hover:bg-amber-900/50 hover:border-amber-600 text-left transition-all group"
                  >
                    <div className="flex items-center gap-2 font-bold text-amber-400 mb-1">
                      <Clock className="w-4 h-4" />
                      <span>Tạm ngưng (Inactive)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Tạm ngưng đăng nhập (ví dụ: nhân viên tạm nghỉ phép dài hạn).
                    </p>
                  </button>
                )}

                {/* Option 3: Active / Unlock */}
                {userToDelete.status !== 'active' && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleStatusChange('active')}
                    className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 hover:bg-emerald-900/50 hover:border-emerald-600 text-left transition-all group col-span-1 sm:col-span-2"
                  >
                    <div className="flex items-center gap-2 font-bold text-emerald-400 mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mở khóa / Kích hoạt lại (Active)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Cho phép người dùng đăng nhập và sử dụng hệ thống bình thường.
                    </p>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Cảnh báo xóa vĩnh viễn hồ sơ</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Việc xóa trực tiếp hồ sơ khỏi cơ sở dữ liệu có thể thất bại nếu người dùng này đang liên kết với các tài sản hoặc chưa xóa trong Supabase Authentication. Chúng tôi khuyến nghị sử dụng <strong>Khóa tài khoản (Banned)</strong> thay vì xóa cứng.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowHardDeleteConfirm(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleHardDelete}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Tiếp tục xóa hồ sơ</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          {!showHardDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowHardDeleteConfirm(true)}
              className="text-slate-500 hover:text-rose-400 transition-colors text-[11px] underline"
            >
              Tùy chọn nâng cao: Xóa hồ sơ
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl font-semibold transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  )
}
