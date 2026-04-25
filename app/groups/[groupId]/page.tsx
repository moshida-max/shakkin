'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase, getOrCreateUserId, getToday } from '@/lib/supabase'
import { todayNorm, sumReps, calcStatus, calcApproxStats } from '@/lib/logic'
import StatusBadge from '@/components/StatusBadge'
import ExerciseCharacter from '@/components/ExerciseCharacter'
import type { Membership, MemberStats, RepEntry } from '@/lib/types'

const CARD_COLORS = ['#74B9FF', '#5EC462', '#FFCD3C', '#FF8FAD', '#A29BFE', '#4ECDC4']

function getUnit(name: string) {
  if (/プランク|秒/.test(name)) return '秒'
  if (/ランニング|km|マラソン|走/.test(name)) return 'km'
  return '回'
}

export default function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const router = useRouter()

  const [userId,     setUserId]     = useState('')
  const [group,      setGroup]      = useState<any>(null)
  const [members,    setMembers]    = useState<MemberStats[]>([])
  const [myStats,    setMyStats]    = useState<MemberStats | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [copied,     setCopied]     = useState(false)

  // 記録シート
  const [showRecord,   setShowRecord]   = useState(false)
  const [recEntries,   setRecEntries]   = useState<RepEntry[]>([])
  const [inputVal,     setInputVal]     = useState('')
  const [saving,       setSaving]       = useState(false)
  const [myCardColor,  setMyCardColor]  = useState('#FFCD3C')
  const inputRef = useRef<HTMLInputElement>(null)

  const TODAY = getToday()

  useEffect(() => { loadAll() }, [groupId])

  async function loadAll() {
    try {
      const uid = await getOrCreateUserId()
      setUserId(uid)

      const { data: g } = await supabase.from('groups').select('*').eq('id', groupId).single()
      if (!g) { router.push('/home'); return }
      setGroup(g)

      const { data: mems } = await supabase.from('memberships').select('*').eq('group_id', groupId)
      if (!mems) { setLoading(false); return }

      const userIds = mems.map(m => m.user_id)
      const { data: profiles } = await supabase.from('profiles').select('*').in('id', userIds)
      const profileMap: Record<string, any> = {}
      ;(profiles || []).forEach(p => { profileMap[p.id] = p })

      const memIds = mems.map(m => m.id)
      const { data: entries } = await supabase.from('rep_entries').select('*').in('membership_id', memIds)
      const allEntries = entries || []

      const statsArr: MemberStats[] = mems.map(mem => {
        const membership: Membership = {
          id: mem.id, user_id: mem.user_id, group_id: mem.group_id,
          initial_reps: mem.initial_reps, start_date: mem.start_date,
          state: mem.state, debt_balance: mem.debt_balance,
          savings_balance: mem.savings_balance,
          consecutive_clear_days: mem.consecutive_clear_days,
          total_cleared_reps: mem.total_cleared_reps || 0,
        }
        const profile = profileMap[mem.user_id]
        const user = { id: mem.user_id, name: profile?.name || '名無し', icon_url: null }
        const myEntries      = allEntries.filter(e => e.membership_id === mem.id)
        const norm           = todayNorm(membership, TODAY)
        const todayRepsCount = sumReps(myEntries, TODAY)
        const status         = calcStatus(membership, todayRepsCount, norm)
        const { approxDebt, approxSavings, totalReps } = calcApproxStats(membership, myEntries, TODAY)
        return { membership, user, todayNorm: norm, todayReps: todayRepsCount, status, approxDebt, approxSavings, totalReps }
      })

      setMembers(statsArr)
      const meIdx = statsArr.findIndex(s => s.user.id === uid)
      const me = meIdx >= 0 ? statsArr[meIdx] : null
      setMyStats(me)
      if (meIdx >= 0) setMyCardColor(CARD_COLORS[meIdx % CARD_COLORS.length])

      // 今日の自分の記録をシート用にセット
      if (me) {
        const todayEnts = allEntries.filter(e => e.membership_id === me.membership.id && e.date === TODAY)
        setRecEntries(todayEnts)
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const openRecord = () => {
    setInputVal('')
    setShowRecord(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const addEntry = () => {
    const n = parseInt(inputVal, 10)
    if (!n || n <= 0) return
    setRecEntries(prev => [...prev, { id: `tmp-${Date.now()}`, membership_id: myStats!.membership.id, date: TODAY, reps: n }])
    setInputVal('')
    inputRef.current?.focus()
  }

  const removeEntry = (id: string) => setRecEntries(prev => prev.filter(e => e.id !== id))

  const handleSave = async () => {
    if (!myStats) return
    setSaving(true)
    await supabase.from('rep_entries').delete().eq('membership_id', myStats.membership.id).eq('date', TODAY)
    if (recEntries.length > 0) {
      await supabase.from('rep_entries').insert(
        recEntries.map(e => ({ membership_id: myStats.membership.id, date: TODAY, reps: e.reps }))
      )
    }
    setShowRecord(false)
    setSaving(false)
    await loadAll()
  }

  const handleCopy = async () => {
    const url = `${window.location.origin}/groups/join/${group?.invite_code}`
    await navigator.clipboard.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => { setCopied(false); setShowInvite(false) }, 1500)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-app-pink flex items-center justify-center">
        <div className="font-bold text-app-navy/40 text-lg animate-pulse">よみこみ中...</div>
      </div>
    )
  }

  if (!group) return null

  const unit        = getUnit(group.exercise_name)
  const totalRecs   = recEntries.reduce((s, e) => s + e.reps, 0)
  const recNorm     = myStats?.todayNorm ?? 0
  const recCleared  = totalRecs >= recNorm

  return (
    <div className="min-h-screen bg-app-pink flex flex-col pb-10">

      {/* ヘッダー */}
      <div className="pt-safe px-5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="app-pill-title text-xl flex-1 min-w-0 truncate">{group.name}</div>
          <button onClick={() => setShowInvite(true)}
            className="shrink-0 bg-white rounded-full px-3 py-1.5 flex items-center gap-1.5 font-bold text-app-navy text-xs active:scale-95 transition-transform"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            招待
          </button>
          <Link href={`/groups/${groupId}/settings`}
            className="shrink-0 bg-white rounded-full w-9 h-9 flex items-center justify-center text-app-navy/60 active:scale-95 transition-transform"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            ⚙
          </Link>
        </div>
        <div className="text-app-navy/60 text-sm font-bold mb-3">{group.exercise_name}</div>

        <Link href={`/groups/${groupId}/history`}>
          <div className="app-card px-4 py-3 flex items-center justify-between active:opacity-75 transition-opacity">
            <div>
              <div className="font-bold text-app-navy text-sm">全員の記録履歴・編集</div>
              <div className="text-gray-400 text-xs font-bold">過去の記録追加・修正もここから</div>
            </div>
            <span className="text-app-navy text-lg">›</span>
          </div>
        </Link>
      </div>

      {/* 自分の記録カード（タップで記録シート） */}
      {myStats && (
        <div className="px-4 mb-4">
          <button onClick={openRecord} className="w-full text-left">
            <div className={`app-card p-4 flex items-center gap-4 transition-colors ${recCleared ? 'border-2 border-app-green' : ''}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden ${
                recCleared ? 'bg-app-green/20' : 'bg-app-yellow/60'
              }`} style={{ color: '#1A1A2E' }}>
                <ExerciseCharacter exercise={group.exercise_name}
                  status={myStats.todayReps === 0 ? 'sleeping' : recCleared ? 'cleared' : 'working'}
                  size={52} />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-400 font-bold">今日の記録（タップで入力）</div>
                <div className="font-bold text-app-navy text-xl">
                  {myStats.todayReps}
                  <span className="text-sm text-gray-400"> / {myStats.todayNorm} {unit}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={myStats.status} size="sm" />
                <span className="text-gray-400 text-xs font-bold">›</span>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* メンバーグリッド */}
      <div className="flex-1 px-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="app-pill-title text-sm">メンバー</span>
          <span className="app-tag bg-white/60 text-app-navy text-xs font-bold">{members.length}人</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {members.map((ms, idx) => {
            const cardColor  = CARD_COLORS[idx % CARD_COLORS.length]
            const isMe       = ms.user.id === userId
            const progress   = ms.todayNorm > 0 ? Math.min(100, (ms.todayReps / ms.todayNorm) * 100) : 0
            const charStatus = ms.todayReps === 0 ? 'sleeping' : ms.status === 'cleared' ? 'cleared' : 'working'
            return (
              <div key={ms.membership.id} className="app-card overflow-hidden">
                <div className="px-3 pt-2 pb-1 relative" style={{ background: cardColor }}>
                  {isMe && (
                    <span className="absolute top-2 right-2 text-[9px] bg-white/40 text-white rounded-full px-1.5 py-0.5 font-bold">自分</span>
                  )}
                  <div className="flex justify-center" style={{ color: '#1A1A2E' }}>
                    <ExerciseCharacter exercise={group.exercise_name} status={charStatus} size={64} />
                  </div>
                  <div className="text-center font-bold text-white text-sm leading-tight truncate">{ms.user.name}</div>
                  <div className="text-center text-white/70 text-[10px] font-bold mb-1">{ms.membership.consecutive_clear_days}日連続</div>
                </div>
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
                      style={{ width: `${progress}%`, background: ms.status === 'cleared' ? '#5EC462' : cardColor }} />
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center">
                    <div><div className="font-bold text-app-red text-sm">{ms.approxDebt}</div><div className="text-[9px] text-gray-400 font-bold">借筋</div></div>
                    <div><div className="font-bold text-app-green text-sm">{ms.approxSavings}</div><div className="text-[9px] text-gray-400 font-bold">友情</div></div>
                    <div><div className="font-bold text-app-blue text-sm">{ms.totalReps}</div><div className="text-[9px] text-gray-400 font-bold">総回数</div></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>


      {/* 記録ボトムシート */}
      {showRecord && myStats && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => setShowRecord(false)}>
          <div className="w-full max-w-[390px] mx-auto rounded-t-3xl p-5 pb-10"
            style={{ background: myCardColor }}
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-black/10 mx-auto mb-4" />

            {/* 進捗 */}
            <div className="mb-3">
              <div className="text-xs font-bold mb-0.5 text-white/70">{group.name} · 今日</div>
              <div className="font-bold leading-none text-white" style={{ fontSize: '3.5rem' }}>{totalRecs}</div>
              <div className="font-bold text-sm text-white/70">/ {recNorm} {unit}</div>
            </div>

            {/* プログレスバー */}
            <div className="h-2 rounded-full bg-black/10 overflow-hidden mb-4">
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, recNorm > 0 ? (totalRecs / recNorm) * 100 : 0)}%`,
                  background: 'rgba(255,255,255,0.7)' }} />
            </div>

            {/* 入力欄 */}
            <div className="flex gap-2 mb-3">
              <input ref={inputRef} type="number" value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addEntry()}
                placeholder={`${unit}数を入力`} min={1} inputMode="numeric"
                className="flex-1 bg-black/10 rounded-2xl px-4 py-3 font-bold text-app-navy text-lg placeholder:text-black/30 focus:outline-none" />
              <button onClick={addEntry} disabled={!inputVal || parseInt(inputVal) <= 0}
                className="bg-app-navy text-white rounded-2xl px-5 font-bold text-base active:scale-95 transition-all disabled:opacity-30">
                追加
              </button>
            </div>

            {/* 今日の記録リスト */}
            {recEntries.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 items-center">
                  {recEntries.map((e, i) => (
                    <div key={e.id} className="flex items-center gap-1">
                      {i > 0 && <span className="text-black/30 font-bold text-sm">+</span>}
                      <button onClick={() => removeEntry(e.id)}
                        className="bg-black/10 text-app-navy rounded-xl px-3 py-1.5 font-bold text-sm active:scale-95 transition-all active:bg-red-200">
                        {e.reps}
                      </button>
                    </div>
                  ))}
                  <span className="text-black/40 font-bold text-sm">= {totalRecs} {unit}</span>
                </div>
                <div className="text-black/30 text-[10px] font-bold mt-1">タップで削除</div>
              </div>
            )}

            {/* 保存ボタン */}
            <button onClick={handleSave} disabled={saving}
              className="w-full rounded-2xl py-4 text-base font-bold bg-white text-app-navy transition-all active:scale-95 disabled:opacity-50"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
              {saving ? '保存中...' : '記録を保存する'}
            </button>
          </div>
        </div>
      )}

      {/* 招待モーダル */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => setShowInvite(false)}>
          <div className="w-full max-w-[390px] mx-auto bg-white rounded-t-3xl p-6 pb-10" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />
            <div className="font-bold text-app-navy text-lg mb-1">仲間を招待する</div>
            <div className="text-gray-400 text-sm mb-5">リンクを送るだけで参加できる</div>
            <div className="bg-app-gray rounded-2xl px-4 py-3 mb-2">
              <div className="text-gray-400 text-xs font-bold mb-0.5">招待コード</div>
              <div className="font-bold text-app-navy text-2xl tracking-[0.3em]">{group.invite_code}</div>
            </div>
            <div className="bg-app-gray rounded-2xl px-4 py-3 mb-5 overflow-hidden">
              <div className="text-gray-400 text-xs font-bold mb-0.5">招待リンク</div>
              <div className="font-bold text-app-navy text-xs truncate">
                {typeof window !== 'undefined' ? `${window.location.origin}/groups/join/${group.invite_code}` : ''}
              </div>
            </div>
            <button onClick={handleCopy}
              className={`w-full rounded-2xl py-4 font-bold text-base transition-all mb-2 ${
                copied ? 'bg-app-green text-white' : 'bg-app-navy text-white active:scale-95'
              }`}
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
              {copied ? 'コピーしました！' : '招待リンクをコピー'}
            </button>
            <button onClick={() => setShowInvite(false)} className="w-full py-3 font-bold text-gray-400 text-sm">キャンセル</button>
          </div>
        </div>
      )}
    </div>
  )
}
