'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Check,
  X
} from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  // Form states
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // UX states
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [isSessionChecking, setIsSessionChecking] = useState(true)
  const [hasValidSession, setHasValidSession] = useState(false)

  // Lắng nghe auth state và kiểm tra phiên đặt lại mật khẩu từ Supabase
  useEffect(() => {
    let mounted = true

    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted) {
          if (session) {
            setHasValidSession(true)
          }
          setIsSessionChecking(false)
        }
      } catch (err) {
        if (mounted) {
          setIsSessionChecking(false)
        }
      }
    }

    checkInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        if (mounted) {
          setHasValidSession(true)
          setIsSessionChecking(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  // Đếm ngược tự động chuyển hướng khi thành công
  useEffect(() => {
    if (!isSuccess) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/auth/login')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isSuccess, router])

  // Tiêu chí bảo mật mật khẩu
  const rules = {
    minLength: password.length >= 6,
    hasNumber: /\d/.test(password),
    hasLetter: /[a-zA-Z]/.test(password),
    isMatched: password.length > 0 && password === confirmPassword
  }

  const isFormValid = rules.minLength && rules.hasNumber && rules.hasLetter && rules.isMatched

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!rules.minLength) {
      setMessage({ type: 'error', text: 'Mật khẩu phải chứa ít nhất 6 ký tự' })
      return
    }

    if (!rules.hasNumber || !rules.hasLetter) {
      setMessage({ type: 'error', text: 'Mật khẩu phải bao gồm cả chữ cái và số' })
      return
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp' })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        throw error
      }

      setIsSuccess(true)
      setMessage({
        type: 'success',
        text: 'Mật khẩu mới đã được cập nhật thành công!'
      })
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Không thể đổi mật khẩu. Liên kết có thể đã hết hạn, vui lòng gửi lại yêu cầu.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto py-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-400" />
            Khôi phục mật khẩu
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Thiết lập mật khẩu an toàn mới cho tài khoản
          </p>
        </div>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Đăng nhập</span>
        </Link>
      </div>

      {/* Thông báo Alert */}
      {message && (
        <div
          className={`p-3.5 rounded-2xl mb-5 flex items-start gap-3 border text-xs leading-relaxed animate-in fade-in duration-200 ${
            message.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
          }`}
        >
          {message.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Màn hình thành công */}
      {isSuccess ? (
        <div className="bg-slate-950/60 border border-slate-800 p-6 sm:p-8 rounded-3xl text-center space-y-5 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-1.5">Đã cập nhật mật khẩu!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Bạn có thể sử dụng mật khẩu mới này để đăng nhập ngay bây giờ. Hệ thống sẽ tự động chuyển hướng sau{' '}
              <span className="font-bold text-indigo-400 font-mono">{countdown}s</span>...
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.99]"
            >
              <span>Đăng nhập ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Form Đặt lại mật khẩu */
        <form onSubmit={handleResetPassword} className="space-y-4">
          {/* Mật khẩu mới */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mật khẩu mới <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Xác nhận mật khẩu mới <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Tiêu chí mật khẩu trực quan */}
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2 text-[11px]">
            <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider">
              Yêu cầu bảo mật:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <div className="flex items-center gap-1.5">
                {rules.minLength ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
                <span className={rules.minLength ? 'text-emerald-300' : 'text-slate-500'}>
                  Tối thiểu 6 ký tự
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {rules.hasLetter && rules.hasNumber ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
                <span className={rules.hasLetter && rules.hasNumber ? 'text-emerald-300' : 'text-slate-500'}>
                  Bao gồm cả chữ & số
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:col-span-2">
                {rules.isMatched ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
                <span className={rules.isMatched ? 'text-emerald-300' : 'text-slate-500'}>
                  Mật khẩu xác nhận trùng khớp
                </span>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:shadow-indigo-600/40 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 pt-3"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Cập nhật mật khẩu mới</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quay lại trang đăng nhập */}
          <div className="text-center pt-2">
            <Link
              href="/auth/login"
              className="text-xs text-slate-400 hover:text-indigo-400 font-medium transition-colors"
            >
              Hủy bỏ & quay lại Đăng nhập
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
