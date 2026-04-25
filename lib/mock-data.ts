import type { User, Group, Membership, RepEntry, MemberStats, FeedEvent } from './types'
import { calcStatus, calcApproxStats, todayNorm as calcTodayNorm, sumReps } from './logic'

export const TODAY = '2026-04-25'

export const MOCK_USER: User = { id: 'user-1', name: 'あきまる', icon_url: null }

export const MOCK_USERS: User[] = [
  MOCK_USER,
  { id: 'user-2', name: 'ゆうき',   icon_url: null },
  { id: 'user-3', name: 'さくら',   icon_url: null },
  { id: 'user-4', name: 'けんた', icon_url: null },
]

export const MOCK_GROUPS: Group[] = [
  {
    id: 'group-1',
    name: '腕立て同盟',
    exercise_name: '腕立て伏せ',
    is_public: true,
    created_by: 'user-1',
    invite_code: 'AB12CD',
  },
  {
    id: 'group-2',
    name: 'スクワット部',
    exercise_name: 'スクワット',
    is_public: false,
    created_by: 'user-2',
    invite_code: 'XY98ZW',
  },
]

export const MOCK_MEMBERSHIPS: Membership[] = [
  {
    id: 'mem-1', user_id: 'user-1', group_id: 'group-1',
    initial_reps: 10, start_date: '2026-04-15', state: 'active',
    debt_balance: 0, savings_balance: 0,
    consecutive_clear_days: 3, total_cleared_reps: 0,
  },
  {
    id: 'mem-2', user_id: 'user-2', group_id: 'group-1',
    initial_reps: 15, start_date: '2026-04-15', state: 'active',
    debt_balance: 0, savings_balance: 0,
    consecutive_clear_days: 7, total_cleared_reps: 0,
  },
  {
    id: 'mem-3', user_id: 'user-3', group_id: 'group-1',
    initial_reps: 10, start_date: '2026-04-18', state: 'blacklisted',
    debt_balance: 0, savings_balance: 0,
    consecutive_clear_days: 0, total_cleared_reps: 0,
  },
  {
    id: 'mem-4', user_id: 'user-1', group_id: 'group-2',
    initial_reps: 20, start_date: '2026-04-20', state: 'active',
    debt_balance: 0, savings_balance: 0,
    consecutive_clear_days: 0, total_cleared_reps: 0,
  },
  {
    id: 'mem-5', user_id: 'user-4', group_id: 'group-2',
    initial_reps: 20, start_date: '2026-04-20', state: 'active',
    debt_balance: 0, savings_balance: 0,
    consecutive_clear_days: 1, total_cleared_reps: 0,
  },
]

export const MOCK_REP_ENTRIES: RepEntry[] = [
  { id: 'r1', membership_id: 'mem-1', date: '2026-04-25', reps: 15 },
  { id: 'r2', membership_id: 'mem-1', date: '2026-04-24', reps: 25 },
  { id: 'r3', membership_id: 'mem-1', date: '2026-04-23', reps: 23 },
  { id: 'r4', membership_id: 'mem-1', date: '2026-04-22', reps: 22 },
  { id: 'r5', membership_id: 'mem-1', date: '2026-04-21', reps: 20 },
  { id: 'r6', membership_id: 'mem-2', date: '2026-04-25', reps: 30 },
  { id: 'r7', membership_id: 'mem-2', date: '2026-04-24', reps: 28 },
  { id: 'r8', membership_id: 'mem-2', date: '2026-04-23', reps: 27 },
  { id: 'r9', membership_id: 'mem-4', date: '2026-04-25', reps: 5  },
  { id: 'r10',membership_id: 'mem-5', date: '2026-04-25', reps: 25 },
]

function buildStats(m: Membership): MemberStats {
  const user    = MOCK_USERS.find(u => u.id === m.user_id)!
  const entries = MOCK_REP_ENTRIES.filter(e => e.membership_id === m.id)
  const norm    = calcTodayNorm(m, TODAY)
  const today   = sumReps(entries, TODAY)
  const status  = calcStatus(m, today, norm)
  const { approxDebt, approxSavings, totalReps } = calcApproxStats(m, entries, TODAY)
  return { membership: m, user, todayNorm: norm, todayReps: today, status, approxDebt, approxSavings, totalReps }
}

const allStats = MOCK_MEMBERSHIPS.map(buildStats)

export const MOCK_MEMBER_STATS: Record<string, MemberStats[]> = {
  'group-1': allStats.filter(s => s.membership.group_id === 'group-1'),
  'group-2': allStats.filter(s => s.membership.group_id === 'group-2'),
}

export const MOCK_GROUP_STATS = MOCK_GROUPS
  .map(group => ({
    group,
    myStats: MOCK_MEMBER_STATS[group.id]?.find(s => s.user.id === 'user-1'),
  }))
  .filter((gs): gs is { group: Group; myStats: MemberStats } => gs.myStats !== undefined)

export const MOCK_FEED_EVENTS: FeedEvent[] = [
  { id: 'f1', user: MOCK_USERS[1], group: MOCK_GROUPS[0], type: 'cleared', reps: 30, createdAt: '2026-04-25T08:32:00' },
  { id: 'f2', user: MOCK_USERS[3], group: MOCK_GROUPS[1], type: 'rep_record', reps: 25, createdAt: '2026-04-25T07:15:00' },
  { id: 'f3', user: MOCK_USER,     group: MOCK_GROUPS[0], type: 'rep_record', reps: 15, createdAt: '2026-04-25T06:45:00' },
  { id: 'f4', user: MOCK_USERS[2], group: MOCK_GROUPS[0], type: 'blacklisted', createdAt: '2026-04-24T23:59:00' },
  { id: 'f5', user: MOCK_USERS[1], group: MOCK_GROUPS[0], type: 'cleared', reps: 28, createdAt: '2026-04-24T09:10:00' },
  { id: 'f6', user: MOCK_USER,     group: MOCK_GROUPS[0], type: 'cleared', reps: 25, createdAt: '2026-04-24T07:55:00' },
  { id: 'f7', user: MOCK_USER,     group: MOCK_GROUPS[0], type: 'joined', createdAt: '2026-04-15T12:00:00' },
]
