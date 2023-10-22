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
        primary: {
          400: 'rgb(13,15,20)',
          500: 'rgb(20,22,27)',
          600: 'rgb(36,39,46)',
          700: 'rgb(57,60,67)'
        }
      }
    },
  },
  plugins: [],
}
export default config
