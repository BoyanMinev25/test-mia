'use client'

import { X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useState, useEffect } from 'react'

interface ToastProps {
  message: string
  id: string
  visible?: boolean
}

export const showCustomToast = (message: string) => {
  return toast.custom(
    (t) => <CustomToast message={message} id={t.id} visible={t.visible} />,
    {
      duration: Infinity,
      position: 'top-right'
    }
  )
}

const CustomToast = ({ message, id, visible = true }: ToastProps) => {
  const [isLeaving, setIsLeaving] = useState(false)

  const handleDismiss = () => {
    setIsLeaving(true)
    setTimeout(() => {
      toast.dismiss(id)
    }, 150) // Match animation duration
  }

  return (
    <div
      className={`${
        isLeaving ? 'animate-leave' : 'animate-enter'
      } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center justify-between p-4`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(100%)'
      }}
    >
      <p className="text-sm text-gray-900 dark:text-gray-100">
        {message}
      </p>
      <button
        onClick={handleDismiss}
        className="ml-4 flex-shrink-0 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>
    </div>
  )
} 