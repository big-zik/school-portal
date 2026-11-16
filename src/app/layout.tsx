import type { Metadata } from 'next'
import { Inter, Playfair_Display, Geist_Mono } from 'next/font/google'
import './globals.css'
import './site.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'CHOSEN GENERATION SCHOOL | School Portal',
  description: 'Enterprise School Management, Academic Records, Fees, Attendance & Administration Portal',
  manifest: '/manifest.json',
  themeColor: '#0D5EA7',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          // Apply the saved palette before first paint so there is no flash.
          dangerouslySetInnerHTML={{
            __html: `try{var p=localStorage.getItem('cgs-palette');var d=document.documentElement;if(p==='calm')d.setAttribute('data-palette','calm');else if(p==='evening')d.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[var(--cgs-canvas)] text-[var(--cgs-text)]">
        {children}
      </body>
    </html>
  )
}
