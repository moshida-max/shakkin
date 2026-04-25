import type { Membership, RepEntry, UserStatus } from './types'

function toUtcMs(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

export function daysElapsed(startDate: string, today: string): number {
  return Math.max(0, Math.floor((toUtcMs(today) - toUtcMs(startDate)) / 86400000))
}

export function todayNorm(membership: Membership, today: string): number {
  const elapsed = daysElapsed(membership.start_date, today)
  return membership.initial_reps + elapsed
}

export function sumReps(entries: RepEntry[], date: string): number {
  return entries.filter(e => e.date === date).reduce((s, e) => s + e.reps, 0)
}

export function calcStatus(
  membership: Membership,
  todayRepsCount: number,
  norm: number,
): UserStatus {
  if (membership.state === 'blacklisted') return 'blacklisted'
  if (membership.state === 'bankrupt_cooldown') return 'bankrupt_cooldown'
  if (todayRepsCount >= norm) return 'cleared'
  if (todayRepsCount > 0) return 'partial'
  return 'untouched'
}

export function calcApproxStats(
  membership: Membership,
  entries: RepEntry[],
  today: string,
): { approxDebt: number; approxSavings: number; totalReps: number } {
  let debt       = 0
  let friendship = 0

  const startMs     = toUtcMs(membership.start_date)
  const todayMs     = toUtcMs(today)
  const yesterdayMs = todayMs - 86400000 // 今日はまだ終わっていないので除外

  // 借筋は昨日まで（今日はまだ終わっていないので加算しない）
  for (let ms = startMs; ms <= yesterdayMs; ms += 86400000) {
    const dateStr = new Date(ms).toISOString().split('T')[0]
    const elapsed = Math.floor((ms - startMs) / 86400000)
    const norm    = membership.initial_reps + elapsed
    const done    = sumReps(entries, dateStr)

    if (done >= norm) {
      const surplus  = done - norm
      const debtPaid = Math.min(debt, surplus)
      debt           -= debtPaid
      friendship     += surplus - debtPaid
    } else {
      debt += norm - done
    }
  }

  // 友情・借筋返済は今日の記録も即時反映（借筋の加算は今日はしない）
  const todayElapsed = Math.floor((todayMs - startMs) / 86400000)
  const todayNormVal = membership.initial_reps + todayElapsed
  const todayDone    = sumReps(entries, today)
  if (todayDone > todayNormVal) {
    const surplus  = todayDone - todayNormVal
    const debtPaid = Math.min(debt, surplus)
    debt           -= debtPaid
    friendship     += surplus - debtPaid
  }

  const totalReps = entries.reduce((s, e) => s + e.reps, 0)
  return { approxDebt: debt, approxSavings: friendship, totalReps }
}
