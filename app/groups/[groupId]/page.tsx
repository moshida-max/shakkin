'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { MOCK_GROUPS, MOCK_MEMBER_STATS, MOCK_USER } from '@/lib/mock-data'
import StatusBadge from '@/components/StatusBadge'
import ExerciseCharacter from '@/components/ExerciseCharacter'

const CARD_COLORS = ['#74B9FF', '#5EC462', '#FFCD3C', '#FF8FAD', '#A29BFE', '#4ECDC4']

export default function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const router = useRouter()
  const [showInvite, setShowInvite] = useState(false)
  const [copied,     setCopied]     = useState(false)

  const group   = MOCK_GROUPS.find(g => g.id === groupId) ?? MOCK_GROUPS[0]
  const members = MOCK_MEMBER_STATS[group.id] ?? []
  const myStats = members.find(m => m.user.id === MOCK_USER.id)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(group.invite_code).catch(() => {})
    setCopied(true)
    setTimeout(() => { setCopied(false); setShowInvite(false) }, 1500)
  }

  return (
    <div className="min-h-screen bg-app-pink flex flex-col">

      {/* ── ヘッダー ── */}
      <div className="pt-safe px-5 pb-4">
        <button onClick={() => router.back()} className="text-app-navy/60 font-bold text-sm mb-3 block">
          ← もどる
        </button>
        <div className="flex items-center gap-2 mb-1">
          <div className="app-pill-title text-xl flex-1 min-w-0 truncate">{group.name}</div>
          <button
            onClick={() => setShowInvite(true)}
            className="shrink-0 bg-white rounded-full px-3 py-1.5 flex items-center gap-1.5 font-bold text-app-navy text-xs active:scale-95 transition-transform"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          >
            🔗 招待
          </button>
          <Link
            href={`/groups/${group.id}/settings`}
            className="shrink-0 bg-white rounded-full w-9 h-9 flex items-center justify-center text-app-navy/60 active:scale-95 transition-transform"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          >
            ⚙
          </Link>
        </div>
        <div className="text-app-navy/60 text-sm font-bold mb-3">{group.exercise_name}</div>

        {/* 記録履歴ボタン */}
        <Link href={`/groups/${group.id}/history`}>
          <div className="app-card px-4 py-3 flex items-center justify-between active:opacity-75 transition-opacity">
            <div>
              <div className="font-bold text-app-navy text-sm">全員の記録履歴・編集</div>
              <div className="text-gray-400 text-xs font-bold">過去の記録追加・修正もここから</div>
            </div>
            <span className="text-app-navy text-lg">›</span>
          </div>
        </Link>
      </div>

      {/* ── 自分のアクションカード ── */}
      {myStats && (
        <div className="px-4 mb-4">
          <Link href={`/reps/${myStats.membership.id}`}>
            <div className="app-card p-4 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden ${
                myStats.status === 'cleared' ? 'bg-app-green/20' : 'bg-app-yellow/60'
              }`} style={{ color: '#1A1A2E' }}>
                <ExerciseCharacter
                  exercise={group.exercise_name}
                  status={myStats.todayReps === 0 ? 'sleeping' : myStats.status === 'cleared' ? 'cleared' : 'working'}
                  size={52}
                />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-400 font-bold">今日の記録</div>
                <div className="font-bold text-app-navy text-xl">
                  {myStats.todayReps}
                  <span className="text-sm text-gray-400"> / {myStats.todayNorm} 回</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={myStats.status} size="sm" />
                <span className="text-gray-400 text-xs font-bold">タップして入力 ›</span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* ── メンバー 2列グリッド ── */}
      <div className="flex-1 px-4 pb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="app-pill-title text-sm">メンバー</span>
          <span className="app-tag bg-white/60 text-app-navy text-xs font-bold">{members.length}人</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {members.map((ms, idx) => {
            const cardColor = CARD_COLORS[idx % CARD_COLORS.length]
            const isMe      = ms.user.id === MOCK_USER.id
            const progress  = ms.todayNorm > 0 ? Math.min(100, (ms.todayReps / ms.todayNorm) * 100) : 0

            const charStatus = ms.todayReps === 0 ? 'sleeping' : ms.status === 'cleared' ? 'cleared' : 'working'

            return (
              <div key={ms.membership.id} className="app-card overflow-hidden">

                {/* カラーヘッダー */}
                <div className="px-3 pt-2 pb-1 relative" style={{ background: cardColor }}>
                  {isMe && (
                    <span className="absolute top-2 right-2 text-[9px] bg-white/40 text-white rounded-full px-1.5 py-0.5 font-bold">
                      自分
                    </span>
                  )}
                  <div className="flex justify-center" style={{ color: '#1A1A2E' }}>
                    <ExerciseCharacter exercise={group.exercise_name} status={charStatus} size={64} />
                  </div>
                  <div className="text-center font-bold text-white text-sm leading-tight truncate">
                    {ms.user.name}
                  </div>
                  <div className="text-center text-white/70 text-[10px] font-bold mb-1">
                    {ms.membership.consecutive_clear_days}日連続
                  </div>
                </div>

                {/* 白エリア */}
                <div className="px-3 py-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="font-bold text-app-navy text-xl">{ms.todayReps}</span>
                      <span className="text-gray-400 text-xs font-bold">/{ms.todayNorm}</span>
                    </div>
                    <StatusBadge status={ms.status} size="sm" />
                  </div>

                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-2">
                    <div className="h-full rounded-full"
                      style={{
                        width: `${progress}%`,
                        background: ms.status === 'cleared' ? '#5EC462' : cardColor,
                      }} />
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-center">
                    <div>
                      <div className="font-bold text-app-red text-sm">{ms.approxDebt}</div>
                      <div className="text-[9px] text-gray-400 font-bold">借筋</div>
                    </div>
                    <div>
                      <div className="font-bold text-app-green text-sm">{ms.approxSavings}</div>
                      <div className="text-[9px] text-gray-400 font-bold">友情</div>
                    </div>
                    <div>
                      <div className="font-bold text-app-blue text-sm">{ms.totalReps}</div>
                      <div className="text-[9px] text-gray-400 font-bold">総回数</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 招待モーダル ── */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => setShowInvite(false)}>
          <div className="w-full max-w-[390px] mx-auto bg-white rounded-t-3xl p-6 pb-10"
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />
            <div className="font-bold text-app-navy text-lg mb-1">招待リンクをコピーしますか？</div>
            <div className="text-gray-400 text-sm mb-5">以下のコードを仲間に共有しよう</div>
            <div className="bg-app-gray rounded-2xl px-5 py-4 text-center mb-5">
              <div className="font-bold text-app-navy text-3xl tracking-[0.4em]">{group.invite_code}</div>
            </div>
            <button onClick={handleCopy}
              className={`w-full rounded-2xl py-4 font-bold text-base transition-all mb-2 ${
                copied ? 'bg-app-green text-white' : 'bg-app-navy text-white active:scale-95'
              }`}
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
              {copied ? '✅ コピーしました！' : '📋 コードをコピーする'}
            </button>
            <button onClick={() => setShowInvite(false)}
              className="w-full py-3 font-bold text-gray-400 text-sm">
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
