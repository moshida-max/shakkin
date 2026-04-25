'use client'
import { useRouter } from 'next/navigation'
import ExerciseCharacter from '@/components/ExerciseCharacter'

export default function LoginPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-app-yellow flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* 背景装飾 */}
      <div className="absolute top-[-80px] right-[-60px] w-64 h-64 rounded-full bg-white/20" />
      <div className="absolute bottom-[-40px] left-[-50px] w-48 h-48 rounded-full bg-white/20" />

      <div className="z-10 text-center">
        {/* タイトル */}
        <div className="app-pill-title text-3xl mb-8 mx-auto">借筋</div>

        {/* キャラクター */}
        <div className="flex justify-center mb-6" style={{ color: '#1A1A2E' }}>
          <ExerciseCharacter exercise="腕立て伏せ" status="working" size={100} />
        </div>

        {/* キャッチコピー */}
        <p className="font-bold text-app-navy text-xl mb-2">筋トレで友情を積み上げろ</p>
        <p className="text-app-navy/50 text-sm font-bold mb-10">サボると借筋が増えるよ…</p>

        {/* はじめるボタン */}
        <button
          onClick={() => router.push('/home')}
          className="app-btn-dark px-12 py-5 text-lg"
          style={{ boxShadow: '0 6px 24px rgba(0,0,0,0.2)' }}
        >
          はじめる
        </button>
      </div>
    </div>
  )
}
