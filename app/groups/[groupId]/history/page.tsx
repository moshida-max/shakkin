'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { MOCK_GROUPS, MOCK_MEMBER_STATS, MOCK_REP_ENTRIES, TODAY } from '@/lib/mock-data'
import { todayNorm as calcNorm } from '@/lib/logic'
import type { RepEntry } from '@/lib/types'

const MEMBER_EMOJI: Record<string, string> = {
  'user-1': '💪',
  'user-2': '🔥',
  'user-3': '🌸',
  'user-4': '⚡',
}

const MEMBER_COLOR: Record<string, string> = {
  'user-1': '#FFCD3C',
  'user-2': '#FF8FAD',
  'user-3': '#74B9FF',
  'user-4': '#5EC462',
}

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

export default function GroupHistoryPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const router      = useRouter()

  const group   = MOCK_GROUPS.find(g => g.id === groupId) ?? MOCK_GROUPS[0]
  const members = MOCK_MEMBER_STATS[group.id] ?? []
  const unit    = getUnit(group.exercise_name)

  const membershipIds = members.map(ms => ms.membership.id)
  const [entries, setEntries] = useState<RepEntry[]>(
    MOCK_REP_ENTRIES.filter(e => membershipIds.includes(e.membership_id))
  )

  // Dates from earliest member start to today
  const earliest = members
    .map(ms => ms.membership.start_date)
    .sort()[0] ?? TODAY
  const dates = generateDateRange(earliest, TODAY)

  // Edit modal state
  const [editTarget, setEditTarget] = useState<{
    membershipId: string
    userName: string
    date: string
  } | null>(null)
  const [editReps, setEditReps] = useState(0)

  // Add modal state
  const [showAdd,        setShowAdd]        = useState(false)
  const [addMembershipId, setAddMembershipId] = useState(members[0]?.membership.id ?? '')
  const [addDate,        setAddDate]        = useState(TODAY)
  const [addReps,        setAddReps]        = useState(0)

  const getReps = (membershipId: string, date: string): number =>
    entries
      .filter(e => e.membership_id === membershipId && e.date === date)
      .reduce((s, e) => s + e.reps, 0)

  const openEdit = (membershipId: string, userName: string, date: string) => {
    const reps = getReps(membershipId, date)
    setEditTarget({ membershipId, userName, date })
    setEditReps(reps)
  }

  const saveEdit = () => {
    if (!editTarget) return
    setEntries(prev => {
      const filtered = prev.filter(
        e => !(e.membership_id === editTarget.membershipId && e.date === editTarget.date)
      )
      if (editReps > 0) {
        filtered.push({ id: `e-${Date.now()}`, membership_id: editTarget.membershipId, date: editTarget.date, reps: editReps })
      }
      return filtered
    })
    setEditTarget(null)
  }

  const saveAdd = () => {
    if (!addMembershipId || addReps <= 0 || !addDate) return
    setEntries(prev => {
      const filtered = prev.filter(
        e => !(e.membership_id === addMembershipId && e.date === addDate)
      )
      filtered.push({ id: `a-${Date.now()}`, membership_id: addMembershipId, date: addDate, reps: addReps })
      return filtered
    })
    setShowAdd(false)
    setAddReps(0)
  }

  return (
    <div className="min-h-screen bg-app-pink flex flex-col">

      {/* ヘッダー */}
      <div className="pt-safe px-5 pb-4">
        <button onClick={() => router.back()} className="text-app-navy/60 font-bold text-sm mb-3 block">
          ← もどる
        </button>
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

      {/* 日付カード一覧 */}
      <div className="flex-1 px-4 pb-10 space-y-3">
        {dates.map(date => {
          const activeMembers = members.filter(ms => ms.membership.start_date <= date)
          if (activeMembers.length === 0) return null
          const isToday = date === TODAY

          return (
            <div key={date} className="app-card overflow-hidden">
              {/* 日付ヘッダー */}
              <div className={`px-4 py-2.5 ${isToday ? 'bg-app-navy' : 'bg-gray-50'}`}>
                <span className={`font-bold text-sm ${isToday ? 'text-white' : 'text-app-navy'}`}>
                  {formatDate(date)}
                </span>
                {isToday && (
                  <span className="ml-2 text-[10px] bg-white/20 text-white rounded-full px-2 py-0.5 font-bold">今日</span>
                )}
              </div>

              {/* メンバー行 */}
              <div className="divide-y divide-gray-50">
                {activeMembers.map(ms => {
                  const reps  = getReps(ms.membership.id, date)
                  const norm  = calcNorm(ms.membership, date)
                  const emoji = MEMBER_EMOJI[ms.user.id] ?? ms.user.name[0]
                  const color = MEMBER_COLOR[ms.user.id] ?? '#E5E7EB'
                  const isCleared = reps >= norm
                  const progress  = norm > 0 ? Math.min(100, (reps / norm) * 100) : 0

                  return (
                    <button
                      key={ms.membership.id}
                      onClick={() => openEdit(ms.membership.id, ms.user.name, date)}
                      className="w-full px-4 py-3 flex items-center gap-3 active:bg-gray-50 transition-colors text-left"
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0"
                        style={{ background: color }}
                      >
                        {emoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-app-navy text-sm leading-tight">{ms.user.name}</div>
                        <div className="h-1 rounded-full bg-gray-100 mt-1 overflow-hidden w-24">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${progress}%`,
                              background: isCleared ? '#5EC462' : color,
                            }}
                          />
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {reps > 0 ? (
                          <div>
                            <span className={`font-bold text-lg ${isCleared ? 'text-app-green' : 'text-app-navy'}`}>
                              {reps}
                            </span>
                            <span className="text-gray-400 text-xs font-bold">
                              /{norm}{unit}
                            </span>
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
          <div
            className="w-full max-w-[390px] mx-auto bg-white rounded-t-3xl p-6 pb-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />
            <div className="font-bold text-app-navy text-lg mb-0.5">{editTarget.userName}</div>
            <div className="text-gray-400 text-sm font-bold mb-5">{formatDate(editTarget.date)}</div>

            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setEditReps(v => Math.max(0, v - 1))}
                className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-600 text-xl font-bold active:scale-90 transition-transform"
              >−</button>
              <div className="flex-1 flex items-center gap-2 justify-center">
                <input
                  type="number"
                  value={editReps}
                  onChange={e => setEditReps(Math.max(0, Number(e.target.value)))}
                  className="w-24 text-center text-4xl font-bold text-app-navy bg-transparent focus:outline-none"
                  min={0}
                />
                <span className="text-gray-400 font-bold text-lg">{unit}</span>
              </div>
              <button
                onClick={() => setEditReps(v => v + 1)}
                className="w-12 h-12 rounded-2xl bg-app-navy text-white text-xl font-bold active:scale-90 transition-transform"
              >＋</button>
            </div>

            <button
              onClick={saveEdit}
              className="w-full rounded-2xl py-4 bg-app-navy text-white font-bold text-base active:scale-95 transition-all mb-2"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
            >
              保存する
            </button>
            <button onClick={() => setEditTarget(null)} className="w-full py-3 font-bold text-gray-400 text-sm">
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 追加モーダル */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => setShowAdd(false)}>
          <div
            className="w-full max-w-[390px] mx-auto bg-white rounded-t-3xl p-6 pb-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />
            <div className="font-bold text-app-navy text-lg mb-5">記録を追加・修正</div>

            {/* メンバー選択 */}
            <div className="mb-4">
              <label className="block font-bold text-app-navy text-sm mb-2">メンバー</label>
              <div className="flex gap-2 flex-wrap">
                {members.map(ms => (
                  <button
                    key={ms.membership.id}
                    onClick={() => setAddMembershipId(ms.membership.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm transition-all active:scale-95 ${
                      addMembershipId === ms.membership.id
                        ? 'bg-app-navy text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {MEMBER_EMOJI[ms.user.id] ?? ms.user.name[0]} {ms.user.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 日付 */}
            <div className="mb-4">
              <label className="block font-bold text-app-navy text-sm mb-2">日付</label>
              <input
                type="date"
                value={addDate}
                onChange={e => setAddDate(e.target.value)}
                max={TODAY}
                className="w-full bg-app-gray rounded-2xl px-4 py-3 font-bold text-app-navy focus:outline-none text-sm"
              />
            </div>

            {/* 回数 */}
            <div className="mb-6">
              <label className="block font-bold text-app-navy text-sm mb-2">回数</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAddReps(v => Math.max(0, v - 1))}
                  className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-600 text-xl font-bold active:scale-90 transition-transform"
                >−</button>
                <div className="flex-1 flex items-center gap-2 justify-center">
                  <input
                    type="number"
                    value={addReps}
                    onChange={e => setAddReps(Math.max(0, Number(e.target.value)))}
                    className="w-24 text-center text-4xl font-bold text-app-navy bg-transparent focus:outline-none"
                    min={0}
                  />
                  <span className="text-gray-400 font-bold text-lg">{unit}</span>
                </div>
                <button
                  onClick={() => setAddReps(v => v + 1)}
                  className="w-12 h-12 rounded-2xl bg-app-navy text-white text-xl font-bold active:scale-90 transition-transform"
                >＋</button>
              </div>
            </div>

            <button
              onClick={saveAdd}
              disabled={addReps <= 0}
              className={`w-full rounded-2xl py-4 font-bold text-base transition-all mb-2 ${
                addReps > 0
                  ? 'bg-app-navy text-white active:scale-95'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
              style={addReps > 0 ? { boxShadow: '0 4px 16px rgba(0,0,0,0.15)' } : {}}
            >
              追加する
            </button>
            <button onClick={() => setShowAdd(false)} className="w-full py-3 font-bold text-gray-400 text-sm">
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
