import type { UserStatus } from '@/lib/types'

const CONFIG: Partial<Record<UserStatus, { label: string; bg: string; text: string }>> = {
  cleared:           { label: '返済！',   bg: 'bg-app-green', text: 'text-white' },
  blacklisted:       { label: 'ブラック', bg: 'bg-app-red',   text: 'text-white' },
  bankrupt_cooldown: { label: '破産中',   bg: 'bg-gray-600',  text: 'text-white' },
}

export default function StatusBadge({ status, size = 'md' }: { status: UserStatus; size?: 'sm' | 'md' }) {
  const c = CONFIG[status]
  if (!c) return null
  return (
    <span className={`app-tag ${c.bg} ${c.text} ${size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1'}`}>
      {c.label}
    </span>
  )
}
