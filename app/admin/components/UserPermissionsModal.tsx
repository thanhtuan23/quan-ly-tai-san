import React, { useState, useEffect } from 'react'
import {
  UserProfile,
  UserRole,
  UserModulePermissions,
  DEFAULT_PERMISSIONS_BY_ROLE
} from '../types/user'
import { X, Shield, Lock, Save, Check, UserCheck, DollarSign, Eye, Wrench, CheckSquare, BarChart3, Users, Settings } from 'lucide-react'

interface UserPermissionsModalProps {
  isOpen: boolean
  user: UserProfile | null
  onClose: () => void
  onSavePermissions: (userId: string, newRole: UserRole, newPermissions: UserModulePermissions) => void
}

export const UserPermissionsModal: React.FC<UserPermissionsModalProps> = ({
  isOpen,
  user,
  onClose,
  onSavePermissions
}) => {
  const [role, setRole] = useState<UserRole>('user')
  const [permissions, setPermissions] = useState<UserModulePermissions>(DEFAULT_PERMISSIONS_BY_ROLE.user)

  useEffect(() => {
    if (user) {
      setRole(user.role || 'user')
      const initialPerms = user.permissions || DEFAULT_PERMISSIONS_BY_ROLE[user.role || 'user']
      setPermissions({ ...DEFAULT_PERMISSIONS_BY_ROLE[user.role || 'user'], ...initialPerms })
    }
  }, [user, isOpen])

  if (!isOpen || !user) return null

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole)
    // Preset default permissions according to selected role
    setPermissions(DEFAULT_PERMISSIONS_BY_ROLE[newRole])
  }

  const togglePermission = (key: keyof UserModulePermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = () => {
    onSavePermissions(user.id, role, permissions)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Ma Trận Phân Quyền Chi Tiết Theo User</h3>
              <p className="text-xs text-slate-400">
                Tùy chỉnh quyền truy cập module và tính năng cho <strong className="text-white">{user.fullName}</strong>
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

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* User Summary Banner */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-sm">{user.fullName}</div>
              <div className="text-slate-400 text-xs mt-0.5">{user.email} • {user.department}</div>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {role}
            </span>
          </div>

          {/* Role Switcher */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-semibold">Cấp bậc vai trò (Role):</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all text-center ${
                  role === 'admin'
                    ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Admin (Toàn quyền)
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('manager')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all text-center ${
                  role === 'manager'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Manager (Quản lý)
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('user')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all text-center ${
                  role === 'user'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                User (Nhân viên)
              </button>
            </div>
          </div>

          {/* Granular Permissions Checklist */}
          <div className="space-y-2.5">
            <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              Quyền hạn tính năng chi tiết cho User này:
            </label>

            <div className="space-y-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              {/* Permission Item: Daily Inspection */}
              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900 cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5">
                  <CheckSquare className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white block">Thực hiện Checklist kiểm tra hàng ngày</span>
                    <span className="text-[10px] text-slate-400">Được quyền chấm tình trạng Tốt / Chập chờn / Hư hỏng</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.canDoInspection}
                  onChange={() => togglePermission('canDoInspection')}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              {/* Permission Item: View Price & Depreciation */}
              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900 cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5">
                  <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white block">Xem Giá Tiền & Định Giá Khấu Hao</span>
                    <span className="text-[10px] text-slate-400">Cho phép User thấy giá mua và độ hao mòn thiết bị</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.canViewPrice}
                  onChange={() => togglePermission('canViewPrice')}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              {/* Permission Item: View Hologram Reports */}
              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900 cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white block">Xem Dashboard & Báo Cáo Phân Tích</span>
                    <span className="text-[10px] text-slate-400">Cho phép xem biểu đồ Ngày/Tuần/Tháng & Kế hoạch thay thế</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.canViewReports}
                  onChange={() => togglePermission('canViewReports')}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              {/* Permission Item: Edit Assets */}
              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900 cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5">
                  <Wrench className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white block">Thêm / Sửa / Xóa Danh mục Tài sản</span>
                    <span className="text-[10px] text-slate-400">Cập nhật thông tin mã TS, serial, vị trí và cấp phát</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.canEditAssets}
                  onChange={() => togglePermission('canEditAssets')}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              {/* Permission Item: Edit Warranty */}
              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900 cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white block">Quản lý Phiếu Nhắc Việc Bảo Hành</span>
                    <span className="text-[10px] text-slate-400">Tạo phiếu mang qua NPP, cập nhật trạng thái & chi phí bảo hành</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.canEditWarranty}
                  onChange={() => togglePermission('canEditWarranty')}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              {/* Permission Item: Manage Users & Settings */}
              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900 cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white block">Quản trị Người Dùng & Cài Đặt Module</span>
                    <span className="text-[10px] text-slate-400">Khóa tài khoản, phân quyền, cấu hình Telegram Bot</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.canManageUsers}
                  onChange={() => togglePermission('canManageUsers')}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
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
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Lưu phân quyền User</span>
          </button>
        </div>
      </div>
    </div>
  )
}
