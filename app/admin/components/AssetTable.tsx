import React from 'react'
import { Asset } from '../types/asset'
import { StatusBadge } from './StatusBadge'
import { formatVND } from '../utils/formatters'
import { Eye, Edit3, Trash2, Search } from 'lucide-react'

interface AssetTableProps {
  assets: Asset[]
  onView: (asset: Asset) => void
  onEdit: (asset: Asset) => void
  onDelete: (id: string) => void
}

export const AssetTable: React.FC<AssetTableProps> = ({
  assets,
  onView,
  onEdit,
  onDelete,
}) => {
  const totalValue = assets.reduce((s, item) => s + (item.value || 0), 0)

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <th className="py-3.5 px-4">Mã Tài Sản</th>
              <th className="py-3.5 px-4">Tên Tài Sản</th>
              <th className="py-3.5 px-4">Loại</th>
              <th className="py-3.5 px-4">Trạng Thái</th>
              <th className="py-3.5 px-4">Người / Bộ Phận</th>
              <th className="py-3.5 px-4 text-right">Giá Trị</th>
              <th className="py-3.5 px-4">Ngày Nhập</th>
              <th className="py-3.5 px-4 text-center">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {assets.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Search className="w-8 h-8 text-slate-600" />
                    <p className="text-sm font-medium">Không tìm thấy tài sản nào phù hợp</p>
                    <p className="text-xs text-slate-600">Thử thay đổi từ khóa hoặc đặt lại bộ lọc</p>
                  </div>
                </td>
              </tr>
            ) : (
              assets.map((asset) => (
                <tr
                  key={asset.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Code */}
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-300 whitespace-nowrap">
                    {asset.code}
                  </td>

                  {/* Name */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-slate-100 group-hover:text-indigo-200 transition-colors line-clamp-1">
                      {asset.name}
                    </div>
                    {asset.serialNumber && (
                      <div className="text-[10px] text-slate-500 font-mono">
                        S/N: {asset.serialNumber}
                      </div>
                    )}
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                      {asset.category}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={asset.status} />
                  </td>

                  {/* Assignee & Dept */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-200">{asset.assignee}</div>
                    <div className="text-[10px] text-slate-400">{asset.department}</div>
                  </td>

                  {/* Value */}
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-100 whitespace-nowrap">
                    {formatVND(asset.value)}
                  </td>

                  {/* Purchase Date */}
                  <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                    {asset.purchaseDate}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => onView(asset)}
                        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onEdit(asset)}
                        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-amber-300 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDelete(asset.id)}
                        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                        title="Xóa tài sản"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="bg-slate-950/60 px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>
          Tổng giá trị nhóm hiển thị:{' '}
          <strong className="text-white font-bold">{formatVND(totalValue)}</strong>
        </span>
        <span>Hệ thống Quản lý tài sản JGA Admin Dashboard</span>
      </div>
    </div>
  )
}
