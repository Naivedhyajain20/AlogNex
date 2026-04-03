import './globals.css'
import { Montserrat, Inter } from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-montserrat' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'ALGONEX | Master Your LeetCode Journey',
  description: 'Track LeetCode problems with ALGONEX, your ultimate spaced-repetition partner.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
