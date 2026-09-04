'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowLeft
} from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  
  // Register form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)

  // UX State
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

  const supabase = createClient()

  const isSupabaseConfigured = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    return (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('your_supabase_project_url')
  }

  // Google OAuth Register / Login
  const handleGoogleSignup = async () => {
    setLoading(true)
    setMessage(null)
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/admin`
          }
        })
        if (error) throw error
      } else {
        setTimeout(() => {
          setMessage({
            type: 'info',
            text: 'Đang đăng ký nhanh với Google Demo... (Chưa cấu hình Supabase URL thực tế)'
          })
          setTimeout(() => {
            router.push('/admin')
          }, 1200)
        }, 800)
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Đã xảy ra lỗi khi đăng ký bằng Google'
      })
      setLoading(false)
    }
  }

  // Register Submit Handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (!email || !password || !fullName) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ các thông tin bắt buộc (*)' })
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự' })
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không trùng khớp' })
      setLoading(false)
      return
    }

    if (!agreeTerms) {
      setMessage({ type: 'error', text: 'Vui lòng đồng ý với Quy định & Điều khoản dịch vụ' })
      setLoading(false)
      return
    }

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'user'
            }
          }
        })
        if (error) throw error
        setMessage({
          type: 'success',
          text: 'Đăng ký tài khoản thành công! Vui lòng kiểm tra email để kích hoạt.'
        })
      } else {
        // Demo Fallback
        setTimeout(() => {
          setMessage({
            type: 'success',
            text: 'Tạo tài khoản Demo thành công! Đang chuyển hướng vào hệ thống...'
          })
          setTimeout(() => router.push('/admin'), 1200)
        }, 800)
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Không thể tạo tài khoản. Vui lòng thử lại sau.'
      })
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-6">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white mb-4 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại Đăng nhập
        </Link>
        <h2 className="text-2xl font-bold text-white">Đăng ký tài khoản</h2>
        <p className="text-xs text-slate-400 mt-1">
          Nhập thông tin bên dưới để đăng ký tài khoản vào hệ thống
        </p>
      </div>

      {/* Feedback Message Alert */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-2xl border text-xs flex items-start gap-3 transition-all ${
            message.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
          }`}
        >
          {message.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed">{message.text}</span>
        </div>
      )}

      {/* Google Sign-up Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-100 rounded-2xl border border-slate-700 font-semibold text-xs flex items-center justify-center gap-3 transition-all hover:border-slate-600 active:scale-[0.99] disabled:opacity-50 shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Đăng ký nhanh bằng Google</span>
        </button>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative bg-slate-900 px-4 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
            Hoặc bằng Email
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleRegisterSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Họ và Tên <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Địa chỉ Email <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mật khẩu <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl py-3 pl-10 pr-10 text-xs text-white placeholder-slate-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Xác nhận mật khẩu <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-start gap-2 cursor-pointer select-none text-xs text-slate-400">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500/30 mt-0.5"
            />
            <span>Tôi đồng ý với quy định quản lý tài sản & điều khoản dịch vụ JGA</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:shadow-indigo-600/40 active:scale-[0.99] disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Đăng ký ngay</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <span className="text-xs text-slate-400">
            Bạn đã có tài khoản?{' '}
            <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
              Đăng nhập
            </Link>
          </span>
        </div>
      </form>
    </>
  )
}
