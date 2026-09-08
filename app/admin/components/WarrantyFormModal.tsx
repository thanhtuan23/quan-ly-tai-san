import React, { useState, useEffect } from 'react'
import {
  WarrantyReminder,
  WarrantyStatus,
  WARRANTY_STATUS_LABELS,
  COMMON_LOCATIONS,
  COMMON_SUPPLIERS
} from '../types/warranty'
import { X, Wrench, Save, Calendar, Building, MapPin, AlertCircle, Hash, Smartphone, Tag } from 'lucide-react'

interface WarrantyFormModalProps {
  isOpen: boolean
  editingItem: WarrantyReminder | null
  nextStt: number
  onClose: () => void
  onSave: (data: Partial<WarrantyReminder>) => Promise<void> | void
}

export const WarrantyFormModal: React.FC<WarrantyFormModalProps> = ({
  isOpen,
  editingItem,
  nextStt,
  onClose,
  onSave
}) => {
  const [stt, setStt] = useState<number>(nextStt)
  const [productName, setProductName] = useState('')
  const [productCode, setProductCode] = useState('')
  const [imei, setImei] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [location, setLocation] = useState<string>('Chi nhánh Hải Dương')
  const [customLocation, setCustomLocation] = useState('')
  const [supplier, setSupplier] = useState<string>('Synnex FPT')
  const [customSupplier, setCustomSupplier] = useState('')
  const [receivedDate, setReceivedDate] = useState('')
  const [sentToSupplierDate, setSentToSupplierDate] = useState('')
  const [expectedReturnDate, setExpectedReturnDate] = useState('')
  const [completedDate, setCompletedDate] = useState('')
  const [status, setStatus] = useState<WarrantyStatus>('da_gui_npp')
  const [rmaCode, setRmaCode] = useState('')
  const [cost, setCost] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const todayStr = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (editingItem) {
      setStt(editingItem.stt || 1)
      setProductName(editingItem.productName || '')
      setProductCode(editingItem.productCode || '')
      setImei(editingItem.imei || '')
      setSerialNumber(editingItem.serialNumber || '')

      if ((COMMON_LOCATIONS as readonly string[]).includes(editingItem.location)) {
        setLocation(editingItem.location)
        setCustomLocation('')
      } else {
        setLocation('Khác')
        setCustomLocation(editingItem.location || '')
      }

      if ((COMMON_SUPPLIERS as readonly string[]).includes(editingItem.supplier)) {
        setSupplier(editingItem.supplier)
        setCustomSupplier('')
      } else {
        setSupplier('Khác')
        setCustomSupplier(editingItem.supplier || '')
      }

      setReceivedDate(editingItem.receivedDate || todayStr)
      setSentToSupplierDate(editingItem.sentToSupplierDate || todayStr)
      setExpectedReturnDate(editingItem.expectedReturnDate || '')
      setCompletedDate(editingItem.completedDate || '')
      setStatus(editingItem.status || 'da_gui_npp')
      setRmaCode(editingItem.rmaCode || '')
      setCost(editingItem.cost ? String(editingItem.cost) : '')
      setNotes(editingItem.notes || '')
    } else {
      setStt(nextStt)
      setProductName('')
      setProductCode('')
      setImei('')
      setSerialNumber('')
      setLocation('Chi nhánh Hải Dương')
      setCustomLocation('')
      setSupplier('Synnex FPT')
      setCustomSupplier('')
      setReceivedDate(todayStr)
      setSentToSupplierDate(todayStr)
      setExpectedReturnDate('')
      setCompletedDate('')
      setStatus('da_gui_npp')
      setRmaCode('')
      setCost('')
      setNotes('')
    }
  }, [editingItem, isOpen, nextStt, todayStr])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productName.trim() || !serialNumber.trim()) {
      alert('Vui lòng điền Tên sản phẩm và Số Serial Number')
      return
    }

    const finalLocation = location === 'Khác' ? customLocation.trim() || 'Chưa rõ' : location
    const finalSupplier = supplier === 'Khác' ? customSupplier.trim() || 'Chưa rõ' : supplier

    setLoading(true)
    try {
      await onSave({
        stt: Number(stt) || nextStt,
        productName: productName.trim(),
        productCode: productCode.trim() || 'SP-UNKNOWN',
        imei: imei.trim(),
        serialNumber: serialNumber.trim(),
        location: finalLocation,
        supplier: finalSupplier,
        receivedDate: receivedDate || todayStr,
        sentToSupplierDate: sentToSupplierDate || todayStr,
        expectedReturnDate: expectedReturnDate || undefined,
        completedDate: status === 'hoan_thanh' ? (completedDate || todayStr) : undefined,
        status,
        rmaCode: rmaCode.trim() || undefined,
        cost: cost ? Number(cost) : undefined,
        notes: notes.trim()
      })
      onClose()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu phiếu bảo hành')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editingItem ? 'Chỉnh sửa Phiếu Bảo Hành' : 'Tạo Phiếu Nhắc Việc Bảo Hành Mới'}
              </h3>
              <p className="text-xs text-slate-400">
                {editingItem
                  ? `Mã: ${editingItem.productCode} - S/N: ${editingItem.serialNumber}`
                  : 'Ghi nhận thiết bị gửi bảo hành và kích hoạt nhắc nhở sau 7-10 ngày'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Row 1: STT & Tên sản phẩm */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                STT <span className="text-indigo-400">*</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="number"
                  required
                  min={1}
                  value={stt}
                  onChange={(e) => setStt(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tên Sản Phẩm <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="VD: Switch Cisco C1300 24 Port..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>
          </div>

          {/* Row 2: Mã Sản Phẩm, Serial Number, IMEI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mã Sản Phẩm <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                placeholder="VD: SW-C1300-24T"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Serial Number (S/N) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="VD: FOC24190ABC"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                IMEI (Nếu có)
              </label>
              <input
                type="text"
                value={imei}
                onChange={(e) => setImei(e.target.value)}
                placeholder="VD: 860123456789012"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 outline-none font-mono"
              />
            </div>
          </div>

          {/* Row 3: Nơi gửi về (Location) & Nhà Phân Phối (NPP/Supplier) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nơi gửi về (Location) <span className="text-rose-400">*</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white outline-none mb-1.5"
              >
                {COMMON_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
                <option value="Khác">-- Tự nhập nơi gửi khác --</option>
              </select>
              {location === 'Khác' && (
                <input
                  type="text"
                  required
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="Nhập địa điểm / chi nhánh gửi về..."
                  className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl py-1.5 px-3 text-xs text-white placeholder-slate-500 outline-none"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nhà Phân Phối / NPP <span className="text-rose-400">*</span>
              </label>
              <select
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white outline-none mb-1.5"
              >
                {COMMON_SUPPLIERS.map((sup) => (
                  <option key={sup} value={sup}>
                    {sup}
                  </option>
                ))}
                <option value="Khác">-- Tự nhập NPP khác --</option>
              </select>
              {supplier === 'Khác' && (
                <input
                  type="text"
                  required
                  value={customSupplier}
                  onChange={(e) => setCustomSupplier(e.target.value)}
                  placeholder="Nhập tên nhà cung cấp / NPP..."
                  className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl py-1.5 px-3 text-xs text-white placeholder-slate-500 outline-none"
                />
              )}
            </div>
          </div>

          {/* Row 4: Ngày tiếp nhận, Ngày mang qua NPP, Ngày dự kiến trả */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ngày tiếp nhận về kho
              </label>
              <input
                type="date"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ngày mang qua NPP <span className="text-indigo-400">* (Tính hạn)</span>
              </label>
              <input
                type="date"
                required
                value={sentToSupplierDate}
                onChange={(e) => setSentToSupplierDate(e.target.value)}
                className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl py-2 px-3 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ngày hẹn trả dự kiến
              </label>
              <input
                type="date"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Row 5: Trạng thái & Mã phiếu RMA */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Trạng thái xử lý <span className="text-rose-400">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as WarrantyStatus)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white outline-none"
              >
                {Object.entries(WARRANTY_STATUS_LABELS).map(([k, { label }]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mã phiếu NPP (RMA No.)
              </label>
              <input
                type="text"
                value={rmaCode}
                onChange={(e) => setRmaCode(e.target.value)}
                placeholder="VD: RMA-FPT-89421"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Chi phí bảo hành (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="VD: 500000"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 outline-none font-mono"
              />
            </div>
          </div>

          {/* Row 6: Ghi chú tình trạng lỗi */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Mô tả tình trạng lỗi & Ghi chú
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Mất nguồn đột ngột, chớp đèn cổng quang port 24, gửi kèm adapter nguồn..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 outline-none resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{editingItem ? 'Lưu thay đổi' : 'Tạo phiếu bảo hành'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
