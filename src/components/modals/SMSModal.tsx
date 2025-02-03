'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { MessageSquare, X, Bot, AlertCircle } from 'lucide-react'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

interface SMSModalProps {
  phoneNumber: string
  transcription?: string
  isOpen: boolean
  onClose: () => void
}

export default function SMSModal({
  phoneNumber,
  transcription,
  isOpen,
  onClose,
}: SMSModalProps) {
  const [message, setMessage] = useState('')
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateSuggestion = async () => {
    if (!transcription) {
      toast.error('No transcription available for generating a suggestion')
      return
    }

    setIsGeneratingSuggestion(true)
    setError(null)
    
    try {
      const response = await fetch('/api/openai/suggest-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcription })
      })

      if (!response.ok) {
        throw new Error('Failed to generate suggestion')
      }

      const data = await response.json()
      if (data.suggestion) {
        setMessage(data.suggestion)
        toast.success('AI suggestion generated')
      } else {
        throw new Error('No suggestion received')
      }
    } catch (error) {
      console.error('Error generating suggestion:', error)
      setError('Failed to generate suggestion. Please try again.')
      toast.error('Failed to generate suggestion')
    } finally {
      setIsGeneratingSuggestion(false)
    }
  }

  const handleSend = () => {
    if (!message.trim()) {
      toast.error('Please enter a message')
      return
    }
    
    try {
      // Create SMS link with the message
      const encodedMessage = encodeURIComponent(message)
      const smsLink = `sms:${phoneNumber}?body=${encodedMessage}`
      
      // Open default SMS app
      window.open(smsLink, '_blank')
      
      // Show success message and close
      toast.success('SMS app opened successfully')
      onClose()
    } catch (error) {
      console.error('Error opening SMS:', error)
      toast.error('Failed to open SMS app')
    }
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />

        <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>

          <Dialog.Title className="text-lg font-semibold mb-4">
            <div className="flex items-center space-x-2">
              <span>To {phoneNumber}</span>
            </div>
          </Dialog.Title>

          <div className="space-y-4">
            {transcription && (
              <Button
                onClick={generateSuggestion}
                disabled={isGeneratingSuggestion}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-sm"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Bot className="w-4 h-4" />
                  <span>{isGeneratingSuggestion ? 'Thinking...' : 'AI Answer'}</span>
                </div>
              </Button>
            )}

            {error && (
              <div className="flex items-center space-x-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full h-32 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />

            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSend}
                disabled={!message.trim()}
                icon={<MessageSquare className="w-4 h-4" />}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  )
} 