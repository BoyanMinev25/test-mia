'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Shield, Camera, LogOut, Bot } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    try {
      setLoading(true)
      await signOut()
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Bot className="w-12 h-12 text-primary-500" />
        </motion.div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/10 rounded-full">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.displayName || 'Profile'}</h1>
            <p className="text-primary-100">{user?.email}</p>
          </div>
        </div>
      </Card>

      {/* Profile Content */}
      <Card>
        <div className="p-6 space-y-6">
          {/* Profile sections here */}
          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary-50 dark:bg-primary-500/10 rounded-full">
                <Mail className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-gray-900 dark:text-white">{user?.email}</p>
              </div>
            </div>

            {/* Other profile fields */}
          </div>
        </div>
      </Card>

      {/* Logout Button */}
      <Card>
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">
              Logout
            </span>
          </button>
        </div>
      </Card>
    </motion.div>
  )
} 