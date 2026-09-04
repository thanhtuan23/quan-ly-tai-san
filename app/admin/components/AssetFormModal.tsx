import React, { useState, useEffect } from 'react'
import { Asset, AssetCategory, AssetStatus } from '../types/asset'
import { DEPARTMENT_OPTIONS } from '../data/initialAssets'
import { Tag, X } from 'lucide-react'

interface AssetFormModalProps {
  isOpen: boolean
  editingAsset: Asset | null
  nextAssetCode: string
  onClose: () => void
  onSave: (assetData: Partial<Asset>) => void
}

export const AssetFormModal: React.FC<AssetFormModalProps> = ({
  isOpen,
  editingAsset,
  nextAssetCode,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Asset>>({
    code: '',
    name: '',
    category: 'IT',
    status: 'Sẵn sàng',
    assignee: 'Chưa cấp phát',
    department: 'Phòng IT & Công nghệ',
    value: 15000000,
    purchaseDate: new Date().toISOString().split('T')[0],
    location: 'Kho Trung Tâm',
    serialNumber: '',
    notes: ''
  })

  useEffect(() => {
    if (editingAsset) {
      setFormData({ ...editingAsset })
    } else {
      setFormData({
        code: nextAssetCode,
        name: '',
        category: 'IT',
        status: 'Sẵn sàng',
        assignee: 'Chưa cấp phát',
        department: 'Phòng IT & Công nghệ',
        value: 15000000,
        purchaseDate: new Date().toISOString().split('T')[0],
        location: 'Kho Trung Tâm',
        serialNumber: '',
        notes: ''
      })
    }
  }, [editingAsset, nextAssetCode, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.code || !formData.name) {
      alert('Vui lòng nhập đầy đủ Mã tài sản và Tên tài sản')
      return
    }
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-400" />
            {editingAsset ? `Chỉnh sửa tài sản ${editingAsset.code}` : 'Thêm tài sản mới'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Mã tài sản <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="TS-IT-001"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Loại tài sản
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as AssetCategory })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-indigo-500"
              >
                <option value="IT">Thiết bị IT & Máy tính</option>
                <option value="Văn phòng">Thiết bị Văn phòng</option>
                <option value="Nội thất">Nội thất & Bàn ghế</option>
                <option value="Phương tiện">Phương tiện Vận tải</option>
                <option value="Thiết bị khác">Thiết bị khác</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Tên tài sản <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ví dụ: Laptop Dell XPS 15 9530"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as AssetStatus })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-indigo-500"
              >
                <option value="Sẵn sàng">Sẵn sàng cấp phát</option>
                <option value="Đang sử dụng">Đang sử dụng</option>
                <option value="Bảo trì">Đang bảo trì</option>
                <option value="Hỏng">Hỏng hóc</option>
                <option value="Thanh lý">Thanh lý</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Giá trị nguyên giá (VNĐ)</label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-indigo-500 font-semibold text-emerald-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Người quản lý / Giữ tài sản</label>
              <input
                type="text"
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                placeholder="Nguyễn Văn A hoặc Chưa cấp phát"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Phòng ban quản lý</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-indigo-500"
              >
                {DEPARTMENT_OPTIONS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Ngày mua / Ngày nhập</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Vị trí lưu giữ / Phòng ban</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Tầng 4 - Phòng Dev"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Số Serial (S/N)</label>
            <input
              type="text"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              placeholder="Mã số sê-ri nhà sản xuất"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Ghi chú bổ sung</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ghi chú cấu hình, linh kiện đính kèm..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              {editingAsset ? 'Cập nhật thay đổi' : 'Lưu tài sản mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
