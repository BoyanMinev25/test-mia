'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import Card from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { Settings, Bot, Bell, Phone, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import { cleanupDatabase } from '@/lib/firebase/dbUtils'

export default function SettingsPage() {
  const { user } = useAuth()
  const [aiEnabled, setAiEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [cleaning, setCleaning] = useState(false)
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleCleanup = async () => {
    const isConfirmed = window.confirm(
      'Are you sure you want to delete all records? This action cannot be undone.'
    )
    
    if (!isConfirmed) return

    setCleaning(true)
    setResult('')
    
    try {
      const deletedCount = await cleanupDatabase()
      setResult('All records have been deleted')
    } catch (error) {
      setResult('Error cleaning up database')
      console.error(error)
    } finally {
      setCleaning(false)
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
      <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white overflow-hidden relative">
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="mt-2 text-primary-100">Configure your preferences</p>
          </div>
          <div className="p-4 bg-white/10 rounded-full">
            <Settings className="w-8 h-8" />
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8">
          <div className="w-32 h-32 bg-white/10 rounded-full" />
        </div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8">
          <div className="w-24 h-24 bg-white/5 rounded-full" />
        </div>
      </Card>

      <div className="grid gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-50 dark:bg-primary-500/10 rounded-full">
                <Bot className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enable AI-powered call handling</p>
              </div>
            </div>
            <Button
              variant={aiEnabled ? "primary" : "secondary"}
              onClick={() => setAiEnabled(!aiEnabled)}
            >
              {aiEnabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-50 dark:bg-primary-500/10 rounded-full">
                <Bell className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get notified about missed calls</p>
              </div>
            </div>
            <Button
              variant={notificationsEnabled ? "primary" : "secondary"}
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              {notificationsEnabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Database Management</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Clean up your database records</p>
              </div>
            </div>
            <Button
              onClick={handleCleanup}
              disabled={cleaning}
              className={`
                flex items-center space-x-2 
                bg-red-200 hover:bg-red-300 
                dark:bg-red-500/20 dark:hover:bg-red-500/30 
                text-red-700 dark:text-red-400
                border-red-300 dark:border-red-500/30
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200
                px-4 py-2 rounded-md
              `}
            >
              <Trash2 className="w-4 h-4" />
              <span>{cleaning ? 'Cleaning...' : 'Clean Up Records'}</span>
            </Button>
          </div>
          
          {result && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {result}
              </p>
            </div>
          )}
        </Card>
      </div>
    </motion.div>
  )
} 