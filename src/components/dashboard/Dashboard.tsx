'use client'

import { motion } from 'framer-motion'
import { Phone, Calendar, Settings, User, Bot } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'
import RecentCalls from './RecentCalls'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const { user } = useAuth()
  const firstName = user?.email?.split('@')[0] || ''
  const [unhandledCount, setUnhandledCount] = useState(0)
  const router = useRouter()

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Welcome Banner with Actions */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-primary-100 capitalize">{firstName}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/calendar"
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg px-4 py-2"
            >
              <Calendar className="w-5 h-5" />
              <span>My Calendar</span>
            </Link>

            <div className="relative">
              <Link href="/calls" className="block">
                <div className="p-3 bg-white/10 hover:bg-white/20 transition-colors rounded-full">
                  <Phone className="w-6 h-6" />
                </div>
                {unhandledCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unhandledCount}
                  </div>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Voicemails Sections */}
      <div className="grid gap-6">
        <RecentCalls filter="unhandled" />
        <RecentCalls filter="handled" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <button
          onClick={() => handleNavigation('/settings')}
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <Settings className="w-8 h-8 text-primary-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Settings</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your account settings
          </p>
        </button>

        <button
          onClick={() => handleNavigation('/profile')}
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <User className="w-8 h-8 text-primary-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">User Profile</h3>
          <p className="text-gray-600 dark:text-gray-400">
            View and edit your profile
          </p>
        </button>
      </div>
    </motion.div>
  )
} 