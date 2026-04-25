export type UserStatus =
  | 'cleared'
  | 'partial'
  | 'untouched'
  | 'blacklisted'
  | 'bankrupt_cooldown'

export type MembershipState = 'active' | 'blacklisted' | 'bankrupt_cooldown'

export interface User {
  id: string
  name: string
  icon_url: string | null
}

export interface Group {
  id: string
  name: string
  exercise_name: string
  is_public: boolean
  created_by: string
  invite_code: string
}

export interface Membership {
  id: string
  user_id: string
  group_id: string
  initial_reps: number
  start_date: string
  state: MembershipState
  debt_balance: number
  savings_balance: number
  consecutive_clear_days: number
  total_cleared_reps: number
}

export interface RepEntry {
  id: string
  membership_id: string
  date: string
  reps: number
}

export interface MemberStats {
  membership: Membership
  user: User
  todayNorm: number
  todayReps: number
  status: UserStatus
  approxDebt: number
  approxSavings: number
  totalReps: number
}

export interface FeedEvent {
  id: string
  user: User
  group: Group
  type: 'rep_record' | 'cleared' | 'joined' | 'blacklisted'
  reps?: number
  createdAt: string
}
