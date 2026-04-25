import type { Metadata, Viewport } from 'next'
import { M_PLUS_Rounded_1c } from 'next/font/google'
import './globals.css'

const mPlusRounded = M_PLUS_Rounded_1c({
  weight: ['400', '700', '800'],
  subsets: ['latin'],
  variable: '--font-base',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '借筋',
  description: '毎日の筋トレをグループで管理。サボると借筋が増えるよ...',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${mPlusRounded.variable} font-base bg-white`}>
        <div className="mx-auto max-w-[390px] min-h-screen relative overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  )
}
