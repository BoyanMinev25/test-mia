'use client'

import { useEffect, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { X, Calendar, Clock } from 'lucide-react'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import { Call, CallHistory } from '@/lib/types/calls'
import { format } from 'date-fns'
import { useAuth } from '@/lib/hooks/useAuth'

interface CallHistoryModalProps {
  phoneNumber: string
  isOpen: boolean
  onClose: () => void
}

export default function CallHistoryModal({
  phoneNumber,
  isOpen,
  onClose
}: CallHistoryModalProps) {
  const { user } = useAuth()
  const [history, setHistory] = useState<CallHistory | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return

      setLoading(true)
      try {
        const callsRef = collection(db, 'calls')
        const q = query(
          callsRef,
          where('userId', '==', user.uid),
          where('from', '==', phoneNumber),
          orderBy('timestamp', 'desc')
        )

        const querySnapshot = await getDocs(q)
        const calls = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Call[]

        if (calls.length > 0) {
          setHistory({
            phoneNumber,
            totalCalls: calls.length,
            firstCall: calls[calls.length - 1].timestamp,
            lastCall: calls[0].timestamp,
            calls
          })
        }
      } catch (error) {
        console.error('Error fetching call history:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchHistory()
    }
  }, [isOpen, phoneNumber, user])

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />

        <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>

          <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Call History for {phoneNumber}
          </Dialog.Title>

          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : history ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Calls</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {history.totalCalls}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">First Call</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {format(history.firstCall.toDate(), 'PPp')}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last Call</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {format(history.lastCall.toDate(), 'PPp')}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Call Timeline
                </h3>
                <div className="space-y-4">
                  {history.calls.map((call) => (
                    <div
                      key={call.id}
                      className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {format(call.timestamp.toDate(), 'PPp')}
                          </span>
                        </div>
                        {call.scheduledCallback && (
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-primary-500" />
                            <span className="text-sm text-primary-600 dark:text-primary-400">
                              Callback scheduled for{' '}
                              {format(call.scheduledCallback.date.toDate(), 'PPp')}
                            </span>
                          </div>
                        )}
                      </div>
                      {call.transcription && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {call.transcription}
                        </p>
                      )}
                      {call.scheduledCallback?.notes && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                          Note: {call.scheduledCallback.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No call history found for this number
            </div>
          )}
        </div>
      </div>
    </Dialog>
  )
} 