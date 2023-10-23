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
          400: 'rgb(3,5,10)',
          500: 'rgb(10,12,17)',
          600: 'rgb(21,24,31)',
          700: 'rgb(47,50,57)'
        }
      }
    },
  },
  plugins: [],
}
export default config
