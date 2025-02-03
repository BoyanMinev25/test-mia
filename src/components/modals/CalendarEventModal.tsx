'use client'

import { Dialog } from '@headlessui/react'
import { X, Phone, MessageSquare, Calendar, Clock, User } from 'lucide-react'
import { Call } from '@/lib/types/calls'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { format } from 'date-fns'

interface CalendarEventModalProps {
  event: Call | null
  isOpen: boolean
  onClose: () => void
}

export default function CalendarEventModal({
  event,
  isOpen,
  onClose
}: CalendarEventModalProps) {
  if (!event) return null

  const handleCall = () => {
    // Open phone app with the number
    window.open(`tel:${event.from}`)
  }

  const handleSMS = () => {
    // Open SMS app with the number
    const message = `Hi, regarding our appointment on ${format(event.scheduledCallback!.date.toDate(), 'PPp')}`
    window.open(`sms:${event.from}?body=${encodeURIComponent(message)}`)
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Appointment Details
              </h2>
              <Badge variant={
                event.status === 'confirmed' ? 'success' :
                event.status === 'urgent' ? 'error' : 'warning'
              }>
                {event.status}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 dark:text-white">{event.from}</span>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                  {format(event.scheduledCallback!.date.toDate(), 'PPP')}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                  {format(event.scheduledCallback!.date.toDate(), 'p')}
                </span>
              </div>
            </div>

            {event.transcription && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Original Message
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  {event.transcription}
                </p>
              </div>
            )}

            {event.scheduledCallback?.notes && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Appointment Notes
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  {event.scheduledCallback.notes}
                </p>
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <Button
                variant="primary"
                className="flex-1"
                icon={<Phone className="w-4 h-4" />}
                onClick={handleCall}
              >
                Call
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                icon={<MessageSquare className="w-4 h-4" />}
                onClick={handleSMS}
              >
                Send SMS
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  )
} 