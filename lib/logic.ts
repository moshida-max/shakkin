import type { Membership, RepEntry, UserStatus } from './types'

export function daysElapsed(startDate: string, today: string): number {
  const start = new Date(startDate)
  const end   = new Date(today)
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86400000))
}

export function todayNorm(membership: Membership, today: string): number {
  const elapsed = daysElapsed(membership.start_date, today)
  return membership.initial_reps + elapsed + membership.debt_balance
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
  // 累計差分で計算（余剰が過去の借金を相殺する）
  let netBalance = 0

  const start = new Date(membership.start_date)
  const end   = new Date(today)

  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    const elapsed = daysElapsed(membership.start_date, dateStr)
    const norm    = membership.initial_reps + elapsed
    const done    = sumReps(entries, dateStr)
    netBalance   += done - norm
  }

  const approxDebt    = netBalance < 0 ? Math.abs(netBalance) : 0
  const approxSavings = netBalance > 0 ? netBalance : 0
  const totalReps     = entries.reduce((s, e) => s + e.reps, 0)
  return { approxDebt, approxSavings, totalReps }
}
