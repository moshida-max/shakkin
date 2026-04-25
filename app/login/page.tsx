'use client'
import { useRouter } from 'next/navigation'
import StickFigure from '@/components/StickFigure'

export default function LoginPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-app-yellow flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* 背景の丸装飾 */}
      <div className="absolute top-[-80px] right-[-60px] w-64 h-64 rounded-full bg-white/20" />
      <div className="absolute bottom-[-40px] left-[-50px] w-48 h-48 rounded-full bg-white/20" />

      {/* ロゴ＋タイトル */}
      <div className="text-center mb-8 z-10">
        <div className="app-pill-title text-3xl mb-6 mx-auto">
          🏋️ 借筋
        </div>
        <div className="app-card p-6 max-w-xs mx-auto">
          <div className="flex justify-center mb-4">
            <StickFigure pose="workout" size={80} color="#1A1A2E" />
          </div>
          <p className="font-bold text-app-navy text-lg text-center">
            筋トレで友情を積み上げろ
          </p>
          <p className="text-gray-400 text-sm text-center mt-1">
            サボると借筋が増えるよ…
          </p>
        </div>
      </div>

      {/* ログインボタン */}
      <div className="z-10 w-full max-w-xs space-y-3">
        <button
          onClick={() => {
            // TODO: supabase.auth.signInWithOAuth({ provider: 'google' })
            router.push('/home')
          }}
          className="app-btn-dark w-full py-4 text-base"
        >
          <GoogleIcon />
          Googleでログイン
        </button>

        <button
          onClick={() => router.push('/home')}
          className="w-full text-center text-app-navy/50 text-sm py-2 font-bold"
        >
          デモで見る（認証スキップ）
        </button>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      <path d="M21.6 11.25c0-.75-.07-1.5-.2-2.2H11v4.16h5.93a5.07 5.07 0 01-2.2 3.32v2.76h3.55C20.38 17.38 21.6 14.55 21.6 11.25z" fill="#4285F4"/>
      <path d="M11 22c2.97 0 5.46-.98 7.28-2.67l-3.55-2.76c-.98.66-2.24 1.06-3.73 1.06-2.87 0-5.3-1.94-6.17-4.55H1.17v2.85A11 11 0 0011 22z" fill="#34A853"/>
      <path d="M4.83 13.08A6.62 6.62 0 014.5 11c0-.72.13-1.41.33-2.08V6.07H1.17A11 11 0 000 11c0 1.8.43 3.5 1.17 5.03l3.66-2.95z" fill="#FBBC05"/>
      <path d="M11 4.37c1.62 0 3.07.56 4.21 1.66l3.16-3.16C16.46.99 13.97 0 11 0 6.7 0 2.99 2.35 1.17 5.97l3.66 2.95C5.7 6.3 8.13 4.37 11 4.37z" fill="#EA4335"/>
    </svg>
  )
}
