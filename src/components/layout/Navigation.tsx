'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { 
  PhoneIncoming, 
  Settings, 
  User, 
  History,
  MoreVertical,
  Sun,
  Moon,
  LogOut
} from 'lucide-react'

export function Navigation({ variant }: { variant: 'desktop' | 'mobile' }) {
  const { user, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check system preference on mount
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className={variant === 'desktop' ? 'hidden md:flex' : 'md:hidden'}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Left side - Logo only */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <PhoneIncoming className="w-8 h-8 text-primary-500" />
            </Link>
          </div>

          {/* Right side - User menu */}
          {user && (
            <div className="flex items-center space-x-1">
              <Link
                href="/calls"
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Call History"
              >
                <History className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </Link>

              <Link
                href="/settings"
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </Link>

              <button
                onClick={() => toggleTheme()}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title={isDarkMode ? "Light Mode" : "Dark Mode"}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>

                {isMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </Link>
                    <hr className="my-1 border-gray-200 dark:border-gray-600" />
                    <button
                      onClick={() => {
                        signOut()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Login button for non-authenticated users */}
          {!user && (
            <div className="flex items-center">
              <Link 
                href="/login"
                className="px-4 py-2 rounded-md bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
} 