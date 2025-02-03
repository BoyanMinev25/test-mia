'use client'

import { Call } from '@/lib/types/calls'
import { format, isToday, isYesterday, isThisWeek } from 'date-fns'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface CallListProps {
  calls: Call[]
}

export default function CallList({ calls }: CallListProps) {
  const getTimeLabel = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'h:mm a')
    }
    if (isYesterday(date)) {
      return 'Yesterday'
    }
    if (isThisWeek(date)) {
      return format(date, 'EEEE') // Returns day name (Monday, Tuesday, etc.)
    }
    return format(date, 'MMM d')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'missed':
        return 'text-red-500 dark:text-red-400'
      case 'voicemail':
        return 'text-amber-500 dark:text-amber-400'
      default:
        return 'text-green-500 dark:text-green-400'
    }
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {calls.map((call) => (
        <Link
          key={call.id}
          href={`/calls/${call.id}`}
          className="block hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="px-4 py-3.5 flex items-center justify-between group">
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className={`text-base font-medium ${getStatusColor(call.status)}`}>
                  {call.from}
                </span>
              </div>
              {call.transcription && (
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 truncate pr-4">
                  {call.transcription}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {getTimeLabel(call.timestamp.toDate())}
              </span>
              <ChevronRight 
                className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" 
              />
            </div>
          </div>
        </Link>
      ))}

      {calls.length === 0 && (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
          <p>No calls found</p>
        </div>
      )}
    </div>
  )
} 