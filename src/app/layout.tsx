import { Inter } from 'next/font/google'
import './globals.css'
import AppLayout from '@/components/layout/AppLayout'
import { AuthProvider } from '@/lib/contexts/AuthContext'
import { SearchProvider } from '@/lib/contexts/SearchContext'
import { ThemeProvider } from '@/lib/contexts/ThemeContext'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const inter = Inter({ subsets: ['latin'] })

const queryClient = new QueryClient()

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
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider>
              <SearchProvider>
                <AppLayout>{children}</AppLayout>
              </SearchProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
        <Toaster />
      </body>
    </html>
  )
}
