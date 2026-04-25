'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase, getToday } from '@/lib/supabase'
import { todayNorm as calcNorm } from '@/lib/logic'
import type { Membership } from '@/lib/types'

function getUnit(exerciseName: string): string {
  if (/プランク|秒/.test(exerciseName)) return '秒'
  if (/ランニング|km|マラソン|走/.test(exerciseName)) return 'km'
  return '回'
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const days = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getMonth() + 1}月${d.getDate()}日（${days[d.getDay()]}）`
}

function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const current = new Date(startDate + 'T00:00:00')
  const end     = new Date(endDate   + 'T00:00:00')
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10))
    current.setDate(current.getDate() + 1)
  }
  return dates.reverse()
}

const CARD_COLORS = ['#FFCD3C', '#FF8FAD', '#74B9FF', '#5EC462', '#A29BFE', '#4ECDC4']

type Member = {
  membership: Membership
  userName: string
  color: string
}

type Entry = { id: string; membership_id: string; date: string; reps: number }

export default function GroupHistoryPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const router      = useRouter()

  const [group,    setGroup]    = useState<any>(null)
  const [members,  setMembers]  = useState<Member[]>([])
  const [entries,  setEntries]  = useState<Entry[]>([])
  const [loading,  setLoading]  = useState(true)

  const [editTarget, setEditTarget] = useState<{ membershipId: string; userName: string; date: string } | null>(null)
  const [editReps,   setEditReps]   = useState(0)
  const [editSaving, setEditSaving] = useState(false)

  const [showAdd,         setShowAdd]         = useState(false)
  const [addMembershipId, setAddMembershipId] = useState('')
  const [addDate,         setAddDate]         = useState('')
  const [addReps,         setAddReps]         = useState(0)
  const [addSaving,       setAddSaving]       = useState(false)

  const TODAY = getToday()

  useEffect(() => { loadAll() }, [groupId])

  async function loadAll() {
    const { data: g } = await supabase.from('groups').select('*').eq('id', groupId).single()
    if (!g) { router.push('/home'); return }
    setGroup(g)

    const { data: mems } = await supabase.from('memberships').select('*').eq('group_id', groupId)
    if (!mems || mems.length === 0) { setLoading(false); return }

    const userIds = mems.map(m => m.user_id)
    const { data: profiles } = await supabase.from('profiles').select('*').in('id', userIds)
    const profileMap: Record<string, any> = {}
    ;(profiles || []).forEach(p => { profileMap[p.id] = p })

    const memberList: Member[] = mems.map((m, i) => ({
      membership: {
        id: m.id, user_id: m.user_id, group_id: m.group_id,
        initial_reps: m.initial_reps, start_date: m.start_date,
        state: m.state, debt_balance: m.debt_balance,
        savings_balance: m.savings_balance,
        consecutive_clear_days: m.consecutive_clear_days,
        total_cleared_reps: m.total_cleared_reps || 0,
      },
      userName: profileMap[m.user_id]?.name || '名無し',
      color: CARD_COLORS[i % CARD_COLORS.length],
    }))
    setMembers(memberList)
    setAddMembershipId(memberList[0]?.membership.id ?? '')

    const memIds = mems.map(m => m.id)
    const { data: ents } = await supabase.from('rep_entries').select('*').in('membership_id', memIds)
    setEntries(ents || [])
    setLoading(false)
  }

  const getReps = (membershipId: string, date: string): number =>
    entries.filter(e => e.membership_id === membershipId && e.date === date)
           .reduce((s, e) => s + e.reps, 0)

  const openEdit = (membershipId: string, userName: string, date: string) => {
    setEditTarget({ membershipId, userName, date })
    setEditReps(getReps(membershipId, date))
  }

  const saveEdit = async () => {
    if (!editTarget) return
    setEditSaving(true)
    await supabase.from('rep_entries')
      .delete().eq('membership_id', editTarget.membershipId).eq('date', editTarget.date)
    if (editReps > 0) {
      await supabase.from('rep_entries')
        .insert({ membership_id: editTarget.membershipId, date: editTarget.date, reps: editReps })
    }
    setEntries(prev => {
      const filtered = prev.filter(e => !(e.membership_id === editTarget.membershipId && e.date === editTarget.date))
      if (editReps > 0) filtered.push({ id: `e-${Date.now()}`, membership_id: editTarget.membershipId, date: editTarget.date, reps: editReps })
      return filtered
    })
    setEditSaving(false)
    setEditTarget(null)
  }

  const saveAdd = async () => {
    if (!addMembershipId || addReps <= 0 || !addDate) return
    setAddSaving(true)
    await supabase.from('rep_entries')
      .delete().eq('membership_id', addMembershipId).eq('date', addDate)
    await supabase.from('rep_entries')
      .insert({ membership_id: addMembershipId, date: addDate, reps: addReps })
    setEntries(prev => {
      const filtered = prev.filter(e => !(e.membership_id === addMembershipId && e.date === addDate))
      filtered.push({ id: `a-${Date.now()}`, membership_id: addMembershipId, date: addDate, reps: addReps })
      return filtered
    })
    setAddSaving(false)
    setShowAdd(false)
    setAddReps(0)
  }

  if (loading || !group) {
    return (
      <div className="min-h-screen bg-app-pink flex items-center justify-center">
        <div className="font-bold text-app-navy/40 animate-pulse">よみこみ中...</div>
      </div>
    )
  }

  const unit = getUnit(group.exercise_name)
  const earliest = members.map(m => m.membership.start_date).sort()[0] ?? TODAY
  const dates    = generateDateRange(earliest, TODAY)

  return (
    <div className="min-h-screen bg-app-pink flex flex-col">
      <div className="pt-safe px-5 pb-4">
        <button onClick={() => router.back()} className="text-app-navy/60 font-bold text-sm mb-3 block">← もどる</button>
        <div className="flex items-center justify-between gap-2">
          <div className="app-pill-title text-xl flex-1 min-w-0 truncate">{group.name}</div>
          <button
            onClick={() => { setAddReps(0); setAddDate(TODAY); setShowAdd(true) }}
            className="shrink-0 bg-app-navy text-white rounded-full px-3 py-1.5 text-xs font-bold active:scale-95 transition-transform"
          >
            ＋ 記録追加
          </button>
        </div>
        <div className="text-app-navy/60 text-sm font-bold mt-1">全員の記録履歴</div>
      </div>

      <div className="flex-1 px-4 pb-10 space-y-3">
        {dates.map(date => {
          const activeMembers = members.filter(m => m.membership.start_date <= date)
          if (activeMembers.length === 0) return null
          const isToday = date === TODAY
          return (
            <div key={date} className="app-card overflow-hidden">
              <div className={`px-4 py-2.5 ${isToday ? 'bg-app-navy' : 'bg-gray-50'}`}>
                <span className={`font-bold text-sm ${isToday ? 'text-white' : 'text-app-navy'}`}>
                  {formatDate(date)}
                </span>
                {isToday && <span className="ml-2 text-[10px] bg-white/20 text-white rounded-full px-2 py-0.5 font-bold">今日</span>}
              </div>
              <div className="divide-y divide-gray-50">
                {activeMembers.map(m => {
                  const reps      = getReps(m.membership.id, date)
                  const norm      = calcNorm(m.membership, date)
                  const isCleared = reps >= norm
                  const progress  = norm > 0 ? Math.min(100, (reps / norm) * 100) : 0
                  return (
                    <button
                      key={m.membership.id}
                      onClick={() => openEdit(m.membership.id, m.userName, date)}
                      className="w-full px-4 py-3 flex items-center gap-3 active:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0"
                        style={{ background: m.color }}>
                        {m.userName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-app-navy text-sm leading-tight">{m.userName}</div>
                        <div className="h-1 rounded-full bg-gray-100 mt-1 overflow-hidden w-24">
                          <div className="h-full rounded-full"
                            style={{ width: `${progress}%`, background: isCleared ? '#5EC462' : m.color }} />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {reps > 0 ? (
                          <div>
                            <span className={`font-bold text-lg ${isCleared ? 'text-app-green' : 'text-app-navy'}`}>{reps}</span>
                            <span className="text-gray-400 text-xs font-bold">/{norm}{unit}</span>
                          </div>
                        ) : (
                          <span className="text-gray-300 font-bold text-sm">未記録</span>
                        )}
                      </div>
                      <span className="text-gray-300 text-sm shrink-0">›</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* 編集モーダル */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => setEditTarget(null)}>
          <div className="w-full max-w-[390px] mx-auto bg-white rounded-t-3xl p-6 pb-10" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />
            <div className="font-bold text-app-navy text-lg mb-0.5">{editTarget.userName}</div>
            <div className="text-gray-400 text-sm font-bold mb-5">{formatDate(editTarget.date)}</div>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setEditReps(v => Math.max(0, v - 1))}
                className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-600 text-xl font-bold active:scale-90 transition-transform">−</button>
              <div className="flex-1 flex items-center gap-2 justify-center">
                <input type="number" value={editReps}
                  onChange={e => setEditReps(Math.max(0, Number(e.target.value)))}
                  inputMode="numeric"
                  className="w-24 text-center text-4xl font-bold text-app-navy bg-transparent focus:outline-none" />
                <span className="text-gray-400 font-bold text-lg">{unit}</span>
              </div>
              <button onClick={() => setEditReps(v => v + 1)}
                className="w-12 h-12 rounded-2xl bg-app-navy text-white text-xl font-bold active:scale-90 transition-transform">＋</button>
            </div>
            <button onClick={saveEdit} disabled={editSaving}
              className="w-full rounded-2xl py-4 bg-app-navy text-white font-bold text-base active:scale-95 transition-all mb-2 disabled:opacity-50"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
              {editSaving ? '保存中...' : '保存する'}
            </button>
            <button onClick={() => setEditTarget(null)} className="w-full py-3 font-bold text-gray-400 text-sm">キャンセル</button>
          </div>
        </div>
      )}

      {/* 追加モーダル */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-[390px] mx-auto bg-white rounded-t-3xl p-6 pb-10" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />
            <div className="font-bold text-app-navy text-lg mb-5">記録を追加・修正</div>
            <div className="mb-4">
              <label className="block font-bold text-app-navy text-sm mb-2">メンバー</label>
              <div className="flex gap-2 flex-wrap">
                {members.map(m => (
                  <button key={m.membership.id} onClick={() => setAddMembershipId(m.membership.id)}
                    className={`px-3 py-1.5 rounded-full font-bold text-sm transition-all active:scale-95 ${
                      addMembershipId === m.membership.id ? 'bg-app-navy text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                    {m.userName}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block font-bold text-app-navy text-sm mb-2">日付</label>
              <input type="date" value={addDate} onChange={e => setAddDate(e.target.value)} max={TODAY}
                className="w-full bg-app-gray rounded-2xl px-4 py-3 font-bold text-app-navy focus:outline-none text-sm" />
            </div>
            <div className="mb-6">
              <label className="block font-bold text-app-navy text-sm mb-2">{unit}数</label>
              <input type="number" value={addReps || ''} onChange={e => setAddReps(Math.max(0, Number(e.target.value)))}
                placeholder="0" inputMode="numeric" min={0}
                className="w-full bg-app-gray rounded-2xl px-4 py-3 font-bold text-app-navy text-2xl text-center focus:outline-none" />
            </div>
            <button onClick={saveAdd} disabled={addReps <= 0 || addSaving}
              className={`w-full rounded-2xl py-4 font-bold text-base transition-all mb-2 ${
                addReps > 0 && !addSaving ? 'bg-app-navy text-white active:scale-95' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
              style={addReps > 0 ? { boxShadow: '0 4px 16px rgba(0,0,0,0.15)' } : {}}>
              {addSaving ? '追加中...' : '追加する'}
            </button>
            <button onClick={() => setShowAdd(false)} className="w-full py-3 font-bold text-gray-400 text-sm">キャンセル</button>
          </div>
        </div>
      )}
    </div>
  )
}
