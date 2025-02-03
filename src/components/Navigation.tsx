'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { useAuth } from '@/lib/hooks/useAuth'
import { Moon, Sun, Bot } from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()
  const { isDarkMode, toggleTheme } = useTheme()
  const { user } = useAuth()

  return (
    <nav className="bg-gray-50 shadow-lg dark:bg-gray-800 relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center">
            <div className="flex items-end">
              <Bot className="w-14 h-14 text-primary-500 dark:text-primary-400" />
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300 leading-none mb-[8px]">
                MIA
              </span>
            </div>
          </Link>

          {/* Only Theme Toggle remains in header */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </nav>
  )
} 