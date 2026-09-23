import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AbujaHommes AI — Property Intelligence for Abuja',
  description: 'Smart property search, fair price predictions and market insights for the Abuja real estate market.',
  icons: {
    icon: '/logo/logo-icon.svg',
    shortcut: '/logo/logo-icon.svg',
    apple: '/logo/logo-icon.svg',
  },
  openGraph: {
    title: 'AbujaHommes AI',
    description: 'Property Intelligence for Abuja — Fair price estimates, verified listings, and AI search.',
    images: ['/logo/logo-full.svg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo/logo-icon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-[#F5EDD6] text-[#1A1A1A] font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
