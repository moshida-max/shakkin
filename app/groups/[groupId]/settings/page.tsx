'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { MOCK_GROUPS, MOCK_MEMBERSHIPS, MOCK_USER } from '@/lib/mock-data'

function getUnit(name: string) {
  if (/プランク|秒/.test(name)) return '秒'
  if (/ランニング|km|マラソン|走/.test(name)) return 'km'
  return '回'
}

export default function GroupSettingsPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const router      = useRouter()

  const group      = MOCK_GROUPS.find(g => g.id === groupId) ?? MOCK_GROUPS[0]
  const membership = MOCK_MEMBERSHIPS.find(m => m.group_id === group.id && m.user_id === MOCK_USER.id)
  const isCreator  = group.created_by === MOCK_USER.id
  const unit       = getUnit(group.exercise_name)

  const [initialReps, setInitialReps] = useState(membership?.initial_reps ?? 10)
  const [repsSaved,   setRepsSaved]   = useState(false)

  const [showLeave,  setShowLeave]  = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const handleSaveReps = () => {
    // TODO: supabase.from('memberships').update({ initial_reps: initialReps }).eq('id', membership.id)
    setRepsSaved(true)
    setTimeout(() => setRepsSaved(false), 2000)
  }

  const handleLeave = () => {
    // TODO: supabase.from('memberships').delete().eq('id', membership.id)
    router.replace('/home')
  }

  const handleDelete = () => {
    // TODO: supabase.from('groups').delete().eq('id', group.id)
    router.replace('/home')
  }

  return (
    <div className="min-h-screen bg-app-pink flex flex-col">

      {/* ヘッダー */}
      <div className="pt-safe px-5 pb-5">
        <button onClick={() => router.back()} className="text-app-navy/60 font-bold text-sm mb-3 block">
          ← もどる
        </button>
        <div className="app-pill-title text-xl mb-1">{group.name}</div>
        <div className="text-app-navy/60 text-sm font-bold">グループ設定</div>
      </div>

      <div className="flex-1 px-4 pb-16 space-y-4">

        {/* ── 初期回数の修正 ── */}
        <div className="app-card p-5">
          <div className="font-bold text-app-navy text-base mb-0.5">自分の初期回数を変更</div>
          <div className="text-gray-400 text-xs font-bold mb-5">
            1日目のノルマ。毎日 1{unit} ずつ自動で増えます。過去のノルマ計算は変わりません。
          </div>

          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setInitialReps(v => Math.max(1, v - 1))}
              className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-600 text-xl font-bold active:scale-90 transition-transform"
            >−</button>
            <div className="flex-1 flex items-center gap-2 justify-center">
              <input
                type="number"
                value={initialReps}
                onChange={e => setInitialReps(Math.max(1, Math.min(9999, Number(e.target.value))))}
                min={1}
                max={9999}
                className="w-24 text-center text-4xl font-bold text-app-navy bg-transparent focus:outline-none"
              />
              <span className="text-gray-400 font-bold text-lg">{unit}</span>
            </div>
            <button
              onClick={() => setInitialReps(v => Math.min(9999, v + 1))}
              className="w-12 h-12 rounded-2xl bg-app-navy text-white text-xl font-bold active:scale-90 transition-transform"
            >＋</button>
          </div>

          <button
            onClick={handleSaveReps}
            className={`w-full rounded-2xl py-4 font-bold text-base transition-all active:scale-95 ${
              repsSaved ? 'bg-app-green text-white' : 'bg-app-navy text-white'
            }`}
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
          >
            {repsSaved ? '✅ 保存しました' : '保存する'}
          </button>
        </div>

        {/* ── グループ退会 ── */}
        <div className="app-card p-5">
          <div className="font-bold text-app-navy text-base mb-0.5">グループを退会する</div>
          <div className="text-gray-400 text-xs font-bold mb-4">
            退会すると、このグループでの記録データが削除されます。
          </div>
          <button
            onClick={() => setShowLeave(true)}
            className="w-full rounded-2xl py-4 font-bold text-base text-app-red bg-app-red/8 active:scale-95 transition-all"
          >
            退会する
          </button>
        </div>

        {/* ── グループ削除（作成者のみ）── */}
        {isCreator && (
          <div className="app-card p-5 border border-app-red/20">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-app-red font-bold text-base">グループを削除する</span>
              <span className="text-[10px] bg-app-red/10 text-app-red rounded-full px-2 py-0.5 font-bold">作成者のみ</span>
            </div>
            <div className="text-gray-400 text-xs font-bold mb-4">
              全メンバーの記録が完全に削除されます。この操作は取り消せません。
            </div>
            <button
              onClick={() => setShowDelete(true)}
              className="w-full rounded-2xl py-4 font-bold text-base bg-app-red text-white active:scale-95 transition-all"
              style={{ boxShadow: '0 4px 16px rgba(255,92,92,0.25)' }}
            >
              グループを削除する
            </button>
          </div>
        )}
      </div>

      {/* ── 退会確認モーダル ── */}
      {showLeave && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => setShowLeave(false)}>
          <div
            className="w-full max-w-[390px] mx-auto bg-white rounded-t-3xl p-6 pb-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />
            <div className="font-bold text-app-navy text-lg mb-2">退会しますか？</div>
            <div className="text-gray-400 text-sm font-bold mb-1">グループ：{group.name}</div>
            <div className="text-gray-400 text-sm mb-6">
              退会するとこのグループでの記録が削除されます。
            </div>
            <button
              onClick={handleLeave}
              className="w-full rounded-2xl py-4 bg-app-red text-white font-bold text-base active:scale-95 transition-all mb-2"
            >
              退会する
            </button>
            <button onClick={() => setShowLeave(false)} className="w-full py-3 font-bold text-gray-400 text-sm">
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* ── 削除確認モーダル ── */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => setShowDelete(false)}>
          <div
            className="w-full max-w-[390px] mx-auto bg-white rounded-t-3xl p-6 pb-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />
            <div className="font-bold text-app-red text-lg mb-2">グループを削除しますか？</div>
            <div className="text-gray-400 text-sm mb-2">
              「{group.name}」の全メンバーの記録が完全に削除されます。
            </div>
            <div className="bg-app-red/8 rounded-2xl px-4 py-3 mb-6">
              <div className="text-app-red font-bold text-xs">⚠️ この操作は取り消せません</div>
            </div>
            <button
              onClick={handleDelete}
              className="w-full rounded-2xl py-4 bg-app-red text-white font-bold text-base active:scale-95 transition-all mb-2"
              style={{ boxShadow: '0 4px 16px rgba(255,92,92,0.3)' }}
            >
              完全に削除する
            </button>
            <button onClick={() => setShowDelete(false)} className="w-full py-3 font-bold text-gray-400 text-sm">
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
