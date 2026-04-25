import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL    ?? 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key'
)

/** 今日の日付 JST */
export function getToday(): string {
  const now = new Date()
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return jst.toISOString().split('T')[0]
}

const USER_ID_KEY = 'shakkin_user_id'

/** localStorageからユーザーIDを取得 or 生成（Supabase authなし） */
export function getOrCreateUserId(): Promise<string> {
  if (typeof window === 'undefined') return Promise.resolve('server')
  let id = localStorage.getItem(USER_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(USER_ID_KEY, id)
  }
  return Promise.resolve(id)
}

/** プロフィールをSupabaseに同期 */
export async function syncProfile(userId: string, name: string, avatar: string) {
  await supabase.from('profiles').upsert({ id: userId, name, avatar }, { onConflict: 'id' })
}

/** ランダムな6文字の招待コードを生成 */
export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}
