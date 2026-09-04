'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Asset } from '../admin/types/asset'
import { StatusBadge } from '../admin/components/StatusBadge'
import { formatVND } from '../admin/utils/formatters'
import {
  Building2,
  Laptop,
  LogOut,
  User,
  ShieldAlert,
  Send,
  Wrench,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  PlusCircle,
  FileText,
  Tag,
  Calendar,
  MapPin,
  X
} from 'lucide-react'

export default function UserPortalPage() {
  const router = useRouter()
  const supabase = createClient()

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('user')
  const [loading, setLoading] = useState(true)
  const [myAssets, setMyAssets] = useState<Asset[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  // Modals
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [selectedAssetForReport, setSelectedAssetForReport] = useState<Asset | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Request form state
  const [requestAssetType, setRequestAssetType] = useState('Laptop / Máy tính làm việc')
  const [requestReason, setRequestReason] = useState('')

  // Report issue form state
  const [issueDescription, setIssueDescription] = useState('')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Check auth and fetch user's assigned assets
  const checkAuthAndFetchAssets = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        // Fallback for demo when testing locally without active session
        setCurrentUser({
          email: 'user@company.com',
          user_metadata: { full_name: 'Nguyễn Văn Thành', role: 'user', department: 'Phòng IT' }
        })
        setUserRole('user')
      } else {
        setCurrentUser(user)
        const role = user.user_metadata?.role || 'user'
        setUserRole(role)

        // If user is actually an admin, let them know or redirect
        if (role === 'admin') {
          // Admin can also view or switch to admin panel
        }

        // Fetch assets assigned to this user (by email or full_name)
        const userName = user.user_metadata?.full_name || ''
        const userEmail = user.email || ''

        const { data, error } = await supabase
          .from('assets')
          .select('*')
          .or(`assignee.ilike.%${userName}%,assignee.ilike.%${userEmail}%`)

        if (data && !error) {
          setMyAssets(
            data.map((row: any) => ({
              id: String(row.id),
              code: row.code || 'TS-UNKNOWN',
              name: row.name || 'Tài sản',
              category: row.category || 'IT',
              status: row.status || 'Đang sử dụng',
              assignee: row.assignee || userName,
              department: row.department || 'Phòng ban',
              value: Number(row.value) || 0,
              purchaseDate: row.purchase_date || row.purchaseDate || '',
              location: row.location || 'Văn phòng',
              serialNumber: row.serial_number || row.serialNumber || '',
              notes: row.notes || ''
            }))
          )
        }
      }
    } catch (err) {
      console.error('Error in user portal:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    checkAuthAndFetchAssets()
  }, [checkAuthAndFetchAssets])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestReason) {
      alert('Vui lòng nhập lý do đề xuất cấp phát thiết bị')
      return
    }
    showToast('Đã gửi yêu cầu cấp phát tài sản đến Quản trị viên!')
    setIsRequestModalOpen(false)
    setRequestReason('')
  }

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault()
    if (!issueDescription) {
      alert('Vui lòng mô tả sự cố hoặc tình trạng thiết bị')
      return
    }
    showToast(`Đã gửi báo cáo sự cố cho tài sản ${selectedAssetForReport?.code}!`)
    setIsReportModalOpen(false)
    setIssueDescription('')
    setSelectedAssetForReport(null)
  }

  const filteredAssets = myAssets.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const displayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Thành viên'
  const displayEmail = currentUser?.email || 'user@company.com'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-400/30 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wide text-white">
                Cổng thông tin tài sản cá nhân
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                USER PORTAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Hệ thống Quản lý tài sản nội bộ</p>
          </div>
        </div>

        {/* Right side user info & action */}
        <div className="flex items-center gap-3">
          {userRole === 'admin' && (
            <button
              onClick={() => router.push('/admin')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600 hover:text-white text-xs font-bold transition-all"
            >
              Chuyển sang trang Admin
            </button>
          )}

          <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-blue-300 font-bold text-xs">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-200 leading-tight">{displayName}</p>
              <p className="text-[10px] text-slate-400">{displayEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 p-1 rounded-lg transition-colors ml-1"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* BODY CONTENT */}
      <main className="flex-1 p-4 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
        
        {/* Banner notification for Role info */}
        <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/20 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-semibold mb-1">
              <User className="w-3 h-3" /> Tài khoản Nhân viên (User)
            </div>
            <h2 className="text-xl font-bold text-white">Xin chào, {displayName}!</h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Đây là trang theo dõi các trang thiết bị, máy móc công ty đã cấp phát cho bạn. Bạn có thể gửi đề xuất mượn mới hoặc báo cáo sự cố khi thiết bị hư hỏng.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Đề xuất cấp phát</span>
            </button>
          </div>
        </div>

        {/* SECTION: MY ASSETS LIST */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Laptop className="w-5 h-5 text-indigo-400" />
                Tài sản đang phụ trách ({myAssets.length})
              </h3>
              <p className="text-xs text-slate-400">Danh sách các thiết bị công ty được giao cho bạn quản lý</p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm tài sản..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {filteredAssets.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-300">Bạn chưa được cấp phát tài sản nào</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nhấn nút &ldquo;Đề xuất cấp phát&rdquo; ở trên để gửi yêu cầu mượn máy tính, màn hình hoặc thiết bị làm việc.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                        {asset.code}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1.5">{asset.name}</h4>
                      <p className="text-xs text-slate-400">Loại: {asset.category}</p>
                    </div>
                    <StatusBadge status={asset.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Nguyên giá:</span>
                      <strong className="text-emerald-400">{formatVND(asset.value)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Ngày cấp:</span>
                      <span>{asset.purchaseDate || 'Mới cấp'}</span>
                    </div>
                    {asset.serialNumber && (
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-500 block">S/N:</span>
                        <span className="font-mono text-slate-300">{asset.serialNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/60">
                    <button
                      onClick={() => {
                        setSelectedAssetForReport(asset)
                        setIsReportModalOpen(true)
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-rose-300 hover:text-rose-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Báo hỏng / Sự cố</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL: REQUEST ASSET */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-400" />
                Gửi đề xuất cấp phát tài sản
              </h3>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Loại thiết bị cần mượn</label>
                <select
                  value={requestAssetType}
                  onChange={(e) => setRequestAssetType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-indigo-500"
                >
                  <option value="Laptop / Máy tính làm việc">Laptop / Máy tính làm việc</option>
                  <option value="Màn hình mở rộng (Monitor)">Màn hình mở rộng (Monitor)</option>
                  <option value="Bàn phím & Chuột">Bàn phím & Chuột</option>
                  <option value="Ghế công thái học / Bàn làm việc">Ghế công thái học / Bàn làm việc</option>
                  <option value="Thiết bị văn phòng khác">Thiết bị văn phòng khác</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Lý do & Mô tả nhu cầu <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="Ví dụ: Cần thêm màn hình phụ 27 inch phục vụ công việc lập trình Front-end..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi đề xuất</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REPORT ISSUE */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-rose-400" />
                Báo cáo sự cố / Bảo trì tài sản
              </h3>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendReport} className="space-y-4 text-xs">
              {selectedAssetForReport && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <p className="text-slate-400 text-[11px]">Thiết bị báo cáo sự cố:</p>
                  <p className="font-bold text-white">{selectedAssetForReport.name}</p>
                  <p className="font-mono text-[11px] text-indigo-400">{selectedAssetForReport.code}</p>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Mô tả tình trạng lỗi / hư hỏng <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Ví dụ: Màn hình bị sọc dọc, quạt tản nhiệt kêu to hoặc bàn phím kẹt phím..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi báo cáo sự cố</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
