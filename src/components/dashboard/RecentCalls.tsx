'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import { useAuth } from '@/lib/hooks/useAuth'
import { Call } from '@/lib/types/calls'
import Card from '../ui/Card'
import { Calendar, History, Voicemail, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import ScheduleCallbackModal from '../modals/ScheduleCallbackModal'
import CallHistoryModal from '../modals/CallHistoryModal'
import { format, isToday, isYesterday, isThisWeek } from 'date-fns'

interface RecentCallsProps {
  filter: 'handled' | 'unhandled'
}

export default function RecentCalls({ filter }: RecentCallsProps) {
  const { user } = useAuth()
  const [recentCalls, setRecentCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCall, setSelectedCall] = useState<Call | null>(null)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)

  useEffect(() => {
    const fetchRecentCalls = async () => {
      if (!user) return

      setLoading(true)
      try {
        const callsRef = collection(db, 'calls')
        const conditions = [
          where('userId', '==', user.uid),
          where('status', '==', 'voicemail'),
        ]

        // Add filter condition based on prop
        if (filter === 'unhandled') {
          conditions.push(where('scheduledCallback', '==', null))
        } else {
          conditions.push(where('scheduledCallback', '!=', null))
        }

        const q = query(
          callsRef,
          ...conditions,
          orderBy('timestamp', 'desc'),
          limit(5)
        )
        
        const querySnapshot = await getDocs(q)
        const calls = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Call[]

        setRecentCalls(calls)
      } catch (error) {
        console.error('Error fetching recent calls:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchRecentCalls()
    }
  }, [user, filter])

  const handleSchedule = (call: Call) => {
    setSelectedCall(call)
    setIsScheduleModalOpen(true)
  }

  const handleViewHistory = (call: Call) => {
    setSelectedCall(call)
    setIsHistoryModalOpen(true)
  }

  const getTimeLabel = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'h:mm a')
    }
    if (isYesterday(date)) {
      return 'Yesterday'
    }
    if (isThisWeek(date)) {
      return format(date, 'EEEE')
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

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">
        {filter === 'unhandled' ? 'Unhandled Calls' : 'Scheduled Callbacks'}
      </h2>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {recentCalls.map((call) => (
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

        {recentCalls.length === 0 && (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            <p>No {filter === 'unhandled' ? 'unhandled calls' : 'scheduled callbacks'}</p>
          </div>
        )}
      </div>

      {selectedCall && (
        <>
          <ScheduleCallbackModal
            call={selectedCall}
            isOpen={isScheduleModalOpen}
            onClose={() => setIsScheduleModalOpen(false)}
            onScheduled={() => {
              // Refresh the calls list
              if (user) fetchRecentCalls()
            }}
          />
          
          <CallHistoryModal
            phoneNumber={selectedCall.from}
            isOpen={isHistoryModalOpen}
            onClose={() => setIsHistoryModalOpen(false)}
          />
        </>
      )}
    </Card>
  )
} 