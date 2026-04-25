'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, getOrCreateUserId, getToday, syncProfile } from '@/lib/supabase'

function getUnit(name: string) {
  if (/プランク|秒/.test(name)) return '秒'
  if (/ランニング|km|マラソン|走/.test(name)) return 'km'
  return '回'
}

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

      // プロフィール同期
      const saved = typeof window !== 'undefined' ? localStorage.getItem('kk_profile') : null
      const p = saved ? JSON.parse(saved) : {}
      await syncProfile(uid, p.name || '名無し', p.avatar || '?')

      // すでに参加済みなら直接移動
      const { data: existing } = await supabase
        .from('memberships').select('id').eq('user_id', uid).eq('group_id', found.id).single()
      if (existing) { router.push(`/groups/${found.id}`); return }

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

  const unit = found ? getUnit(found.exercise_name) : '回'

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
          {error && <div className="text-app-red text-sm font-bold">{error}</div>}
          {!found && !error && (
            <p className="text-gray-400 text-xs font-bold text-center">招待コードを入力しよう</p>
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
                <label className="block font-bold text-app-navy text-sm mb-1">初期{unit}数</label>
                <p className="text-gray-400 text-xs font-bold mb-3">1日目のノルマ。毎日1{unit}ずつ増えます。</p>
                <input
                  type="number"
                  value={initial}
                  onChange={e => setInitial(Math.max(1, Math.min(9999, Number(e.target.value))))}
                  min={1} max={9999}
                  inputMode="numeric"
                  className="w-full bg-app-gray rounded-2xl px-4 py-3 font-bold text-app-navy text-2xl text-center focus:outline-none"
                />
              </div>
              <button onClick={handleJoin} disabled={joining}
                className="w-full rounded-2xl py-4 font-bold text-base bg-app-navy text-white active:scale-95 transition-all disabled:opacity-50"
                style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                {joining ? '参加中...' : '参加する'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
