'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, getOrCreateUserId, getToday, syncProfile } from '@/lib/supabase'

function getUnit(name: string) {
  if (/プランク|秒/.test(name)) return '秒'
  if (/ランニング|km|マラソン|走/.test(name)) return 'km'
  return '回'
}


function JoinForm({ group, onJoin, error, joining }: {
  group: any
  onJoin: (name: string, initial: number, todayNorm: number | null, debt: number) => void
  error: string
  joining: boolean
}) {
  const unit = getUnit(group.exercise_name)

  const [name,         setName]         = useState(() => {
    if (typeof window === 'undefined') return ''
    try { return JSON.parse(localStorage.getItem('kk_profile') || '{}').name || '' } catch { return '' }
  })
  const [initialStr,   setInitialStr]   = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [normStr,      setNormStr]      = useState('')
  const [debtStr,      setDebtStr]      = useState('')

  const initial   = parseInt(initialStr) || 0
  const todayNorm = parseInt(normStr)    || 0
  const debt      = parseInt(debtStr)    || 0

  const normError = normStr && todayNorm > 0 && todayNorm < initial
    ? `今日のノルマは初期${unit}数（${initial}）以上にしてください` : ''

  const canJoin = name.trim().length > 0 && initial > 0 && !joining && !normError

  const handleSubmit = () => {
    onJoin(
      name.trim(),
      initial,
      normStr && todayNorm >= initial ? todayNorm : null,
      debtStr ? debt : 0,
    )
  }

  return (
    <div className="space-y-4">
      {/* 名前 */}
      <div>
        <label className="block font-bold text-app-navy text-sm mb-1">あなたの名前</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="名前を入力"
          maxLength={20}
          className="w-full bg-app-gray rounded-2xl px-4 py-3 font-bold text-app-navy text-lg focus:outline-none"
        />
      </div>

      {/* 初期回数 */}
      <div>
        <label className="block font-bold text-app-navy text-sm mb-1">初期{unit}数</label>
        <p className="text-gray-400 text-xs font-bold mb-2">1日目のノルマ。毎日1{unit}ずつ増えます。</p>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={initialStr}
          onChange={e => setInitialStr(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="例：10"
          autoComplete="off"
          className="w-full bg-app-gray rounded-2xl px-4 py-3 font-bold text-app-navy text-2xl text-center focus:outline-none"
        />
      </div>

      {/* 上級設定トグル */}
      <button
        type="button"
        onClick={() => setShowAdvanced(v => !v)}
        className="flex items-center gap-1.5 text-gray-400 text-xs font-bold w-full">
        <span className="text-[10px]">{showAdvanced ? '▾' : '▸'}</span>
        以前からやっている場合の設定（任意）
      </button>

      {/* 上級設定フィールド */}
      {showAdvanced && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-4 space-y-4">
          <p className="text-gray-400 text-xs font-bold leading-relaxed">
            このサービスを使う前から続けていた場合、現在の状況に合わせて設定できます。
          </p>

          {/* 今日のノルマ */}
          <div>
            <label className="block font-bold text-app-navy text-sm mb-1">
              今日のノルマ{unit}数
              <span className="ml-1 text-gray-400 font-normal text-xs">（任意）</span>
            </label>
            <p className="text-gray-400 text-xs font-bold mb-2">
              現在何{unit}がノルマか入力すると、開始日を自動調整します。
            </p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={normStr}
              onChange={e => setNormStr(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder={initial > 0 ? `例：${initial + 30}` : '例：40'}
              autoComplete="off"
              className="w-full bg-app-gray rounded-2xl px-4 py-3 font-bold text-app-navy text-2xl text-center focus:outline-none"
            />
            {normError && <div className="text-app-red text-xs font-bold mt-1">{normError}</div>}
            {normStr && todayNorm >= initial && initial > 0 && (
              <div className="text-app-green text-xs font-bold mt-1">
                → 1日目のノルマを {todayNorm} に設定（毎日+1{unit}ずつ増加）
              </div>
            )}
          </div>

          {/* 現在の借筋 */}
          <div>
            <label className="block font-bold text-app-navy text-sm mb-1">
              現在の借筋数
              <span className="ml-1 text-gray-400 font-normal text-xs">（任意）</span>
            </label>
            <p className="text-gray-400 text-xs font-bold mb-2">
              すでに積み上がっている借筋があれば入力してください。
            </p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={debtStr}
              onChange={e => setDebtStr(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="例：50"
              autoComplete="off"
              className="w-full bg-app-gray rounded-2xl px-4 py-3 font-bold text-app-red text-2xl text-center focus:outline-none"
            />
          </div>
        </div>
      )}

      {error && <div className="text-app-red text-sm font-bold">{error}</div>}

      <button
        onClick={handleSubmit}
        disabled={!canJoin}
        className={`w-full rounded-2xl py-4 font-bold text-base transition-all active:scale-95 ${
          canJoin ? 'bg-app-navy text-white' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
        }`}
        style={canJoin ? { boxShadow: '0 4px 16px rgba(0,0,0,0.15)' } : {}}>
        {joining ? '参加中...' : `${group.name} に参加する`}
      </button>
    </div>
  )
}

export default function JoinGroupPage() {
  const { inviteCode } = useParams<{ inviteCode: string }>()
  const router = useRouter()

  const hasCode = inviteCode !== '---'

  const [group,    setGroup]    = useState<any>(null)
  const [joining,  setJoining]  = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(hasCode)

  const [code,      setCode]      = useState('')
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (hasCode) autoSearch()
  }, [])

  async function autoSearch() {
    const { data } = await supabase
      .from('groups').select('*').eq('invite_code', inviteCode.toUpperCase()).single()
    if (data) setGroup(data)
    else setError('グループが見つかりませんでした')
    setLoading(false)
  }

  const handleSearch = async () => {
    if (code.length !== 6) return
    setSearching(true)
    setError('')
    setGroup(null)
    const { data } = await supabase
      .from('groups').select('*').eq('invite_code', code.toUpperCase()).single()
    if (data) setGroup(data)
    else setError('グループが見つかりませんでした')
    setSearching(false)
  }

  const handleJoin = async (name: string, initial: number, todayNorm: number | null, debt: number) => {
    if (!group || !name || initial <= 0) return
    setJoining(true)
    setError('')
    try {
      const uid   = await getOrCreateUserId()
      const today = getToday()

      // プロフィール同期
      const saved = typeof window !== 'undefined' ? localStorage.getItem('kk_profile') : null
      const p = saved ? JSON.parse(saved) : {}
      const avatar = p.avatar || name[0] || '?'
      localStorage.setItem('kk_profile', JSON.stringify({ name, avatar }))
      await syncProfile(uid, name, avatar)

      const { data: existing } = await supabase
        .from('memberships').select('id').eq('user_id', uid).eq('group_id', group.id).single()
      if (existing) { router.push('/home'); return }

      // 今日のノルマが指定されていれば initial_reps をそれに合わせる
      // start_date は常に今日にする（過去日を使うと空記録が大量の借筋として計算されるため）
      const effectiveInitial = todayNorm !== null && todayNorm >= initial ? todayNorm : initial

      const { error: mErr } = await supabase
        .from('memberships')
        .insert({
          user_id: uid,
          group_id: group.id,
          initial_reps: effectiveInitial,
          start_date: today,
          debt_balance: debt > 0 ? debt : 0,
        })
      if (mErr) throw new Error(mErr.message)
      router.push('/home')
    } catch (e: any) {
      setError(e.message || '参加に失敗しました')
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-app-teal flex items-center justify-center">
        <div className="font-bold text-app-navy/40 animate-pulse">よみこみ中...</div>
      </div>
    )
  }

  if (hasCode && group) {
    return (
      <div className="min-h-screen bg-app-teal flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="app-card overflow-hidden">
            <div className="bg-app-yellow px-5 py-5">
              <div className="text-app-navy/60 text-xs font-bold mb-1">グループに招待されています</div>
              <div className="font-bold text-app-navy text-2xl">{group.name}</div>
              <div className="text-app-navy/60 text-sm font-bold mt-0.5">{group.exercise_name}</div>
            </div>
            <div className="p-5">
              <JoinForm group={group} onJoin={handleJoin} error={error} joining={joining} />
              <button onClick={() => router.push('/home')} className="w-full pt-4 font-bold text-gray-400 text-sm">
                ホームに戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (hasCode && !group) {
    return (
      <div className="min-h-screen bg-app-teal flex flex-col items-center justify-center px-6">
        <div className="app-card p-6 w-full max-w-sm text-center">
          <div className="font-bold text-app-red text-lg mb-2">グループが見つかりません</div>
          <div className="text-gray-400 text-sm mb-5">招待リンクが無効か、グループが削除されています。</div>
          <button onClick={() => router.push('/home')}
            className="w-full rounded-2xl py-3 bg-app-navy text-white font-bold active:scale-95 transition-all">
            ホームへ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-app-teal flex flex-col">
      <div className="pt-safe px-5 pb-4">
        <button onClick={() => router.push('/home')} className="text-app-navy/60 font-bold text-sm mb-3 block">← ホームへ</button>
        <div className="app-pill-title text-xl">グループに参加</div>
      </div>

      <div className="flex-1 px-4 space-y-4 pb-10">
        <div className="app-card p-5">
          <label className="block font-bold text-app-navy text-sm mb-3">招待コード（6文字）</label>
          <div className="flex gap-2 mb-3">
            <input type="text" value={code}
              onChange={e => {
                setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))
                setGroup(null); setError('')
              }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="AB12CD" maxLength={6}
              className="app-input flex-1 text-center text-3xl font-bold tracking-[0.3em] uppercase" />
            <button onClick={handleSearch} disabled={code.length !== 6 || searching}
              className={`rounded-2xl px-5 py-3 font-bold text-sm transition-all active:scale-95 ${
                code.length === 6 && !searching ? 'bg-app-navy text-white' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}>
              {searching ? '...' : '検索'}
            </button>
          </div>
          {error && !group && <div className="text-app-red text-sm font-bold">{error}</div>}
          {!group && !error && (
            <p className="text-gray-400 text-xs font-bold text-center">招待コードを入力しよう</p>
          )}
        </div>

        {group && (
          <div className="app-card overflow-hidden">
            <div className="bg-app-yellow px-5 py-4">
              <div className="font-bold text-app-navy text-xl">{group.name}</div>
              <div className="text-app-navy/60 text-sm">{group.exercise_name}</div>
            </div>
            <div className="p-5">
              <JoinForm group={group} onJoin={handleJoin} error={error} joining={joining} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
