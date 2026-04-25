'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getOrCreateUserId, getToday, generateInviteCode } from '@/lib/supabase'

const PRESETS = [
  { name: '腕立て伏せ', unit: '回' },
  { name: 'スクワット',  unit: '回' },
  { name: '腹筋',        unit: '回' },
  { name: '懸垂',        unit: '回' },
  { name: '背筋',        unit: '回' },
  { name: 'バーピー',    unit: '回' },
  { name: 'プランク',    unit: '秒' },
  { name: 'ランニング',  unit: 'km' },
]

function getUnit(exercise: string) {
  if (/プランク|秒/.test(exercise)) return '秒'
  if (/ランニング|km|マラソン|走/.test(exercise)) return 'km'
  return '回'
}

export default function NewGroupPage() {
  const router = useRouter()
  const [name,     setName]     = useState('')
  const [exercise, setExercise] = useState('')
  const [initial,  setInitial]  = useState('10')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const unit = getUnit(exercise)
  const canSubmit = name.trim() && exercise.trim() && Number(initial) > 0 && !loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError('')

    try {
      const uid         = await getOrCreateUserId()
      const invite_code = generateInviteCode()
      const today       = getToday()

      // グループ作成
      const { data: group, error: gErr } = await supabase
        .from('groups')
        .insert({ name: name.trim(), exercise_name: exercise.trim(), created_by: uid, invite_code })
        .select()
        .single()

      if (gErr || !group) throw new Error(gErr?.message || 'グループ作成に失敗')

      // 作成者のメンバーシップを追加
      const { error: mErr } = await supabase
        .from('memberships')
        .insert({ user_id: uid, group_id: group.id, initial_reps: parseInt(initial), start_date: today })

      if (mErr) throw new Error(mErr.message)

      router.push('/home')
    } catch (e: any) {
      setError(e.message || '作成に失敗しました')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-app-blue flex flex-col">
      <div className="pt-safe px-5 pb-4">
        <button onClick={() => router.back()} className="text-app-navy/60 font-bold text-sm mb-3 block">
          ← もどる
        </button>
        <div className="app-pill-title text-xl">グループを作る</div>
      </div>

      <div className="flex-1 px-4 pb-10">
        <form onSubmit={handleSubmit} className="app-card p-5 space-y-6">

          {error && (
            <div className="bg-app-red/10 text-app-red font-bold text-sm rounded-2xl px-4 py-3">{error}</div>
          )}

          <div>
            <label className="block font-bold text-app-navy text-sm mb-2">グループ名</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="例：腕立て同盟" maxLength={20} required className="app-input" />
          </div>

          <div>
            <label className="block font-bold text-app-navy text-sm mb-2">種目名</label>
            <input type="text" value={exercise} onChange={e => setExercise(e.target.value)}
              placeholder="種目を入力 or 下から選択" required className="app-input mb-3" />
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(p => (
                <button key={p.name} type="button" onClick={() => setExercise(p.name)}
                  className={`app-tag font-bold text-sm transition-all ${
                    exercise === p.name ? 'bg-app-navy text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                  {p.name}
                  <span className={`ml-1 text-xs ${exercise === p.name ? 'text-white/70' : 'text-gray-400'}`}>({p.unit})</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-app-navy text-sm mb-1">
              初期値 <span className="text-gray-400 font-bold text-xs">（1日目のノルマ）</span>
            </label>
            {exercise && (
              <p className="text-xs text-app-blue font-bold mb-2">単位：{unit}</p>
            )}
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setInitial(v => String(Math.max(1, Number(v) - 1)))}
                className="app-btn w-12 h-12 bg-gray-100 text-gray-600 rounded-2xl text-xl font-bold active:scale-90">−</button>
              <div className="flex-1 flex items-center gap-2 justify-center">
                <input type="number" value={initial} onChange={e => setInitial(e.target.value)}
                  min={1} max={9999}
                  className="w-24 text-center text-4xl font-bold text-app-navy bg-transparent focus:outline-none" />
                <span className="text-gray-400 font-bold text-lg">{unit}</span>
              </div>
              <button type="button" onClick={() => setInitial(v => String(Math.min(9999, Number(v) + 1)))}
                className="app-btn w-12 h-12 bg-app-navy text-white rounded-2xl text-xl font-bold active:scale-90">＋</button>
            </div>
            <p className="text-gray-400 text-xs font-bold mt-1.5 text-center">毎日1{unit}ずつ自動で増えます</p>
          </div>

          <button type="submit" disabled={!canSubmit}
            className={`w-full rounded-2xl py-5 text-base font-bold transition-all ${
              canSubmit ? 'bg-app-navy text-white active:scale-95' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
            style={canSubmit ? { boxShadow: '0 4px 16px rgba(0,0,0,0.15)' } : {}}>
            {loading ? '作成中...' : 'グループを作る'}
          </button>
        </form>
      </div>
    </div>
  )
}
