import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ClassPilot — Run your coaching center in one place',
    template: '%s | ClassPilot',
  },
  description:
    'ClassPilot helps coaching centers manage students, teachers, classes, attendance, fees, tests, and results from one focused workspace.',
  applicationName: 'ClassPilot',
  keywords: ['coaching center software', 'tutor management software', 'student management', 'attendance tracking', 'fee management'],
  authors: [{ name: 'ClassPilot' }],
  creator: 'ClassPilot',
  publisher: 'ClassPilot',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://classpilot.app'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'ClassPilot',
    title: 'ClassPilot — Run your coaching center in one place',
    description: 'A focused workspace for coaching centers to manage people, classes, attendance, fees, and results.',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClassPilot — Run your coaching center in one place',
    description: 'A focused workspace for coaching centers to manage people, classes, attendance, fees, and results.',
  },
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#131722' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`bg-background ${inter.variable} ${jakarta.variable}`}
    >
      <body className="font-sans antialiased">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
