'use client'

import { useRouter } from 'next/navigation'
import { Bot } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AuthActionPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="max-w-md w-full mx-auto p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Password Changed</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          You can now sign in with your new password
        </p>
        <button
          onClick={() => router.replace('/login')}
          className="w-full bg-primary-500 text-white py-2 px-4 rounded hover:bg-primary-600 transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  )
} 