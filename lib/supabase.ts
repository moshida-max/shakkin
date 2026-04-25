import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Supabase env vars missing:', { SUPABASE_URL: !!SUPABASE_URL, SUPABASE_KEY: !!SUPABASE_KEY })
}

export const supabase = createClient(
  SUPABASE_URL ?? '',
  SUPABASE_KEY ?? ''
)

/** 今日の日付 JST */
export function getToday(): string {
  const now = new Date()
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return jst.toISOString().split('T')[0]
}

/** 匿名セッションを取得 or 作成してユーザーIDを返す */
export async function getOrCreateUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user.id) return session.user.id
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error || !data.user) throw new Error(error?.message ?? 'signInAnonymously failed: no user returned')
  return data.user.id
}

/** プロフィールをSupabaseに同期 */
export async function syncProfile(userId: string, name: string, avatar: string) {
  await supabase.from('profiles').upsert({ id: userId, name, avatar }, { onConflict: 'id' })
}

/** ランダムな6文字の招待コードを生成 */
export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}
