import React from 'react'
import { UserProfile } from '../types/user'
import {
  ShieldCheck,
  UserCheck,
  Building,
  Calendar,
  Edit2,
  Trash2,
  Ban,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react'

interface UserTableProps {
  users: UserProfile[]
  currentAdminEmail?: string
  onEdit: (user: UserProfile) => void
  onToggleStatus: (user: UserProfile) => void
  onDelete: (user: UserProfile) => void
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  currentAdminEmail,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  if (users.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center shadow-xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400 shadow-inner">
          <Users className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-base font-bold text-white">Không tìm thấy tài khoản nào</h3>
          <p className="text-xs text-slate-400 mt-1">
            Không có người dùng nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại. Hãy thử đặt lại bộ lọc.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <th className="py-4 px-5">Tài khoản / Người dùng</th>
              <th className="py-4 px-4">Vai trò (Role)</th>
              <th className="py-4 px-4">Phòng ban</th>
              <th className="py-4 px-4">Trạng thái</th>
              <th className="py-4 px-4">Ngày đăng ký</th>
              <th className="py-4 px-5 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {users.map((user) => {
              const isCurrentAdmin = currentAdminEmail && user.email.toLowerCase() === currentAdminEmail.toLowerCase()
              const initials = user.fullName
                ? user.fullName
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : user.email.slice(0, 2).toUpperCase()

              return (
                <tr
                  key={user.id}
                  className={`hover:bg-slate-800/40 transition-colors group ${
                    user.status === 'banned'
                      ? 'opacity-60 bg-rose-950/10'
                      : user.status === 'inactive'
                      ? 'opacity-75 bg-amber-950/10'
                      : ''
                  }`}
                >
                  {/* User Profile / Avatar / Email */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border shrink-0 ${
                          user.role === 'admin'
                            ? 'bg-purple-950/80 border-purple-500/40 text-purple-300 shadow-sm'
                            : 'bg-blue-950/80 border-blue-500/40 text-blue-300 shadow-sm'
                        }`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                            {user.fullName || 'Chưa cập nhật tên'}
                          </span>
                          {isCurrentAdmin && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                              Bạn
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="py-4 px-4">
                    {user.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                        <span>Quản trị viên (Admin)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[11px] font-bold">
                        <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span>Nhân viên (User)</span>
                      </span>
                    )}
                  </td>

                  {/* Department */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{user.department || 'Chưa phân bổ'}</span>
                    </div>
                  </td>

                  {/* Status Badge (3 states: active, inactive, banned) */}
                  <td className="py-4 px-4">
                    {user.status === 'active' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Hoạt động</span>
                      </span>
                    )}
                    {user.status === 'inactive' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Tạm ngưng</span>
                      </span>
                    )}
                    {user.status === 'banned' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-semibold">
                        <Ban className="w-3 h-3 text-rose-400" />
                        <span>Đã khóa</span>
                      </span>
                    )}
                  </td>

                  {/* Created Date */}
                  <td className="py-4 px-4 text-slate-400 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Không rõ'}</span>
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Edit Button */}
                      <button
                        onClick={() => onEdit(user)}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-indigo-600 hover:text-white text-slate-300 border border-slate-700 hover:border-indigo-500 transition-all"
                        title="Chỉnh sửa thông tin, Vai trò & Trạng thái"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Toggle Quick Status */}
                      {!isCurrentAdmin && (
                        <button
                          onClick={() => onToggleStatus(user)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            user.status === 'active'
                              ? 'bg-slate-800/80 hover:bg-rose-600 hover:text-white text-rose-400 border-slate-700 hover:border-rose-500'
                              : 'bg-slate-800/80 hover:bg-emerald-600 hover:text-white text-emerald-400 border-slate-700 hover:border-emerald-500'
                          }`}
                          title={user.status === 'active' ? 'Khóa tài khoản (Banned)' : 'Mở khóa kích hoạt (Active)'}
                        >
                          {user.status === 'active' ? (
                            <Ban className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      {/* Modal Manage Status & Delete */}
                      {!isCurrentAdmin && (
                        <button
                          onClick={() => onDelete(user)}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-600 hover:text-white text-rose-400 border border-slate-700 hover:border-rose-500 transition-all"
                          title="Khóa hoặc xóa tài khoản"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
