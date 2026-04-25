'use client'
import { MOCK_MEMBERSHIPS, MOCK_REP_ENTRIES, MOCK_GROUPS, TODAY } from '@/lib/mock-data'
import { daysElapsed } from '@/lib/logic'
import BottomNav from '@/components/BottomNav'
import StickFigure from '@/components/StickFigure'

const MY_USER_ID = 'user-1'

interface DayRecord {
  date: string
  displayDate: string
  dow: string
  entries: { groupName: string; exercise: string; reps: number; norm: number }[]
}

function buildHistory(): DayRecord[] {
  const myMems = MOCK_MEMBERSHIPS.filter(m => m.user_id === MY_USER_ID)
  const days: Record<string, DayRecord> = {}

  myMems.forEach(mem => {
    const group   = MOCK_GROUPS.find(g => g.id === mem.group_id)!
    const entries = MOCK_REP_ENTRIES.filter(e => e.membership_id === mem.id)
    const start   = new Date(mem.start_date)
    const end     = new Date(TODAY)

    for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const elapsed = daysElapsed(mem.start_date, dateStr)
      const norm    = mem.initial_reps + elapsed
      const reps    = entries.filter(e => e.date === dateStr).reduce((s, e) => s + e.reps, 0)
      const dt      = new Date(dateStr)
      const DOW     = ['日','月','火','水','木','金','土'][dt.getDay()]

      if (!days[dateStr]) {
        days[dateStr] = {
          date: dateStr,
          displayDate: `${dt.getMonth()+1}月${dt.getDate()}日`,
          dow: DOW,
          entries: [],
        }
      }
      days[dateStr].entries.push({ groupName: group.name, exercise: group.exercise_name, reps, norm })
    }
  })

  return Object.values(days).sort((a, b) => b.date.localeCompare(a.date))
}

export default function HistoryPage() {
  const records = buildHistory()

  return (
    <div className="min-h-screen bg-app-orange flex flex-col">
      {/* ヘッダー */}
      <div className="pt-safe px-5 pb-4">
        <div className="flex items-end justify-between">
          <div className="app-pill-title text-xl">履歴</div>
          <StickFigure pose="neutral" size={52} color="#1A1A2E" />
        </div>
        <div className="text-app-navy/60 font-bold text-sm mt-1">これまでの記録</div>
      </div>

      {/* 履歴一覧 */}
      <div className="flex-1 px-4 pb-28 space-y-3">
        {records.map(record => {
          const allCleared = record.entries.every(e => e.reps >= e.norm)
          const anyDone    = record.entries.some(e => e.reps > 0)
          const isToday    = record.date === TODAY

          return (
            <div key={record.date} className="app-card overflow-hidden">
              {/* 日付ヘッダー */}
              <div className={`px-4 py-3 flex items-center justify-between ${
                allCleared ? 'bg-app-green/20' : !anyDone ? 'bg-gray-50' : 'bg-app-yellow/40'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-app-navy text-base">{record.displayDate}</span>
                  <span className={`font-bold text-sm ${
                    record.dow === '日' ? 'text-app-red' : record.dow === '土' ? 'text-app-blue' : 'text-gray-400'
                  }`}>({record.dow})</span>
                  {isToday && (
                    <span className="app-tag bg-app-navy text-white text-[10px] px-2 py-0.5">今日</span>
                  )}
                </div>
                <div className="text-xl">
                  {allCleared ? '🎉' : anyDone ? '💪' : '😴'}
                </div>
              </div>

              {/* グループ別 */}
              <div className="divide-y divide-gray-100">
                {record.entries.map((e, i) => {
                  const cleared = e.reps >= e.norm
                  const pct = e.norm > 0 ? Math.min(100, (e.reps / e.norm) * 100) : 0
                  return (
                    <div key={i} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="font-bold text-app-navy text-sm">{e.groupName}</span>
                          <span className="text-gray-400 text-xs font-bold ml-2">{e.exercise}</span>
                        </div>
                        <div>
                          <span className={`font-bold text-xl ${
                            cleared ? 'text-app-green' : e.reps > 0 ? 'text-app-orange' : 'text-gray-200'
                          }`}>{e.reps}</span>
                          <span className="text-gray-400 text-xs font-bold"> / {e.norm}</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: cleared ? '#5EC462' : '#FFA347',
                          }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <BottomNav active="history" />
    </div>
  )
}
