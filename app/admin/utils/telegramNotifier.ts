import { DailyInspectionLog } from '../types/inspection'
import { WarrantyReminder } from '../types/warranty'

export interface TelegramSendOptions {
  botToken: string
  chatId: string
  message: string
}

/**
 * Gửi tin nhắn tới Telegram Bot API
 */
export const sendTelegramMessage = async (options: TelegramSendOptions): Promise<{ success: boolean; error?: string }> => {
  const { botToken, chatId, message } = options
  if (!botToken || !chatId) {
    return { success: false, error: 'Chưa cấu hình Telegram Bot Token hoặc Chat ID' }
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    })

    const data = await res.json()
    if (!res.ok || !data.ok) {
      return { success: false, error: data.description || 'Lỗi gửi tin nhắn Telegram' }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi mạng khi kết nối Telegram API' }
  }
}

/**
 * Tạo nội dung thông báo kiểm tra thiết bị có vấn đề (Chập chờn / Hư hỏng)
 */
export const formatInspectionTelegramAlert = (log: DailyInspectionLog): string => {
  const isDamaged = log.healthStatus === 'damaged'
  const icon = isDamaged ? '🚨 [KHẨN CẤP: HƯ HỎNG THIẾT BỊ]' : '⚠️ [CẢNH BÁO: THIẾT BỊ CHẬP CHỜN]'
  const statusText = isDamaged ? 'HƯ HỎNG / LỖI NẶNG' : 'CHẬP CHỜN / CÓ NGUY CƠ'

  return `
<b>${icon}</b>
━━━━━━━━━━━━━━━━━━━
📦 <b>Thiết bị:</b> ${log.deviceName}
🏷 <b>Mã SP / Model:</b> <code>${log.deviceCode}</code> (${log.model || 'N/A'})
🔢 <b>Serial Number:</b> <code>${log.serialNumber}</code>
${log.imei ? `📱 <b>IMEI:</b> <code>${log.imei}</code>\n` : ''}📍 <b>Vị trí:</b> ${log.location} - ${log.department}
━━━━━━━━━━━━━━━━━━━
⚡ <b>Tình trạng kiểm tra:</b> <b>${statusText}</b>
🛠 <b>Hạng mục lỗi:</b> ${log.issueCategory || 'Chung'}
📝 <b>Mô tả hiện tượng:</b> <i>${log.notes || 'Không có ghi chú thêm'}</i>
🎯 <b>Đề xuất kế hoạch:</b> <u>${log.actionRequired}</u>
━━━━━━━━━━━━━━━━━━━
👤 <b>Người kiểm tra:</b> ${log.checkedByName} (${log.checkedByRole.toUpperCase()})
⏰ <b>Thời gian:</b> ${log.checkTime} - Ngày ${log.checkDate}

<i>Hệ thống Quản lý Tài sản QLTS Pro</i>
`.trim()
}

/**
 * Tạo nội dung thông báo nhắc việc bảo hành quá hạn
 */
export const formatWarrantyTelegramAlert = (item: WarrantyReminder, daysElapsed: number): string => {
  return `
🚨 <b>[CẢNH BÁO QUÁ HẠN BẢO HÀNH NPP]</b>
━━━━━━━━━━━━━━━━━━━
📦 <b>Sản phẩm:</b> ${item.productName}
🏷 <b>Mã SP:</b> <code>${item.productCode}</code> | S/N: <code>${item.serialNumber}</code>
📍 <b>Nơi gửi về:</b> ${item.location}
🏢 <b>Nhà Phân Phối (NPP):</b> ${item.supplier}
━━━━━━━━━━━━━━━━━━━
⏳ <b>Thời gian đã gửi:</b> <b>${daysElapsed} ngày</b> (Quá hạn tiêu chuẩn &gt; 10 ngày)
${item.rmaCode ? `📑 <b>Mã phiếu RMA:</b> <code>${item.rmaCode}</code>\n` : ''}📝 <b>Ghi chú:</b> <i>${item.notes || 'NPP chưa hoàn trả thiết bị'}</i>
━━━━━━━━━━━━━━━━━━━
👉 <i>Quản trị viên vui lòng liên hệ ngay với NPP để hối thúc tiến độ!</i>
`.trim()
}
