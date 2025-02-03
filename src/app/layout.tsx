import { Inter } from 'next/font/google'
import './globals.css'
import AppLayout from '@/components/layout/AppLayout'
import { AuthProvider } from '@/lib/contexts/AuthContext'
import { SearchProvider } from '@/lib/contexts/SearchContext'
import { ThemeProvider } from '@/lib/contexts/ThemeContext'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            <SearchProvider>
              <AppLayout>{children}</AppLayout>
            </SearchProvider>
          </ThemeProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}
