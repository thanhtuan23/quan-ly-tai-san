import React, { useState, useEffect } from 'react'
import { UserProfile, UserRole, UserStatus } from '../types/user'
import {
  X,
  User,
  Mail,
  Building,
  ShieldCheck,
  UserCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

interface UserFormModalProps {
  isOpen: boolean
  editingUser: UserProfile | null
  onClose: () => void
  onSave: (formData: {
    id?: string
    fullName: string
    email: string
    role: UserRole
    department: string
    status: UserStatus
    password?: string
  }) => Promise<void>
}

const DEPARTMENTS = [
  'Phòng IT & Công nghệ',
  'Phòng Kế toán & Tài chính',
  'Phòng Nhân sự (HR)',
  'Phòng Kinh doanh (Sales)',
  'Phòng Vận hành & Hành chính',
  'Ban Giám đốc',
  'Khác'
]

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  editingUser,
  onClose,
  onSave,
}) => {
  const isEdit = !!editingUser

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('Phòng IT & Công nghệ')
  const [role, setRole] = useState<UserRole>('user')
  const [status, setStatus] = useState<UserStatus>('active')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (editingUser) {
      setFullName(editingUser.fullName || '')
      setEmail(editingUser.email || '')
      setDepartment(editingUser.department || 'Phòng IT & Công nghệ')
      setRole(editingUser.role || 'user')
      setStatus(editingUser.status || 'active')
      setPassword('')
    } else {
      setFullName('')
      setEmail('')
      setDepartment('Phòng IT & Công nghệ')
      setRole('user')
      setStatus('active')
      setPassword('')
    }
    setErrorMsg(null)
  }, [editingUser, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!fullName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên')
      return
    }

    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ email')
      return
    }

    if (!isEdit && (!password || password.length < 6)) {
      setErrorMsg('Mật khẩu khởi tạo phải có ít nhất 6 ký tự')
      return
    }

    try {
      setLoading(true)
      await onSave({
        id: editingUser?.id,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        role,
        department,
        status,
        password: password || undefined
      })
    } catch (err: any) {
      setErrorMsg(err.message || 'Đã có lỗi xảy ra khi lưu thông tin người dùng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                role === 'admin'
                  ? 'bg-purple-600/20 border-purple-500/30 text-purple-400'
                  : 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400'
              }`}
            >
              {role === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEdit ? 'Chỉnh sửa tài khoản & Phân quyền' : 'Thêm người dùng mới'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEdit
                  ? `Cập nhật thông tin và vai trò cho ${editingUser.email}`
                  : 'Tạo tài khoản thành viên mới trên hệ thống'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Họ và Tên <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Địa chỉ Email <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  disabled={isEdit}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className={`w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-500 outline-none transition-all ${
                    isEdit ? 'opacity-60 cursor-not-allowed' : 'focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Department & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Phòng ban công tác <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 pl-9 pr-3 text-white outline-none transition-all"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Trạng thái tài khoản
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-white outline-none transition-all"
              >
                <option value="active">🟢 Đang hoạt động (Active)</option>
                <option value="inactive">🟡 Tạm ngưng hoạt động (Inactive)</option>
                <option value="banned">🔴 Đã khóa truy cập (Banned)</option>
              </select>
            </div>
          </div>

          {/* Password (Only if creating new user) */}
          {!isEdit && (
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Mật khẩu khởi tạo <span className="text-rose-400">*</span> (tối thiểu 6 ký tự)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 pl-9 pr-10 text-white placeholder-slate-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* ROLE SELECTOR CARDS (Chuyển đổi phân quyền Admin vs User) */}
          <div className="pt-2">
            <label className="block font-semibold text-slate-300 mb-2">
              Phân quyền tài khoản (Role) <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Admin */}
              <div
                onClick={() => setRole('admin')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                  role === 'admin'
                    ? 'bg-purple-950/40 border-purple-500 text-purple-200 ring-2 ring-purple-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-white">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span>Quản trị viên (Admin)</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      role === 'admin' ? 'border-purple-400 bg-purple-500' : 'border-slate-600'
                    }`}
                  >
                    {role === 'admin' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Toàn quyền thêm, sửa, xóa tài sản, xuất báo cáo CSV và quản lý tài khoản người dùng.
                </p>
              </div>

              {/* Option 2: Regular User */}
              <div
                onClick={() => setRole('user')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                  role === 'user'
                    ? 'bg-blue-950/40 border-blue-500 text-blue-200 ring-2 ring-blue-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-white">
                    <UserCheck className="w-4 h-4 text-blue-400" />
                    <span>Nhân viên (User)</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      role === 'user' ? 'border-blue-400 bg-blue-500' : 'border-slate-600'
                    }`}
                  >
                    {role === 'user' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Theo dõi danh sách tài sản được bàn giao, gửi đề xuất mượn mới và báo sự cố hư hỏng.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl font-semibold transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
