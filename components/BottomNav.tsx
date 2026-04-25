'use client'
import Link from 'next/link'

export type NavTab = 'home' | 'feed' | 'history' | 'profile'

const ITEMS: { key: NavTab; label: string; href: string; icon: string; activeIcon: string }[] = [
  { key: 'home',    label: 'ホーム',    href: '/home',    icon: '🏠', activeIcon: '🏠' },
  { key: 'feed',    label: 'フィード',  href: '/feed',    icon: '📣', activeIcon: '📣' },
  { key: 'history', label: '履歴',      href: '/history', icon: '📅', activeIcon: '📅' },
  { key: 'profile', label: 'マイページ', href: '/profile', icon: '👤', activeIcon: '👤' },
]

export default function BottomNav({ active }: { active: NavTab }) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-50"
      style={{ background: 'white', boxShadow: '0 -2px 20px rgba(0,0,0,0.08)' }}>
      <div className="flex items-stretch justify-around pb-safe">
        {ITEMS.map(item => {
          const isActive = item.key === active
          return (
            <Link
              key={item.key}
              href={item.href}
              className="flex flex-col items-center gap-0.5 pt-3 pb-1 px-4 flex-1"
            >
              <div className={`text-2xl leading-none transition-transform ${isActive ? 'scale-110' : 'opacity-50'}`}>
                {isActive ? item.activeIcon : item.icon}
              </div>
              <span className={`text-[10px] font-bold leading-none mt-1 ${
                isActive ? 'text-app-navy' : 'text-gray-400'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-4 h-1 rounded-full bg-app-navy mt-0.5" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
