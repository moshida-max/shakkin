'use client'
import { useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MOCK_MEMBERSHIPS, MOCK_GROUPS, MOCK_REP_ENTRIES, TODAY } from '@/lib/mock-data'
import { todayNorm } from '@/lib/logic'
import ExerciseCharacter from '@/components/ExerciseCharacter'
import type { RepEntry } from '@/lib/types'

function getUnit(exerciseName: string): string {
  if (/プランク|秒/.test(exerciseName)) return '秒'
  if (/ランニング|km|マラソン|走/.test(exerciseName)) return 'km'
  return '回'
}

export default function RepsInputPage() {
  const { membershipId } = useParams<{ membershipId: string }>()
  const router = useRouter()

  const membership = MOCK_MEMBERSHIPS.find(m => m.id === membershipId) ?? MOCK_MEMBERSHIPS[0]
  const group      = MOCK_GROUPS.find(g => g.id === membership.group_id) ?? MOCK_GROUPS[0]
  const norm       = todayNorm(membership, TODAY)
  const unit       = getUnit(group.exercise_name)

  // 今日の既存記録（分割入力）
  const baseEntries = MOCK_REP_ENTRIES.filter(
    e => e.membership_id === membership.id && e.date === TODAY
  )

  const [entries, setEntries] = useState<RepEntry[]>(baseEntries)
  const [inputVal, setInputVal] = useState('')
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const totalReps = entries.reduce((s, e) => s + e.reps, 0)
  const isCleared = totalReps >= norm
  const progress  = norm > 0 ? Math.min(100, (totalReps / norm) * 100) : 0

  const charStatus = totalReps === 0 ? 'sleeping' : isCleared ? 'cleared' : 'working'

  const addEntry = () => {
    const n = parseInt(inputVal, 10)
    if (!n || n <= 0) return
    const newEntry: RepEntry = {
      id: `tmp-${Date.now()}`,
      membership_id: membership.id,
      date: TODAY,
      reps: n,
    }
    setEntries(prev => [...prev, newEntry])
    setInputVal('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addEntry()
  }

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const quickAdd = (n: number) => {
    const newEntry: RepEntry = {
      id: `tmp-${Date.now()}`,
      membership_id: membership.id,
      date: TODAY,
      reps: n,
    }
    setEntries(prev => [...prev, newEntry])
  }

  const handleSave = () => {
    // TODO: supabase.from('rep_entries').upsert(entries)
    setSaved(true)
    setTimeout(() => router.push(`/groups/${group.id}`), 1800)
  }

  /* 保存完了画面 */
  if (saved) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-4 ${
        isCleared ? 'bg-app-green' : 'bg-app-yellow'
      }`}>
        <div style={{ color: '#1A1A2E' }}>
          <ExerciseCharacter exercise={group.exercise_name} status="cleared" size={90} />
        </div>
        <div className="app-pill-title text-2xl">
          {isCleared ? '返済完了！！' : '記録した！'}
        </div>
        <div className="text-app-navy/60 font-bold text-xl">{totalReps} {unit}</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${
      isCleared ? 'bg-app-green' : 'bg-app-yellow'
    }`}>

      {/* ヘッダー */}
      <div className="pt-safe px-5 pb-2">
        <button onClick={() => router.back()} className="text-app-navy/60 font-bold text-sm mb-3 block">
          ← もどる
        </button>
        <div className="app-pill-title text-base">{group.name}</div>
        <div className="text-app-navy/60 font-bold text-sm mt-1">{group.exercise_name}</div>
      </div>

      {/* キャラクター + 数字 */}
      <div className="flex items-end justify-center gap-6 px-6 pt-2 pb-4">
        <div style={{ color: '#1A1A2E' }}>
          <ExerciseCharacter exercise={group.exercise_name} status={charStatus} size={88} />
        </div>
        <div className="text-right">
          {isCleared && (
            <div className="font-bold text-app-navy text-sm mb-1 animate-pulse">返済完了！</div>
          )}
          <div className={`font-bold leading-none transition-colors ${
            isCleared ? 'text-app-navy' : totalReps === 0 ? 'text-app-navy/20' : 'text-app-navy'
          }`} style={{ fontSize: totalReps >= 100 ? '4.5rem' : '6rem' }}>
            {totalReps}
          </div>
          <div className="text-app-navy/50 font-bold text-base">/ {norm} {unit}</div>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="px-5 mb-4">
        <div className="h-3 rounded-full bg-app-navy/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: isCleared ? '#1A1A2E' : '#1A1A2E' }}
          />
        </div>
        <div className="flex justify-between text-app-navy/40 text-xs font-bold mt-1">
          <span>今日のノルマ: {norm} {unit}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* メインカード */}
      <div className="flex-1 px-4 pb-6">
        <div className="app-card p-5">

          {/* クイック +ボタン */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[10, 5, 1].map(n => (
              <button key={n} onClick={() => quickAdd(n)}
                className="bg-app-navy text-white rounded-2xl py-4 text-lg font-bold
                           active:scale-95 active:opacity-80 transition-all">
                +{n}
              </button>
            ))}
          </div>

          {/* カスタム入力 */}
          <div className="flex gap-2 mb-5">
            <input
              ref={inputRef}
              type="number"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`任意の${unit}数を入力`}
              min={1}
              inputMode="numeric"
              className="flex-1 bg-app-gray rounded-2xl px-4 py-3 font-bold text-app-navy text-lg
                         placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-app-navy/20"
            />
            <button
              onClick={addEntry}
              disabled={!inputVal || parseInt(inputVal) <= 0}
              className="bg-app-navy text-white rounded-2xl px-5 font-bold text-base
                         active:scale-95 transition-all disabled:opacity-30"
            >
              追加
            </button>
          </div>

          {/* 今日の履歴 */}
          {entries.length > 0 && (
            <div className="mb-5">
              <div className="font-bold text-app-navy/60 text-xs mb-2">今日の記録</div>
              <div className="flex flex-wrap gap-2 items-center">
                {entries.map((e, i) => (
                  <div key={e.id} className="flex items-center gap-1">
                    {i > 0 && <span className="text-app-navy/30 font-bold text-sm">+</span>}
                    <button
                      onClick={() => removeEntry(e.id)}
                      className="bg-app-navy/10 text-app-navy rounded-xl px-3 py-1.5 font-bold text-sm
                                 active:scale-95 transition-all active:bg-app-red/20"
                      title="タップで削除"
                    >
                      {e.reps}
                    </button>
                  </div>
                ))}
                <span className="text-app-navy/40 font-bold text-sm">= {totalReps} {unit}</span>
              </div>
              <div className="text-gray-400 text-[10px] font-bold mt-1">タップで削除</div>
            </div>
          )}

          {/* 記録ボタン */}
          <button
            onClick={handleSave}
            disabled={entries.length === 0}
            className={`w-full rounded-2xl py-5 text-xl font-bold transition-all active:scale-95 ${
              entries.length === 0
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : isCleared
                ? 'bg-app-navy text-app-yellow'
                : 'bg-app-navy text-white'
            }`}
            style={entries.length > 0 ? { boxShadow: '0 4px 16px rgba(0,0,0,0.18)' } : {}}
          >
            {isCleared ? '返済完了で記録！' : '記録する'}
          </button>
        </div>
      </div>
    </div>
  )
}
