import './globals.css'
import { Montserrat, Inter } from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-montserrat' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  metadataBase: new URL('https://railblaze.app'),
  title: 'ALGONEX | Master Your LeetCode Journey',
  description: 'Track LeetCode problems with ALGONEX — your ultimate spaced-repetition partner for coding interview prep.',
  keywords: ['LeetCode', 'coding interview', 'spaced repetition', 'revision tracker', 'ALGONEX'],
  openGraph: {
    title: 'ALGONEX | Master Your LeetCode Journey',
    description: 'Track and revise LeetCode problems with intelligent spaced repetition. Link your profile and never forget a solution again.',
    url: 'https://railblaze.app',
    siteName: 'ALGONEX',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'ALGONEX Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'ALGONEX | Master Your LeetCode Journey',
    description: 'Spaced-repetition revision tracker for LeetCode. Link your profile and stay on top of your interview prep.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
