export type Pose = 'neutral' | 'workout' | 'celebrate' | 'sad' | 'pushup' | 'squat' | 'run'

interface StickFigureProps {
  pose?: Pose
  color?: string
  size?: number
  className?: string
}

const STROKE = 3.5

export default function StickFigure({ pose = 'neutral', color = '#1A1A2E', size = 72, className = '' }: StickFigureProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 76"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {pose === 'neutral' && (
        <>
          <circle cx="30" cy="12" r="10" strokeWidth={STROKE} />
          <circle cx="27" cy="11" r="1.5" fill={color} stroke="none" />
          <circle cx="33" cy="11" r="1.5" fill={color} stroke="none" />
          <path d="M 26 15 Q 30 18 34 15" strokeWidth={2} fill="none" />
          <line x1="30" y1="22" x2="30" y2="50" strokeWidth={STROKE} />
          <line x1="30" y1="33" x2="14" y2="44" strokeWidth={STROKE} />
          <line x1="30" y1="33" x2="46" y2="44" strokeWidth={STROKE} />
          <line x1="30" y1="50" x2="18" y2="70" strokeWidth={STROKE} />
          <line x1="30" y1="50" x2="42" y2="70" strokeWidth={STROKE} />
        </>
      )}
      {pose === 'workout' && (
        <>
          <circle cx="30" cy="12" r="10" strokeWidth={STROKE} />
          <circle cx="27" cy="11" r="1.5" fill={color} stroke="none" />
          <circle cx="33" cy="11" r="1.5" fill={color} stroke="none" />
          <path d="M 26 15 Q 30 18 34 15" strokeWidth={2} fill="none" />
          <line x1="30" y1="22" x2="30" y2="50" strokeWidth={STROKE} />
          {/* 腕を水平に伸ばす */}
          <line x1="30" y1="31" x2="8"  y2="28" strokeWidth={STROKE} />
          <line x1="30" y1="31" x2="52" y2="28" strokeWidth={STROKE} />
          <line x1="30" y1="50" x2="20" y2="68" strokeWidth={STROKE} />
          <line x1="30" y1="50" x2="40" y2="68" strokeWidth={STROKE} />
        </>
      )}
      {pose === 'celebrate' && (
        <>
          <circle cx="30" cy="12" r="10" strokeWidth={STROKE} />
          <circle cx="27" cy="11" r="1.5" fill={color} stroke="none" />
          <circle cx="33" cy="11" r="1.5" fill={color} stroke="none" />
          <path d="M 25 16 Q 30 20 35 16" strokeWidth={2.5} fill="none" />
          <line x1="30" y1="22" x2="30" y2="50" strokeWidth={STROKE} />
          {/* 両手を上げる */}
          <line x1="30" y1="28" x2="10" y2="12" strokeWidth={STROKE} />
          <line x1="30" y1="28" x2="50" y2="12" strokeWidth={STROKE} />
          {/* 足を広げる */}
          <line x1="30" y1="50" x2="15" y2="70" strokeWidth={STROKE} />
          <line x1="30" y1="50" x2="45" y2="70" strokeWidth={STROKE} />
        </>
      )}
      {pose === 'sad' && (
        <>
          <circle cx="30" cy="12" r="10" strokeWidth={STROKE} />
          <circle cx="27" cy="11" r="1.5" fill={color} stroke="none" />
          <circle cx="33" cy="11" r="1.5" fill={color} stroke="none" />
          {/* への字口 */}
          <path d="M 26 17 Q 30 14 34 17" strokeWidth={2} fill="none" />
          <line x1="30" y1="22" x2="30" y2="50" strokeWidth={STROKE} />
          {/* 腕を下げる */}
          <line x1="30" y1="33" x2="16" y2="48" strokeWidth={STROKE} />
          <line x1="30" y1="33" x2="44" y2="48" strokeWidth={STROKE} />
          <line x1="30" y1="50" x2="20" y2="70" strokeWidth={STROKE} />
          <line x1="30" y1="50" x2="40" y2="70" strokeWidth={STROKE} />
        </>
      )}
      {pose === 'pushup' && (
        <>
          {/* 腕立て体勢（横向き） */}
          <circle cx="20" cy="22" r="10" strokeWidth={STROKE} />
          <circle cx="17" cy="21" r="1.5" fill={color} stroke="none" />
          <circle cx="23" cy="21" r="1.5" fill={color} stroke="none" />
          <path d="M 16 26 Q 20 29 24 26" strokeWidth={2} fill="none" />
          <line x1="20" y1="32" x2="50" y2="38" strokeWidth={STROKE} />
          <line x1="30" y1="35" x2="28" y2="55" strokeWidth={STROKE} />
          <line x1="28" y1="55" x2="14" y2="65" strokeWidth={STROKE} />
          <line x1="28" y1="55" x2="48" y2="60" strokeWidth={STROKE} />
          <line x1="50" y1="38" x2="52" y2="58" strokeWidth={STROKE} />
        </>
      )}
      {pose === 'squat' && (
        <>
          <circle cx="30" cy="10" r="10" strokeWidth={STROKE} />
          <circle cx="27" cy="9" r="1.5" fill={color} stroke="none" />
          <circle cx="33" cy="9" r="1.5" fill={color} stroke="none" />
          <path d="M 26 13 Q 30 16 34 13" strokeWidth={2} fill="none" />
          <line x1="30" y1="20" x2="30" y2="40" strokeWidth={STROKE} />
          {/* 腕を前に */}
          <line x1="30" y1="28" x2="10" y2="32" strokeWidth={STROKE} />
          <line x1="30" y1="28" x2="50" y2="32" strokeWidth={STROKE} />
          {/* スクワット足 */}
          <line x1="30" y1="40" x2="14" y2="52" strokeWidth={STROKE} />
          <line x1="30" y1="40" x2="46" y2="52" strokeWidth={STROKE} />
          <line x1="14" y1="52" x2="10" y2="70" strokeWidth={STROKE} />
          <line x1="46" y1="52" x2="50" y2="70" strokeWidth={STROKE} />
        </>
      )}
      {pose === 'run' && (
        <>
          <circle cx="30" cy="10" r="10" strokeWidth={STROKE} />
          <circle cx="27" cy="9" r="1.5" fill={color} stroke="none" />
          <circle cx="33" cy="9" r="1.5" fill={color} stroke="none" />
          <path d="M 26 13 Q 30 16 34 13" strokeWidth={2} fill="none" />
          <line x1="30" y1="20" x2="28" y2="46" strokeWidth={STROKE} />
          {/* ランニング腕 */}
          <line x1="29" y1="30" x2="10" y2="22" strokeWidth={STROKE} />
          <line x1="29" y1="30" x2="46" y2="38" strokeWidth={STROKE} />
          {/* ランニング足 */}
          <line x1="28" y1="46" x2="12" y2="60" strokeWidth={STROKE} />
          <line x1="28" y1="46" x2="44" y2="56" strokeWidth={STROKE} />
          <line x1="44" y1="56" x2="52" y2="70" strokeWidth={STROKE} />
          <line x1="12" y1="60" x2="8"  y2="74" strokeWidth={STROKE} />
        </>
      )}
    </svg>
  )
}
