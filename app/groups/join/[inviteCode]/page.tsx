'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, getOrCreateUserId, getToday } from '@/lib/supabase'

export default function JoinGroupPage() {
  const { inviteCode } = useParams<{ inviteCode: string }>()
  const router = useRouter()

  const isBlank = inviteCode === '---'
  const [code,      setCode]      = useState(isBlank ? '' : inviteCode.toUpperCase())
  const [initial,   setInitial]   = useState(10)
  const [searching, setSearching] = useState(false)
  const [found,     setFound]     = useState<any>(null)
  const [joining,   setJoining]   = useState(false)
  const [error,     setError]     = useState('')

  const handleSearch = async () => {
    if (code.length !== 6) return
    setSearching(true)
    setError('')
    setFound(null)

    const { data: group } = await supabase
      .from('groups').select('*').eq('invite_code', code).single()

    if (group) setFound(group)
    else setError('グループが見つかりませんでした')
    setSearching(false)
  }

  const handleJoin = async () => {
    if (!found) return
    setJoining(true)
    setError('')

    try {
      const uid   = await getOrCreateUserId()
      const today = getToday()

      // すでに参加していないか確認
      const { data: existing } = await supabase
        .from('memberships')
        .select('id').eq('user_id', uid).eq('group_id', found.id).single()

      if (existing) {
        router.push(`/groups/${found.id}`)
        return
      }

      const { error: mErr } = await supabase
        .from('memberships')
        .insert({ user_id: uid, group_id: found.id, initial_reps: initial, start_date: today })

      if (mErr) throw new Error(mErr.message)
      router.push(`/groups/${found.id}`)
    } catch (e: any) {
      setError(e.message || '参加に失敗しました')
      setJoining(false)
    }
  }

  return (
    <div className="min-h-screen bg-app-teal flex flex-col">
      <div className="pt-safe px-5 pb-4">
        <button onClick={() => router.back()} className="text-app-navy/60 font-bold text-sm mb-3 block">← もどる</button>
        <div className="app-pill-title text-xl">グループに参加</div>
      </div>

      <div className="flex-1 px-4 space-y-4 pb-10">
        <div className="app-card p-5">
          <label className="block font-bold text-app-navy text-sm mb-3">招待コード（6文字）</label>
          <div className="flex gap-2 mb-3">
            <input type="text" value={code}
              onChange={e => {
                setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))
                setFound(null); setError('')
              }}
              placeholder="AB12CD" maxLength={6}
              className="app-input flex-1 text-center text-3xl font-bold tracking-[0.3em] uppercase" />
            <button onClick={handleSearch} disabled={code.length !== 6 || searching}
              className={`rounded-2xl px-5 py-3 font-bold text-sm transition-all active:scale-95 ${
                code.length === 6 && !searching ? 'bg-app-navy text-white' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}>
              {searching ? '...' : '検索'}
            </button>
          </div>
          {error && <div className="text-app-red text-sm font-bold">😢 {error}</div>}
          {!found && !error && (
            <p className="text-gray-400 text-xs font-bold text-center">📩 招待コードを入力しよう</p>
          )}
        </div>

        {found && (
          <div className="app-card overflow-hidden">
            <div className="bg-app-yellow px-5 py-4">
              <div className="font-bold text-app-navy text-xl">{found.name}</div>
              <div className="text-app-navy/60 text-sm">{found.exercise_name}</div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block font-bold text-app-navy text-sm mb-2">初期回数</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setInitial(v => Math.max(1, v - 1))}
                    className="app-btn w-12 h-12 bg-gray-100 text-gray-600 rounded-2xl text-xl font-bold active:scale-90">−</button>
                  <div className="flex-1 text-center">
                    <span className="text-4xl font-bold text-app-navy">{initial}</span>
                    <span className="text-gray-400 font-bold ml-1">回</span>
                  </div>
                  <button type="button" onClick={() => setInitial(v => Math.min(999, v + 1))}
                    className="app-btn w-12 h-12 bg-app-navy text-white rounded-2xl text-xl font-bold active:scale-90">＋</button>
                </div>
              </div>
              <button onClick={handleJoin} disabled={joining}
                className="w-full rounded-2xl py-4 font-bold text-base bg-app-navy text-white active:scale-95 transition-all"
                style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                {joining ? '参加中...' : '🤝 参加する'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
