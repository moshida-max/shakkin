'use client'

type ExType   = 'pushup'|'squat'|'situp'|'pullup'|'back'|'plank'|'run'|'default'
type CharStat = 'sleeping'|'working'|'cleared'

export function toExType(name: string): ExType {
  if (/腕立て/.test(name))        return 'pushup'
  if (/スクワット/.test(name))    return 'squat'
  if (/腹筋/.test(name))          return 'situp'
  if (/懸垂/.test(name))          return 'pullup'
  if (/背筋|バーピー/.test(name)) return 'back'
  if (/プランク/.test(name))      return 'plank'
  if (/ランニング|走/.test(name)) return 'run'
  return 'default'
}

const SW = 3   // main stroke width
const SW2 = 2  // thin stroke width

/* ── 共通パーツ ── */
function Head({ cx, cy, r, face }: { cx:number; cy:number; r:number; face:'open'|'happy'|'closed'|'grin' }) {
  const ex = cx - r * 0.38  // left eye x
  const ex2 = cx + r * 0.25  // right eye x
  const ey = cy - r * 0.18   // eye y

  return (
    <>
      {/* 頭 */}
      <circle cx={cx} cy={cy} r={r} fill="white" strokeWidth={SW2}/>
      {/* ほっぺ */}
      <circle cx={cx - r * 0.65} cy={cy + r * 0.3} r={r * 0.28} fill="#FFB3C1" opacity="0.45"/>
      <circle cx={cx + r * 0.65} cy={cy + r * 0.3} r={r * 0.28} fill="#FFB3C1" opacity="0.45"/>

      {face === 'open' && (
        <>
          <circle cx={ex}  cy={ey} r={r * 0.2}  fill="currentColor"/>
          <circle cx={ex2} cy={ey} r={r * 0.2}  fill="currentColor"/>
          <circle cx={ex  + r*0.07} cy={ey - r*0.08} r={r*0.08} fill="white"/>
          <circle cx={ex2 + r*0.07} cy={ey - r*0.08} r={r*0.08} fill="white"/>
          <path d={`M${cx-r*.35},${cy+r*.25} Q${cx},${cy+r*.45} ${cx+r*.35},${cy+r*.25}`} strokeWidth={SW2} fill="none"/>
        </>
      )}
      {face === 'happy' && (
        <>
          {/* 半月目 (squint) */}
          <path d={`M${ex-r*.2},${ey} Q${ex},${ey-r*.28} ${ex+r*.2},${ey}`} strokeWidth={2.5} fill="none" strokeLinecap="round"/>
          <path d={`M${ex2-r*.2},${ey} Q${ex2},${ey-r*.28} ${ex2+r*.2},${ey}`} strokeWidth={2.5} fill="none" strokeLinecap="round"/>
          <path d={`M${cx-r*.4},${cy+r*.18} Q${cx},${cy+r*.5} ${cx+r*.4},${cy+r*.18}`} strokeWidth={SW} fill="none" strokeLinecap="round"/>
        </>
      )}
      {face === 'grin' && (
        <>
          <circle cx={ex}  cy={ey} r={r * 0.22} fill="currentColor"/>
          <circle cx={ex2} cy={ey} r={r * 0.22} fill="currentColor"/>
          <circle cx={ex  + r*0.08} cy={ey - r*0.09} r={r*0.09} fill="white"/>
          <circle cx={ex2 + r*0.08} cy={ey - r*0.09} r={r*0.09} fill="white"/>
          {/* 口を大きく開ける */}
          <path d={`M${cx-r*.45},${cy+r*.2} Q${cx},${cy+r*.55} ${cx+r*.45},${cy+r*.2}`} strokeWidth={SW} fill="none" strokeLinecap="round"/>
          {/* 汗 */}
          <ellipse cx={cx+r*.72} cy={cy-r*.4} rx={r*.1} ry={r*.17} fill="#74B9FF" opacity="0.7"/>
        </>
      )}
      {face === 'closed' && (
        <>
          <line x1={ex-r*.2} y1={ey} x2={ex+r*.2} y2={ey} strokeWidth={2.5} strokeLinecap="round"/>
          <line x1={ex2-r*.2} y1={ey} x2={ex2+r*.2} y2={ey} strokeWidth={2.5} strokeLinecap="round"/>
          <line x1={cx-r*.2} y1={cy+r*.28} x2={cx+r*.2} y2={cy+r*.28} strokeWidth={SW2} strokeLinecap="round"/>
        </>
      )}
    </>
  )
}

/* ─── SLEEPING ─── */
function Sleeping({ s }: { s: number }) {
  return (
    <svg width={s} height={s*0.75} viewBox="0 0 100 72" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <g className="char-sleep">
        <Head cx={20} cy={36} r={15} face="closed"/>
        {/* body horizontal */}
        <line x1={35} y1={38} x2={74} y2={42} strokeWidth={SW+1}/>
        {/* arm folded as pillow */}
        <line x1={35} y1={38} x2={30} y2={52} strokeWidth={SW}/>
        <line x1={30} y1={52} x2={20} y2={55} strokeWidth={SW}/>
        {/* legs bent */}
        <line x1={74} y1={42} x2={80} y2={56} strokeWidth={SW+1}/>
        <line x1={74} y1={42} x2={66} y2={55} strokeWidth={SW+1}/>
      </g>
      {/* Zzz */}
      <g className="char-zzz1" style={{transformOrigin:'40px 20px'}}>
        <text x="36" y="22" fontSize="9" fontWeight="900" fill="currentColor" opacity="0.6" fontFamily="sans-serif">z</text>
      </g>
      <g className="char-zzz2" style={{transformOrigin:'50px 14px'}}>
        <text x="46" y="16" fontSize="12" fontWeight="900" fill="currentColor" opacity="0.6" fontFamily="sans-serif">z</text>
      </g>
      <g className="char-zzz3" style={{transformOrigin:'62px 8px'}}>
        <text x="60" y="10" fontSize="9" fontWeight="900" fill="currentColor" opacity="0.6" fontFamily="sans-serif">z</text>
      </g>
    </svg>
  )
}

/* ─── CLEARED (all exercises) ─── */
function Cleared({ s }: { s: number }) {
  return (
    <svg width={s} height={s*1.2} viewBox="0 0 80 95" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <g className="char-celebrate" style={{transformOrigin:'40px 90px'}}>
        <Head cx={40} cy={18} r={16} face="happy"/>
        {/* 星 */}
        <text x="6"  y="14" fontSize="11" fill="#FFCD3C" stroke="none" fontFamily="sans-serif">★</text>
        <text x="60" y="10" fontSize="8"  fill="#FFCD3C" stroke="none" fontFamily="sans-serif">★</text>
        {/* body */}
        <line x1={40} y1={34} x2={40} y2={60} strokeWidth={SW+1}/>
        {/* 両手バンザイ */}
        <line x1={40} y1={42} x2={14} y2={20} strokeWidth={SW+1}/>
        <line x1={40} y1={42} x2={66} y2={20} strokeWidth={SW+1}/>
        {/* 足ジャンプ開き */}
        <line x1={40} y1={60} x2={26} y2={84} strokeWidth={SW+1}/>
        <line x1={40} y1={60} x2={54} y2={84} strokeWidth={SW+1}/>
      </g>
    </svg>
  )
}

/* ─── PUSHUP working ─── */
function PushupWorking({ s }: { s: number }) {
  return (
    <svg width={s*1.25} height={s*0.85} viewBox="0 0 100 68" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {/* 地面 */}
      <line x1={20} y1={62} x2={90} y2={62} strokeWidth={1.5} opacity="0.2"/>
      <g className="char-pushup" style={{transformOrigin:'50px 50px'}}>
        <Head cx={16} cy={24} r={14} face="grin"/>
        {/* body diagonal */}
        <line x1={30} y1={32} x2={72} y2={46} strokeWidth={SW+1}/>
        {/* 腕 (bent, pushing) */}
        <line x1={42} y1={37} x2={36} y2={58} strokeWidth={SW+1}/>
        <line x1={58} y1={42} x2={54} y2={58} strokeWidth={SW+1}/>
        {/* 足 */}
        <line x1={72} y1={46} x2={78} y2={58} strokeWidth={SW+1}/>
        <line x1={72} y1={46} x2={66} y2={57} strokeWidth={SW+1}/>
      </g>
    </svg>
  )
}

/* ─── SQUAT working ─── */
function SquatWorking({ s }: { s: number }) {
  return (
    <svg width={s} height={s*1.1} viewBox="0 0 80 88" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <g className="char-squat" style={{transformOrigin:'40px 60px'}}>
        <Head cx={40} cy={16} r={14} face="grin"/>
        {/* body (short, squatting) */}
        <line x1={40} y1={30} x2={40} y2={50} strokeWidth={SW+1}/>
        {/* 腕 前に出す */}
        <line x1={40} y1={38} x2={14} y2={40} strokeWidth={SW+1}/>
        <line x1={40} y1={38} x2={66} y2={40} strokeWidth={SW+1}/>
        {/* 深いスクワット足 */}
        <line x1={40} y1={50} x2={22} y2={64} strokeWidth={SW+1}/>
        <line x1={40} y1={50} x2={58} y2={64} strokeWidth={SW+1}/>
        <line x1={22} y1={64} x2={18} y2={83} strokeWidth={SW+1}/>
        <line x1={58} y1={64} x2={62} y2={83} strokeWidth={SW+1}/>
      </g>
    </svg>
  )
}

/* ─── SITUP working ─── */
function SitupWorking({ s }: { s: number }) {
  return (
    <svg width={s} height={s*1.1} viewBox="0 0 80 88" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <g className="char-situp" style={{transformOrigin:'40px 70px'}}>
        <Head cx={28} cy={18} r={14} face="grin"/>
        {/* 上半身 (V字腹筋 - raised torso) */}
        <line x1={28} y1={32} x2={52} y2={64} strokeWidth={SW+1}/>
        {/* 腕 頭の後ろ */}
        <line x1={28} y1={36} x2={10} y2={28} strokeWidth={SW}/>
        <line x1={28} y1={36} x2={14} y2={22} strokeWidth={SW}/>
        {/* 下半身 (legs on ground, knees bent) */}
        <line x1={52} y1={64} x2={36} y2={80} strokeWidth={SW+1}/>
        <line x1={52} y1={64} x2={68} y2={80} strokeWidth={SW+1}/>
        <line x1={36} y1={80} x2={20} y2={72} strokeWidth={SW+1}/>
        <line x1={68} y1={80} x2={74} y2={72} strokeWidth={SW+1}/>
      </g>
    </svg>
  )
}

/* ─── PULLUP working ─── */
function PullupWorking({ s }: { s: number }) {
  return (
    <svg width={s} height={s*1.2} viewBox="0 0 80 95" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {/* バー */}
      <line x1={10} y1={10} x2={70} y2={10} strokeWidth={SW+2}/>
      <g className="char-pullup" style={{transformOrigin:'40px 10px'}}>
        <Head cx={40} cy={34} r={14} face="grin"/>
        {/* 腕 上げてバーを掴む */}
        <line x1={40} y1={42} x2={26} y2={12} strokeWidth={SW+1}/>
        <line x1={40} y1={42} x2={54} y2={12} strokeWidth={SW+1}/>
        {/* body */}
        <line x1={40} y1={48} x2={40} y2={74} strokeWidth={SW+1}/>
        {/* legs hanging */}
        <line x1={40} y1={74} x2={30} y2={90} strokeWidth={SW+1}/>
        <line x1={40} y1={74} x2={50} y2={90} strokeWidth={SW+1}/>
      </g>
    </svg>
  )
}

/* ─── PLANK working ─── */
function PlankWorking({ s }: { s: number }) {
  return (
    <svg width={s*1.3} height={s*0.75} viewBox="0 0 104 60" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1={20} y1={56} x2={95} y2={56} strokeWidth={1.5} opacity="0.2"/>
      <g className="char-plank" style={{transformOrigin:'50px 40px'}}>
        <Head cx={16} cy={22} r={14} face="grin"/>
        {/* body flat */}
        <line x1={30} y1={28} x2={82} y2={32} strokeWidth={SW+2}/>
        {/* arms extended straight */}
        <line x1={36} y1={29} x2={32} y2={50} strokeWidth={SW+1}/>
        <line x1={54} y1={30} x2={50} y2={50} strokeWidth={SW+1}/>
        {/* feet */}
        <line x1={82} y1={32} x2={88} y2={50} strokeWidth={SW+1}/>
        <line x1={82} y1={32} x2={76} y2={50} strokeWidth={SW+1}/>
        {/* 汗 */}
        <ellipse cx={30} cy={10} rx={3} ry={5} fill="#74B9FF" stroke="none" opacity="0.6"/>
        <ellipse cx={24} cy={16} rx={2} ry={3.5} fill="#74B9FF" stroke="none" opacity="0.5"/>
      </g>
    </svg>
  )
}

/* ─── RUN working ─── */
function RunWorking({ s }: { s: number }) {
  return (
    <svg width={s} height={s*1.15} viewBox="0 0 80 92" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <g className="char-run" style={{transformOrigin:'40px 55px'}}>
        <Head cx={38} cy={14} r={14} face="open"/>
        {/* body leaning forward */}
        <line x1={38} y1={28} x2={42} y2={56} strokeWidth={SW+1}/>
        {/* 腕 running swing */}
        <line x1={42} y1={38} x2={60} y2={28} strokeWidth={SW+1}/>
        <line x1={42} y1={38} x2={22} y2={44} strokeWidth={SW+1}/>
        {/* stride legs */}
        <line x1={42} y1={56} x2={24} y2={72} strokeWidth={SW+1}/>
        <line x1={42} y1={56} x2={62} y2={68} strokeWidth={SW+1}/>
        <line x1={24} y1={72} x2={16} y2={88} strokeWidth={SW+1}/>
        <line x1={62} y1={68} x2={70} y2={86} strokeWidth={SW+1}/>
        {/* 速線 */}
        <line x1={6} y1={50} x2={22} y2={50} strokeWidth={1.5} opacity="0.3"/>
        <line x1={4} y1={58} x2={18} y2={58} strokeWidth={1.5} opacity="0.2"/>
      </g>
    </svg>
  )
}

/* ─── BACK/背筋/バーピー working ─── */
function BackWorking({ s }: { s: number }) {
  return (
    <svg width={s*1.15} height={s*0.85} viewBox="0 0 92 68" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1={20} y1={62} x2={86} y2={62} strokeWidth={1.5} opacity="0.2"/>
      <g className="char-back" style={{transformOrigin:'50px 50px'}}>
        {/* 背筋: face-down, upper body raised */}
        <Head cx={18} cy={22} r={13} face="grin"/>
        {/* 上半身 arching up */}
        <line x1={31} y1={28} x2={68} y2={46} strokeWidth={SW+1}/>
        {/* 腕 前に伸ばす */}
        <line x1={31} y1={28} x2={14} y2={40} strokeWidth={SW+1}/>
        <line x1={31} y1={28} x2={10} y2={28} strokeWidth={SW}/>
        {/* 下半身 flat on ground */}
        <line x1={68} y1={46} x2={80} y2={56} strokeWidth={SW+1}/>
        <line x1={68} y1={46} x2={74} y2={56} strokeWidth={SW+1}/>
        {/* 汗 */}
        <ellipse cx={24} cy={8} rx={2.5} ry={4} fill="#74B9FF" stroke="none" opacity="0.6"/>
      </g>
    </svg>
  )
}

/* ─── DEFAULT working ─── */
function DefaultWorking({ s }: { s: number }) {
  return (
    <svg width={s} height={s*1.1} viewBox="0 0 80 88" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <g className="char-wobble" style={{transformOrigin:'40px 80px'}}>
        <Head cx={40} cy={16} r={15} face="open"/>
        <line x1={40} y1={31} x2={40} y2={58} strokeWidth={SW+1}/>
        {/* 腕 左右 */}
        <line x1={40} y1={40} x2={12} y2={30} strokeWidth={SW+1}/>
        <line x1={40} y1={40} x2={68} y2={30} strokeWidth={SW+1}/>
        {/* 足 */}
        <line x1={40} y1={58} x2={28} y2={80} strokeWidth={SW+1}/>
        <line x1={40} y1={58} x2={52} y2={80} strokeWidth={SW+1}/>
      </g>
    </svg>
  )
}

/* ─── Main export ─── */
export default function ExerciseCharacter({
  exercise,
  status,
  size = 80,
}: {
  exercise: string
  status: CharStat
  size?: number
}) {
  const ex = toExType(exercise)

  if (status === 'sleeping') return <Sleeping s={size} />
  if (status === 'cleared')  return <Cleared  s={size} />

  switch (ex) {
    case 'pushup':  return <PushupWorking  s={size} />
    case 'squat':   return <SquatWorking   s={size} />
    case 'situp':   return <SitupWorking   s={size} />
    case 'pullup':  return <PullupWorking  s={size} />
    case 'plank':   return <PlankWorking   s={size} />
    case 'run':     return <RunWorking     s={size} />
    case 'back':    return <BackWorking    s={size} />
    default:        return <DefaultWorking s={size} />
  }
}
