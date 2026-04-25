'use client'
import { useRouter } from 'next/navigation'

interface PageHeaderProps {
  title: string
  subtitle?: string
  color?: string
  onBack?: () => void
  rightSlot?: React.ReactNode
}

export default function PageHeader({ title, subtitle, color = 'bg-rh-pink', onBack, rightSlot }: PageHeaderProps) {
  const router = useRouter()

  return (
    <div className={`${color} px-5 pt-safe pb-5`}>
      <div className="flex items-center justify-between mb-1">
        <button
          onClick={onBack ?? (() => router.back())}
          className="text-white/80 font-body text-sm py-1 -ml-1"
        >
          ← もどる
        </button>
        {rightSlot}
      </div>
      <div className="font-display text-3xl text-white leading-tight">{title}</div>
      {subtitle && <div className="font-body text-white/70 text-sm mt-0.5">{subtitle}</div>}
    </div>
  )
}
