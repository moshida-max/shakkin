'use client'
import { MOCK_FEED_EVENTS, TODAY } from '@/lib/mock-data'
import BottomNav from '@/components/BottomNav'
import StickFigure from '@/components/StickFigure'
import type { FeedEvent } from '@/lib/types'
import type { Pose } from '@/components/StickFigure'

function eventText(ev: FeedEvent): { emoji: string; text: string; pose: Pose } {
  switch (ev.type) {
    case 'cleared':
      return { emoji: '🎉', text: `${ev.user.name}が ${ev.group.exercise_name} ${ev.reps}回でノルマ達成！`, pose: 'celebrate' }
    case 'rep_record':
      return { emoji: '💪', text: `${ev.user.name}が ${ev.group.exercise_name} ${ev.reps}回を記録`, pose: 'workout' }
    case 'joined':
      return { emoji: '👋', text: `${ev.user.name}が「${ev.group.name}」に参加！`, pose: 'run' }
    case 'blacklisted':
      return { emoji: '💀', text: `${ev.user.name}がブラックリスト入り...`, pose: 'sad' }
  }
}

function timeLabel(createdAt: string): string {
  const d = new Date(createdAt)
  const today = new Date(TODAY)
  const diffDays = Math.floor((today.getTime() - d.getTime()) / 86400000)
  const hm = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  if (diffDays === 0) return `今日 ${hm}`
  if (diffDays === 1) return `昨日 ${hm}`
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const AVATAR_COLORS: Record<string, string> = {
  'user-1': '#FF8FAD',
  'user-2': '#74B9FF',
  'user-3': '#FFCD3C',
  'user-4': '#5EC462',
}

export default function FeedPage() {
  const events = MOCK_FEED_EVENTS

  return (
    <div className="min-h-screen bg-app-purple flex flex-col">
      {/* ヘッダー */}
      <div className="pt-safe px-5 pb-4">
        <div className="flex items-end justify-between">
          <div className="app-pill-title text-xl">フィード</div>
          <StickFigure pose="run" size={52} color="#1A1A2E" />
        </div>
        <div className="text-app-navy/60 font-bold text-sm mt-1">みんなの活動まとめ</div>
      </div>

      {/* イベント一覧 */}
      <div className="flex-1 px-4 pb-28 space-y-3">
        {events.map(ev => {
          const { emoji, text, pose } = eventText(ev)
          const avatarColor = AVATAR_COLORS[ev.user.id] ?? '#D1D5DB'
          const isCleared = ev.type === 'cleared'
          const isBlack   = ev.type === 'blacklisted'

          return (
            <div key={ev.id} className="app-card p-4 flex items-start gap-3">
              {/* アバター */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: isBlack ? '#FEE2E2' : avatarColor }}>
                <StickFigure pose={pose} size={34} color="#1A1A2E" />
              </div>
              {/* テキスト */}
              <div className="flex-1 min-w-0">
                <div className={`font-bold text-sm leading-snug ${isBlack ? 'text-app-red' : 'text-app-navy'}`}>
                  <span className="mr-1">{emoji}</span>
                  {text}
                </div>
                <div className="text-gray-400 text-xs font-bold mt-1 flex items-center gap-1.5">
                  <span>{ev.group.name}</span>
                  <span>·</span>
                  <span>{timeLabel(ev.createdAt)}</span>
                </div>
              </div>
              {isCleared && <span className="text-xl shrink-0">⭐</span>}
            </div>
          )
        })}
      </div>

      <BottomNav active="feed" />
    </div>
  )
}
