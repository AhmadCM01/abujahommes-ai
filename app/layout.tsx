import type { Metadata } from 'next'
import { Inter, Bebas_Neue, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-bebas' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'AbujaHommes AI - Premium Property Pricing & Recommendations',
  description: 'AI-powered property pricing and recommendation system for Abuja real estate. Get accurate price predictions and personalized recommendations for houses, land, and rentals.',
  keywords: ['abuja real estate', 'property pricing', 'AI recommendations', 'house prices', 'land prices', 'abuja property'],
  authors: [{ name: 'AbujaHommes AI Team' }],
  openGraph: {
    title: 'AbujaHommes AI - Smart Property Solutions',
    description: 'Discover your perfect property in Abuja with AI-powered insights',
    type: 'website',
    locale: 'en_NG',
    siteName: 'AbujaHommes AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AbujaHommes AI',
    description: 'AI-powered property pricing and recommendations for Abuja',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'AbujaHommes AI',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${bebas.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-soft-cream">
          {children}
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'white',
              color: '#374151',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: 'white',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
