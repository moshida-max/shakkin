import type { UserStatus } from '@/lib/types'

const CONFIG: Record<UserStatus, { label: string; bg: string; text: string }> = {
  cleared:           { label: '返済済み', bg: 'bg-app-green',  text: 'text-white' },
  partial:           { label: '返済中',   bg: 'bg-app-yellow', text: 'text-app-navy' },
  untouched:         { label: '未返済',   bg: 'bg-red-100',    text: 'text-app-red' },
  blacklisted:       { label: 'ブラック', bg: 'bg-app-red',    text: 'text-white' },
  bankrupt_cooldown: { label: '破産中',   bg: 'bg-gray-500',   text: 'text-white' },
}

export default function StatusBadge({ status, size = 'md' }: { status: UserStatus; size?: 'sm' | 'md' }) {
  const c = CONFIG[status]
  return (
    <span className={`app-tag ${c.bg} ${c.text} ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-sm px-3 py-1'}`}>
      {c.label}
    </span>
  )
}
