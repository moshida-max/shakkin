'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, getToday } from '@/lib/supabase'
import { todayNorm } from '@/lib/logic'
import ExerciseCharacter from '@/components/ExerciseCharacter'
import type { Membership, RepEntry } from '@/lib/types'

function getUnit(name: string) {
  if (/プランク|秒/.test(name)) return '秒'
  if (/ランニング|km|マラソン|走/.test(name)) return 'km'
  return '回'
}

export default function RepsInputPage() {
  const { membershipId } = useParams<{ membershipId: string }>()
  const router = useRouter()

  const [membership, setMembership] = useState<Membership | null>(null)
  const [group,      setGroup]      = useState<any>(null)
  const [entries,    setEntries]    = useState<RepEntry[]>([])
  const [inputVal,   setInputVal]   = useState('')
  const [saved,      setSaved]      = useState(false)
  const [loading,    setLoading]    = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  const TODAY = getToday()

  useEffect(() => { loadData() }, [membershipId])

  async function loadData() {
    const { data: mem } = await supabase
      .from('memberships').select('*, groups(*)').eq('id', membershipId).single()
    if (!mem) { router.push('/home'); return }

    setMembership({
      id: mem.id, user_id: mem.user_id, group_id: mem.group_id,
      initial_reps: mem.initial_reps, start_date: mem.start_date,
      state: mem.state, debt_balance: mem.debt_balance,
      savings_balance: mem.savings_balance,
      consecutive_clear_days: mem.consecutive_clear_days,
      total_cleared_reps: mem.total_cleared_reps || 0,
    })
    setGroup(mem.groups)

    const { data: todayEntries } = await supabase
      .from('rep_entries').select('*')
      .eq('membership_id', membershipId).eq('date', TODAY)
    setEntries(todayEntries || [])
    setLoading(false)
  }

  if (loading || !membership || !group) {
    return (
      <div className="min-h-screen bg-app-yellow flex items-center justify-center">
        <div className="font-bold text-app-navy/40 animate-pulse">よみこみ中...</div>
      </div>
    )
  }

  const norm       = todayNorm(membership, TODAY)
  const totalReps  = entries.reduce((s, e) => s + e.reps, 0)
  const isCleared  = totalReps >= norm
  const progress   = norm > 0 ? Math.min(100, (totalReps / norm) * 100) : 0
  const charStatus = totalReps === 0 ? 'sleeping' : isCleared ? 'cleared' : 'working'
  const unit       = getUnit(group.exercise_name)

  const quickAdd = (n: number) => {
    setEntries(prev => [...prev, { id: `tmp-${Date.now()}`, membership_id: membershipId, date: TODAY, reps: n }])
  }

  const addCustom = () => {
    const n = parseInt(inputVal, 10)
    if (!n || n <= 0) return
    setEntries(prev => [...prev, { id: `tmp-${Date.now()}`, membership_id: membershipId, date: TODAY, reps: n }])
    setInputVal('')
    inputRef.current?.focus()
  }

  const removeEntry = (id: string) => setEntries(prev => prev.filter(e => e.id !== id))

  const handleSave = async () => {
    // 今日の記録を全削除して再挿入（分割入力対応）
    await supabase.from('rep_entries')
      .delete().eq('membership_id', membershipId).eq('date', TODAY)

    if (entries.length > 0) {
      await supabase.from('rep_entries').insert(
        entries.map(e => ({ membership_id: membershipId, date: TODAY, reps: e.reps }))
      )
    }
    setSaved(true)
    setTimeout(() => router.push(`/groups/${group.id}`), 1800)
  }

  if (saved) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-4 ${isCleared ? 'bg-app-green' : 'bg-app-yellow'}`}>
        <div style={{ color: '#1A1A2E' }}>
          <ExerciseCharacter exercise={group.exercise_name} status="cleared" size={90} />
        </div>
        <div className="app-pill-title text-2xl">{isCleared ? '返済完了！！' : '記録した！'}</div>
        <div className="text-app-navy/60 font-bold text-xl">{totalReps} {unit}</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isCleared ? 'bg-app-green' : 'bg-app-yellow'}`}>

      <div className="pt-safe px-5 pb-2">
        <button onClick={() => router.back()} className="text-app-navy/60 font-bold text-sm mb-3 block">← もどる</button>
        <div className="app-pill-title text-base">{group.name}</div>
        <div className="text-app-navy/60 font-bold text-sm mt-1">{group.exercise_name}</div>
      </div>

      <div className="flex items-end justify-center gap-6 px-6 pt-2 pb-4">
        <div style={{ color: '#1A1A2E' }}>
          <ExerciseCharacter exercise={group.exercise_name} status={charStatus} size={88} />
        </div>
        <div className="text-right">
          {isCleared && <div className="font-bold text-app-navy text-sm mb-1 animate-pulse">返済完了！</div>}
          <div className="font-bold leading-none text-app-navy" style={{ fontSize: totalReps >= 100 ? '4.5rem' : '6rem' }}>
            {totalReps}
          </div>
          <div className="text-app-navy/50 font-bold text-base">/ {norm} {unit}</div>
        </div>
      </div>

      <div className="px-5 mb-4">
        <div className="h-3 rounded-full bg-app-navy/10 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: '#1A1A2E' }} />
        </div>
        <div className="flex justify-between text-app-navy/40 text-xs font-bold mt-1">
          <span>ノルマ: {norm} {unit}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="flex-1 px-4 pb-6">
        <div className="app-card p-5">

          <div className="flex gap-2 mb-5">
            <input ref={inputRef} type="number" value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustom()}
              placeholder={`任意の${unit}数`} min={1} inputMode="numeric"
              className="flex-1 bg-app-gray rounded-2xl px-4 py-3 font-bold text-app-navy text-lg placeholder:text-gray-300 focus:outline-none" />
            <button onClick={addCustom} disabled={!inputVal || parseInt(inputVal) <= 0}
              className="bg-app-navy text-white rounded-2xl px-5 font-bold text-base active:scale-95 transition-all disabled:opacity-30">
              追加
            </button>
          </div>

          {entries.length > 0 && (
            <div className="mb-5">
              <div className="font-bold text-app-navy/60 text-xs mb-2">今日の記録</div>
              <div className="flex flex-wrap gap-2 items-center">
                {entries.map((e, i) => (
                  <div key={e.id} className="flex items-center gap-1">
                    {i > 0 && <span className="text-app-navy/30 font-bold text-sm">+</span>}
                    <button onClick={() => removeEntry(e.id)}
                      className="bg-app-navy/10 text-app-navy rounded-xl px-3 py-1.5 font-bold text-sm active:scale-95 transition-all active:bg-app-red/20"
                      title="タップで削除">
                      {e.reps}
                    </button>
                  </div>
                ))}
                <span className="text-app-navy/40 font-bold text-sm">= {totalReps} {unit}</span>
              </div>
              <div className="text-gray-400 text-[10px] font-bold mt-1">タップで削除</div>
            </div>
          )}

          <button onClick={handleSave} disabled={entries.length === 0}
            className={`w-full rounded-2xl py-5 text-xl font-bold transition-all active:scale-95 ${
              entries.length === 0 ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : isCleared ? 'bg-app-navy text-app-yellow' : 'bg-app-navy text-white'
            }`}
            style={entries.length > 0 ? { boxShadow: '0 4px 16px rgba(0,0,0,0.18)' } : {}}>
            {isCleared ? '返済完了で記録！' : '記録する'}
          </button>
        </div>
      </div>
    </div>
  )
}
