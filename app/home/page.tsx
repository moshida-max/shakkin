'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, getOrCreateUserId, getToday, syncProfile } from '@/lib/supabase'
import { todayNorm, sumReps, calcStatus, calcApproxStats } from '@/lib/logic'
import ExerciseCharacter from '@/components/ExerciseCharacter'
import type { Membership, MemberStats } from '@/lib/types'

const AVATAR_OPTIONS = [
  '💪','🔥','⚡','🌸','🦁','🐯','🦊','🐻',
  '🎯','👊','🥊','🏃','🌟','🍎','🐲','🦅',
]

export default function HomePage() {
  const [userId,      setUserId]      = useState('')
  const [avatar,      setAvatar]      = useState('あ')
  const [name,        setName]        = useState('名無し')
  const [editingName, setEditingName] = useState(false)
  const [editDraft,   setEditDraft]   = useState('')
  const [showPicker,  setShowPicker]  = useState(false)
  const [groups,      setGroups]      = useState<{ group: any; myStats: MemberStats }[]>([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    try {
      const uid = await getOrCreateUserId()
      setUserId(uid)

      // プロフィール読み込み
      const saved = localStorage.getItem('kk_profile')
      let pName = '名無し', pAvatar = 'あ'
      if (saved) {
        const p = JSON.parse(saved)
        pName   = p.name   || '名無し'
        pAvatar = p.avatar || p.name?.[0] || 'あ'
      }
      setName(pName)
      setAvatar(pAvatar)
      await syncProfile(uid, pName, pAvatar)

      await fetchGroups(uid)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  async function fetchGroups(uid: string) {
    const { data: mems } = await supabase
      .from('memberships')
      .select('*, groups(*)')
      .eq('user_id', uid)

    if (!mems || mems.length === 0) { setGroups([]); return }

    const memIds = mems.map(m => m.id)
    const { data: entries } = await supabase
      .from('rep_entries').select('*').in('membership_id', memIds)

    const allEntries = entries || []
    const TODAY = getToday()

    const stats = mems.map(mem => {
      const membership: Membership = {
        id: mem.id, user_id: mem.user_id, group_id: mem.group_id,
        initial_reps: mem.initial_reps, start_date: mem.start_date,
        state: mem.state, debt_balance: mem.debt_balance,
        savings_balance: mem.savings_balance,
        consecutive_clear_days: mem.consecutive_clear_days,
        total_cleared_reps: mem.total_cleared_reps || 0,
      }
      const myEntries = allEntries.filter(e => e.membership_id === mem.id)
      const norm       = todayNorm(membership, TODAY)
      const todayRepsCount = sumReps(myEntries, TODAY)
      const status     = calcStatus(membership, todayRepsCount, norm)
      const { approxDebt, approxSavings, totalReps } = calcApproxStats(membership, myEntries, TODAY)
      return {
        group: mem.groups,
        myStats: {
          membership, user: { id: uid, name, icon_url: null },
          todayNorm: norm, todayReps: todayRepsCount,
          status, approxDebt, approxSavings, totalReps,
        } as MemberStats,
      }
    })
    setGroups(stats)
  }

  const saveProfile = async (a: string, n: string) => {
    localStorage.setItem('kk_profile', JSON.stringify({ avatar: a, name: n }))
    if (userId) await syncProfile(userId, n, a)
  }

  const selectAvatar = (emoji: string) => {
    setAvatar(emoji); setShowPicker(false); saveProfile(emoji, name)
  }

  const commitName = () => {
    const t = editDraft.trim()
    if (t) {
      const isChar = avatar.length === 1 && avatar.charCodeAt(0) < 0x1F000
      const newAvatar = isChar ? t[0] : avatar
      setName(t); setAvatar(newAvatar); saveProfile(newAvatar, t)
    }
    setEditingName(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-app-yellow flex items-center justify-center">
        <div className="font-bold text-app-navy/40 text-lg animate-pulse">よみこみ中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-app-yellow flex flex-col">

      {/* プロフィールカード */}
      <div className="pt-safe px-4 pb-0">
        <div className="app-card p-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => setShowPicker(true)}
              className="w-16 h-16 rounded-2xl bg-app-yellow flex items-center justify-center text-3xl shrink-0 active:scale-95 transition-transform relative">
              {avatar}
              <span className="absolute bottom-0.5 right-0.5 text-[10px] bg-white rounded-full w-4 h-4 flex items-center justify-center shadow text-gray-500">✏</span>
            </button>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input value={editDraft} onChange={e => setEditDraft(e.target.value)}
                    onBlur={commitName} onKeyDown={e => e.key === 'Enter' && commitName()}
                    autoFocus
                    className="flex-1 text-xl font-bold text-app-navy bg-app-gray rounded-xl px-3 py-1 focus:outline-none min-w-0" />
                  <button onClick={commitName} className="text-app-green font-bold text-sm shrink-0">完了</button>
                </div>
              ) : (
                <button onClick={() => { setEditDraft(name); setEditingName(true) }} className="text-left w-full">
                  <div className="font-bold text-app-navy text-xl leading-tight">{name}</div>
                  <div className="text-gray-400 text-xs font-bold mt-0.5">タップして名前を変更</div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* グループ一覧 */}
      <div className="flex-1 px-4 pb-10 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-bold text-app-navy text-sm">参加中のグループ</span>
          <Link href="/groups/new" className="app-btn-dark text-xs px-3 py-2">＋ 作る</Link>
        </div>

        {groups.length === 0 && (
          <div className="app-card p-10 text-center">
            <p className="font-bold text-app-navy text-lg">まだグループがない！</p>
            <p className="text-gray-400 text-sm mt-1">グループを作って仲間と一緒に鍛えよう</p>
            <Link href="/groups/new" className="inline-block mt-5 app-btn-dark px-8 py-3 text-sm">グループを作る</Link>
          </div>
        )}

        {groups.map(({ group, myStats }) => {
          const progress = myStats.todayNorm > 0
            ? Math.min(100, (myStats.todayReps / myStats.todayNorm) * 100) : 0
          const isCleared     = myStats.status === 'cleared'
          const isBlacklisted = myStats.status === 'blacklisted'

          return (
            <Link key={group.id} href={`/groups/${group.id}`} className="block">
              <div className="app-card overflow-hidden">
                <div className="px-4 pt-3 pb-3 bg-gray-50 relative overflow-hidden">
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
                    {isCleared     && <span className="app-tag bg-app-green text-white text-xs shrink-0">返済！</span>}
                    {isBlacklisted && <span className="app-tag bg-app-red   text-white text-xs shrink-0">ブラック</span>}
                  </div>
                </div>

                <div className="px-4 py-3">
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold text-app-navy">{myStats.todayReps}</span>
                    <span className="text-sm text-gray-400 font-bold">/ {myStats.todayNorm} 回</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden mb-3">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%`, background: isCleared ? '#5EC462' : '#FFCD3C' }} />
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div><span className="font-bold text-app-red">{myStats.approxDebt}</span><span className="text-gray-400 font-bold text-xs ml-0.5">借筋</span></div>
                    <div><span className="font-bold text-app-green">{myStats.approxSavings}</span><span className="text-gray-400 font-bold text-xs ml-0.5">友情</span></div>
                    <div><span className="font-bold text-app-blue">{myStats.totalReps}</span><span className="text-gray-400 font-bold text-xs ml-0.5">総回数</span></div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* アバターピッカー */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => setShowPicker(false)}>
          <div className="w-full max-w-[390px] mx-auto bg-white rounded-t-3xl p-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4" />
            <div className="font-bold text-app-navy text-base mb-4">アイコンを選ぶ</div>
            <div className="grid grid-cols-8 gap-2">
              {AVATAR_OPTIONS.map(emoji => (
                <button key={emoji} onClick={() => selectAvatar(emoji)}
                  className={`h-11 rounded-2xl text-2xl flex items-center justify-center transition-all active:scale-90 ${
                    avatar === emoji ? 'bg-app-yellow scale-110 shadow' : 'bg-gray-50'
                  }`}>
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
