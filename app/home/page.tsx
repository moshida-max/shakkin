'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  MOCK_GROUP_STATS,
  MOCK_MEMBER_STATS,
  MOCK_MEMBERSHIPS,
  MOCK_REP_ENTRIES,
} from '@/lib/mock-data'
import ExerciseCharacter from '@/components/ExerciseCharacter'

// メンバーごとの絵文字アイコン（モック）
const MEMBER_EMOJI: Record<string, string> = {
  'user-1': '💪',
  'user-2': '🔥',
  'user-3': '🌸',
  'user-4': '⚡',
}

const AVATAR_OPTIONS = [
  '💪','🔥','⚡','🌸','🦁','🐯','🦊','🐻',
  '🎯','👊','🥊','🏃','🌟','🍎','🐲','🦅',
]

const AVATAR_COLORS: Record<string, string> = {
  'user-1': '#FFCD3C',
  'user-2': '#FF8FAD',
  'user-3': '#74B9FF',
  'user-4': '#5EC462',
}

export default function HomePage() {
  const [avatar, setAvatar]           = useState('💪')
  const [name, setName]               = useState('あきまる')
  const [editingName, setEditingName] = useState(false)
  const [editDraft, setEditDraft]     = useState('')
  const [showPicker, setShowPicker]   = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kk_profile')
      if (saved) {
        const p = JSON.parse(saved)
        if (p.name)   setName(p.name)
        // avatar未設定なら名前の先頭文字をデフォルトに
        setAvatar(p.avatar || p.name?.[0] || 'あ')
      } else {
        setAvatar('あ')
      }
    } catch { setAvatar('あ') }
  }, [])

  const save = (a: string, n: string) => {
    localStorage.setItem('kk_profile', JSON.stringify({ avatar: a, name: n }))
  }

  const selectAvatar = (emoji: string) => {
    setAvatar(emoji)
    setShowPicker(false)
    save(emoji, name)
  }

  const startEditName = () => {
    setEditDraft(name)
    setEditingName(true)
  }

  const commitName = () => {
    const trimmed = editDraft.trim()
    if (trimmed) {
      setName(trimmed)
      // アバターが絵文字(emoji)でなく1文字 or デフォルト状態なら先頭文字を追従させる
      const isInitialChar = avatar.length === 1 && avatar.charCodeAt(0) < 0x1F000
      const newAvatar = isInitialChar ? trimmed[0] : avatar
      setAvatar(newAvatar)
      save(newAvatar, trimmed)
    }
    setEditingName(false)
  }

  const groups    = MOCK_GROUP_STATS
  const myMems    = MOCK_MEMBERSHIPS.filter(m => m.user_id === 'user-1')
  const totalReps = MOCK_REP_ENTRIES
    .filter(e => myMems.some(m => m.id === e.membership_id))
    .reduce((s, e) => s + e.reps, 0)
  const totalDebt    = groups.reduce((s, g) => s + g.myStats.approxDebt,    0)
  const totalSavings = groups.reduce((s, g) => s + g.myStats.approxSavings, 0)

  return (
    <div className="min-h-screen bg-app-yellow flex flex-col">

      {/* ── プロフィールカード ── */}
      <div className="pt-safe px-4 pb-0">
        <div className="app-card p-4 mb-4">

          {/* アイコン + 名前 */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setShowPicker(true)}
              className="w-16 h-16 rounded-2xl bg-app-yellow flex items-center justify-center text-3xl shrink-0 active:scale-95 transition-transform relative"
            >
              {avatar}
              <span className="absolute bottom-0.5 right-0.5 text-[10px] bg-white rounded-full w-4 h-4 flex items-center justify-center shadow text-gray-500">
                ✏
              </span>
            </button>

            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    value={editDraft}
                    onChange={e => setEditDraft(e.target.value)}
                    onBlur={commitName}
                    onKeyDown={e => e.key === 'Enter' && commitName()}
                    autoFocus
                    className="flex-1 text-xl font-bold text-app-navy bg-app-gray rounded-xl px-3 py-1 focus:outline-none min-w-0"
                  />
                  <button onClick={commitName} className="text-app-green font-bold text-sm shrink-0">
                    完了
                  </button>
                </div>
              ) : (
                <button onClick={startEditName} className="text-left w-full">
                  <div className="font-bold text-app-navy text-xl leading-tight">{name}</div>
                  <div className="text-gray-400 text-xs font-bold mt-0.5">タップして名前を変更</div>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── グループ一覧 ── */}
      <div className="flex-1 px-4 pb-10 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-bold text-app-navy text-sm">参加中のグループ</span>
          <Link href="/groups/new" className="app-btn-dark text-xs px-3 py-2">
            ＋ 作る
          </Link>
        </div>

        {groups.map(({ group, myStats }) => {
          const members = MOCK_MEMBER_STATS[group.id] ?? []
          const progress = myStats.todayNorm > 0
            ? Math.min(100, (myStats.todayReps / myStats.todayNorm) * 100)
            : 0
          const isCleared     = myStats.status === 'cleared'
          const isBlacklisted = myStats.status === 'blacklisted'

          return (
            <Link key={group.id} href={`/groups/${group.id}`} className="block">
              <div className="app-card overflow-hidden">

                {/* 上部: グループ名 + キャラ + メンバーアイコン */}
                <div className="px-4 pt-3 pb-3 bg-gray-50 relative overflow-hidden">
                  {/* キャラクター (右上) */}
                  <div className="absolute top-0 right-3 opacity-90" style={{ color: '#1A1A2E' }}>
                    <ExerciseCharacter
                      exercise={group.exercise_name}
                      status={myStats.todayReps === 0 ? 'sleeping' : isCleared ? 'cleared' : 'working'}
                      size={72}
                    />
                  </div>
                  <div className="flex items-start justify-between gap-2 pr-16">
                    <div>
                      <div className="font-bold text-app-navy text-lg leading-tight">{group.name}</div>
                      <div className="text-gray-400 text-sm font-bold">{group.exercise_name}</div>
                    </div>
                    {isCleared && (
                      <span className="app-tag bg-app-green text-white text-xs shrink-0">返済！</span>
                    )}
                    {isBlacklisted && (
                      <span className="app-tag bg-app-red text-white text-xs shrink-0">ブラック</span>
                    )}
                  </div>

                  {/* メンバーアイコン */}
                  <div className="flex items-center mt-2.5">
                    {members.slice(0, 6).map((ms, i) => (
                      <div
                        key={ms.user.id}
                        title={ms.user.name}
                        className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-base shrink-0"
                        style={{
                          background: AVATAR_COLORS[ms.user.id] ?? '#E5E7EB',
                          marginLeft: i === 0 ? 0 : -8,
                          zIndex: 10 - i,
                        }}
                      >
                        {MEMBER_EMOJI[ms.user.id] ?? '👤'}
                      </div>
                    ))}
                    {members.length > 6 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500"
                        style={{ marginLeft: -8, zIndex: 3 }}>
                        +{members.length - 6}
                      </div>
                    )}
                  </div>
                </div>

                {/* 下部: 回数 + バー + スタッツ */}
                <div className="px-4 py-3">
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold text-app-navy">{myStats.todayReps}</span>
                    <span className="text-sm text-gray-400 font-bold">/ {myStats.todayNorm} 回</span>
                  </div>

                  <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                        background: isCleared ? '#5EC462' : '#FFCD3C',
                      }}
                    />
                  </div>

                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="font-bold text-app-red">{myStats.approxDebt}</span>
                      <span className="text-gray-400 font-bold text-xs ml-0.5">借筋</span>
                    </div>
                    <div>
                      <span className="font-bold text-app-green">{myStats.approxSavings}</span>
                      <span className="text-gray-400 font-bold text-xs ml-0.5">友情</span>
                    </div>
                    <div>
                      <span className="font-bold text-app-blue">{myStats.totalReps}</span>
                      <span className="text-gray-400 font-bold text-xs ml-0.5">総回数</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}

        {groups.length === 0 && (
          <div className="app-card p-10 text-center">
            <p className="font-bold text-app-navy text-lg">まだグループがない！</p>
            <p className="text-gray-400 text-sm mt-1">グループを作って仲間と一緒に鍛えよう</p>
            <Link href="/groups/new" className="inline-block mt-5 app-btn-dark px-8 py-3 text-sm">
              グループを作る
            </Link>
          </div>
        )}
      </div>

      {/* ── アバターピッカー ── */}
      {showPicker && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end"
          onClick={() => setShowPicker(false)}
        >
          <div
            className="w-full max-w-[390px] mx-auto bg-white rounded-t-3xl p-5 pb-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4" />
            <div className="font-bold text-app-navy text-base mb-4">アイコンを選ぶ</div>
            <div className="grid grid-cols-8 gap-2">
              {AVATAR_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => selectAvatar(emoji)}
                  className={`h-11 rounded-2xl text-2xl flex items-center justify-center transition-all active:scale-90 ${
                    avatar === emoji ? 'bg-app-yellow scale-110 shadow' : 'bg-gray-50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
