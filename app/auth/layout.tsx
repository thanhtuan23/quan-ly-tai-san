import React from 'react'
import Link from 'next/link'
import { Building2, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decor Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-5xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 z-10">
        
        {/* Left Side: Brand Highlight Banner */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900/80 via-slate-900 to-slate-950 p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative">
          <div>
            {/* Logo Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                  Hệ thống Quản lý tài sản
                </h1>
                <p className="text-xs text-indigo-300/80 font-medium">Hệ thống Quản lý tài sản</p>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="mt-8 space-y-6">
              {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> JGA 2026
              </div> */}

              <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight">
                Quản lý tài sản tập trung & minh bạch
              </h2>

              <p className="text-slate-400 text-sm leading-relaxed">
                Theo dõi chi tiết cấp phát, bảo trì, khấu hao và vòng đời tài sản toàn doanh nghiệp với dữ liệu thời gian thực.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-slate-300 text-xs">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Cấp phát & thu hồi tài sản trong 1 click</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300 text-xs">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Theo dõi lịch sử bảo trì & giá trị còn lại</span>
                </div>
                {/* <div className="flex items-center gap-3 text-slate-300 text-xs">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Tích hợp Google OAuth & Bảo mật Supabase Auth</span>
                </div> */}
              </div>
            </div>
          </div>

          {/* Quick Admin Direct Link */}
          {/* <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Dành cho Quản trị viên</span>
            <Link 
              href="/admin" 
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 group transition-colors"
            >
              Vào trang Admin <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div> */}
        </div>

        {/* Right Side: Authentication Forms (Injected via Children) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-slate-900/60">
          {children}
        </div>
      </div>
    </div>
  )
}