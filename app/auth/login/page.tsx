'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  UserPlus
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  // Common UX state
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

  const supabase = createClient()

  const isSupabaseConfigured = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    return (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('your_supabase_project_url')
  }

  // Google OAuth Handler
  const handleGoogleLogin = async () => {
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
            text: 'Đang chuyển hướng với Google Demo Auth... (Chưa cấu hình Supabase URL thực tế)'
          })
          setTimeout(() => {
            router.push('/admin')
          }, 1200)
        }, 800)
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Đã xảy ra lỗi khi đăng nhập bằng Google'
      })
      setLoading(false)
    }
  }

  // Email / Password Login Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (!loginEmail || !loginPassword) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ Email và Mật khẩu' })
      setLoading(false)
      return
    }

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPassword,
        })
        if (error) throw error
        setMessage({ type: 'success', text: 'Đăng nhập thành công! Đang chuyển hướng...' })
        setTimeout(() => router.push('/admin'), 1000)
      } else {
        // Demo Fallback Login
        setTimeout(() => {
          setMessage({ type: 'success', text: 'Đăng nhập thành công (Demo Mode)! Đang vào trang Admin...' })
          setTimeout(() => router.push('/admin'), 1000)
        }, 800)
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Email hoặc mật khẩu không chính xác' })
      setLoading(false)
    }
  }

  // Forgot Password Handler
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (!forgotEmail) {
      setMessage({ type: 'error', text: 'Vui lòng nhập Email của bạn' })
      setLoading(false)
      return
    }

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
          redirectTo: `${window.location.origin}/auth/login?reset=true`
        })
        if (error) throw error
      }
      setForgotSent(true)
      setMessage({
        type: 'success',
        text: 'Hướng dẫn khôi phục mật khẩu đã được gửi vào email của bạn.'
      })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Không thể gửi email khôi phục mật khẩu' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Header Title & Register Navigation Link */}
      {mode === 'login' && (
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-white">Đăng nhập</h2>
            <p className="text-xs text-slate-400 mt-0.5">Chào mừng bạn quay trở lại hệ thống</p>
          </div>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-400 hover:text-indigo-300 text-xs font-semibold border border-slate-700 hover:border-indigo-500/40 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Đăng ký tài khoản</span>
          </Link>
        </div>
      )}

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

      {/* Google Single Sign-On Button */}
      {mode === 'login' && (
        <div className="mb-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-100 rounded-2xl border border-slate-700 font-semibold text-xs flex items-center justify-center gap-3 transition-all hover:border-slate-600 active:scale-[0.99] disabled:opacity-50 shadow-sm"
          >
            {/* Official Google SVG Icon */}
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
            <span>Tiếp tục với Google</span>
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
      )}

      {/* LOGIN FORM */}
      {mode === 'login' && (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Địa chỉ Email <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@company.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Mật khẩu <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setMode('forgot')
                  setMessage(null)
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
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

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500/30"
              />
              <span>Ghi nhớ phiên đăng nhập</span>
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
                <span>Đăng nhập hệ thống</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-3">
            <span className="text-xs text-slate-400">
              Chưa có tài khoản?{' '}
              <Link href="/auth/register" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
                Đăng ký tài khoản mới
              </Link>
            </span>
          </div>
        </form>
      )}

      {/* FORGOT PASSWORD VIEW */}
      {mode === 'forgot' && (
        <div>
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setMessage(null)
              setForgotSent(false)
            }}
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white mb-6 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại Đăng nhập
          </button>

          <h2 className="text-xl font-bold text-white mb-2">Quên mật khẩu?</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Nhập địa chỉ email đăng ký của bạn. Chúng tôi sẽ gửi đường dẫn khôi phục mật khẩu trong giây lát.
          </p>

          {!forgotSent ? (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email khôi phục <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@company.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:shadow-indigo-600/40 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Gửi yêu cầu đặt lại mật khẩu</span>
                )}
              </button>
            </form>
          ) : (
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Chúng tôi đã gửi email hướng dẫn khôi phục mật khẩu đến{' '}
                <strong className="text-white">{forgotEmail}</strong>. Vui lòng kiểm tra hộp thư đến (và thư rác).
              </p>
              <button
                type="button"
                onClick={() => {
                  setForgotSent(false)
                  setMode('login')
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                Trở về màn hình Đăng nhập
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
