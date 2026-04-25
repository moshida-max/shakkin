'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MOCK_GROUP_STATS, MOCK_MEMBERSHIPS } from '@/lib/mock-data'
import BottomNav from '@/components/BottomNav'

const AVATAR_COLORS = ['#FFCD3C', '#FF8FAD', '#74B9FF', '#5EC462', '#A29BFE', '#4ECDC4']

export default function ProfilePage() {
  const router = useRouter()
  const [avatar, setAvatar] = useState('')
  const [name,   setName]   = useState('あきまる')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kk_profile')
      if (saved) {
        const p = JSON.parse(saved)
        if (p.name)   setName(p.name)
        if (p.avatar) setAvatar(p.avatar)
        else          setAvatar(p.name?.[0] ?? 'あ')
      } else {
        setAvatar('あ')
      }
    } catch { setAvatar('あ') }
  }, [])

  const displayAvatar = avatar || name[0] || '?'
  const myMems    = MOCK_MEMBERSHIPS.filter(m => m.user_id === 'user-1')

  return (
    <div className="min-h-screen bg-app-pink flex flex-col">

      {/* ヘッダー */}
      <div className="pt-safe px-5 pb-5">
        <div className="app-pill-title text-sm mb-4">マイページ</div>

        {/* プロフィールカード */}
        <div className="app-card p-5 flex items-center gap-4">
          <div className="w-20 h-20 rounded-3xl bg-app-yellow flex items-center justify-center shrink-0 text-3xl font-bold text-app-navy"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
            {displayAvatar}
          </div>
          <div className="flex-1">
            <div className="font-bold text-app-navy text-2xl">{name}</div>
            <div className="text-gray-400 text-sm font-bold">{myMems.length}グループ参加中</div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pb-28 space-y-4">

        {/* 参加グループ */}
        <div>
          <div className="app-pill-title text-sm mb-3">参加グループ</div>
          <div className="space-y-2">
            {MOCK_GROUP_STATS.map(({ group, myStats }, i) => (
              <div key={group.id} className="app-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold text-white text-base"
                  style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                  {group.name[0]}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-app-navy text-sm">{group.name}</div>
                  <div className="text-gray-400 text-xs font-bold">{group.exercise_name}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-app-navy text-xl">{myStats.totalReps}</div>
                  <div className="text-gray-400 text-xs font-bold">総回数</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ログアウト */}
        <button
          onClick={() => {
            // TODO: supabase.auth.signOut()
            router.push('/login')
          }}
          className="w-full rounded-2xl py-4 font-bold text-gray-400 bg-white text-sm active:scale-95 transition-all"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
        >
          ログアウト
        </button>
      </div>

      <BottomNav active="profile" />
    </div>
  )
}
