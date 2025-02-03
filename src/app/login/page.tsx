'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase/firebase'
import toast from 'react-hot-toast'
import { Bot } from 'lucide-react'
import { motion } from 'framer-motion'
import { showCustomToast } from '@/components/ui/Toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isResetMode, setIsResetMode] = useState(false)
  const { signIn, signInWithGoogle, loading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    
    try {
      if (isResetMode) {
        await sendPasswordResetEmail(auth, email)
        showCustomToast('Password reset email sent! Check your inbox.')
        setIsResetMode(false)
      } else {
        await signIn(email.trim(), password.trim())
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      let errorMessage = 'An error occurred during sign in.'
      
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password. Please try again.'
          break
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.'
          break
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.'
          break
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.'
          break
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign in cancelled. Please try again.'
          break
        case 'auth/operation-not-allowed':
          errorMessage = 'This sign in method is not enabled.'
          break
        default:
          if (error.message) {
            errorMessage = error.message
          }
      }
      
      setError(errorMessage)
      showCustomToast(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    
    try {
      await signInWithGoogle()
    } catch (error: any) {
      console.error('Google sign in error:', error)
      let errorMessage = 'An error occurred during Google sign in.'
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign in cancelled. Please try again.'
          break
        case 'auth/cancelled-popup-request':
          errorMessage = 'Another sign in attempt is in progress.'
          break
        case 'auth/popup-blocked':
          errorMessage = 'Sign in popup was blocked. Please allow popups and try again.'
          break
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.'
          break
        default:
          if (error.message) {
            errorMessage = error.message
          }
      }
      
      setError(errorMessage)
      showCustomToast(errorMessage)
    }
  }

  // Disable the form while loading or submitting
  const isDisabled = loading || isSubmitting

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {isResetMode ? 'Reset Password' : 'Login'}
      </h1>
      
      {error && (
        <div className="p-3 mb-4 rounded-lg bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-300">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </label>
        </div>
        
        {!isResetMode && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </label>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isDisabled}
          className="w-full bg-primary-500 text-white py-2 px-4 rounded hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          {isDisabled ? 'Loading...' : isResetMode ? 'Send Reset Link' : 'Sign In'}
        </button>
      </form>
      
      <div className="mt-4 space-y-3">
        <button
          onClick={() => {
            setIsResetMode(!isResetMode)
            setError(null)
          }}
          className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          {isResetMode ? 'Back to Login' : 'Forgot Password?'}
        </button>

        {!isResetMode && (
          <button
            onClick={handleGoogleSignIn}
            disabled={isDisabled}
            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            {isDisabled ? 'Signing in...' : 'Sign in with Google'}
          </button>
        )}
      </div>
    </div>
  )
} 