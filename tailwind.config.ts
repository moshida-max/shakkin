import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        app: {
          yellow:  '#FFCD3C',
          pink:    '#FF8FAD',
          green:   '#5EC462',
          blue:    '#74B9FF',
          purple:  '#A29BFE',
          teal:    '#4ECDC4',
          orange:  '#FFA347',
          red:     '#FF5C5C',
          navy:    '#1A1A2E',
          'gray':  '#F4F4F8',
        },
        card: {
          teal:   '#4ECDC4',
          blue:   '#74B9FF',
          pink:   '#FF8FAD',
          yellow: '#FFCD3C',
          green:  '#5EC462',
          purple: '#A29BFE',
        },
      },
      fontFamily: {
        base: ['var(--font-base)', 'sans-serif'],
      },
      boxShadow: {
        card:   '0 4px 20px rgba(0,0,0,0.08)',
        'card-lg': '0 8px 32px rgba(0,0,0,0.12)',
        btn:    '0 3px 10px rgba(0,0,0,0.15)',
      },
      borderRadius: {
        '2.5xl': '20px',
      },
    },
  },
  plugins: [],
}
export default config
