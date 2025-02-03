'use client'

import { format } from 'date-fns'
import { MessageSquare, CalendarCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from '../ui/Card'
import { Call } from '@/lib/types/calls'

interface CallRecordProps {
  call: Call
  isExpanded: boolean
  statusIcon: React.ReactNode
  onToggleExpand: () => void
  onSMSClick: (e: React.MouseEvent) => void
  onAppointmentClick: (e: React.MouseEvent) => void
}

export default function CallRecord({
  call,
  isExpanded,
  statusIcon,
  onToggleExpand,
  onSMSClick,
  onAppointmentClick
}: CallRecordProps) {
  return (
    <Card
      className="hover:shadow-md transition-shadow duration-200 w-full"
      onClick={onToggleExpand}
    >
      <div className="flex flex-col space-y-3">
        {/* Header section with phone and status */}
        <div className="flex items-start justify-between w-full">
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
              {call.from}
            </h3>
          </div>
          <div className="flex-shrink-0">
            {statusIcon}
          </div>
        </div>

        {/* Message preview */}
        <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 w-full">
          {call.transcription}
        </div>

        {/* Footer section with date and actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pt-2 space-y-2 sm:space-y-0">
          <div className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
            {format(call.timestamp.toDate(), 'MMM dd, yyyy, h:mm a')}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onSMSClick}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={onAppointmentClick}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <CalendarCheck className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            {/* Additional call details can be added here */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Duration:</span> {call.duration} seconds
              </p>
              {call.scheduledCallback && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Scheduled Callback:</span>{' '}
                  {format(call.scheduledCallback.date.toDate(), 'MMM dd, yyyy, h:mm a')}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
} 