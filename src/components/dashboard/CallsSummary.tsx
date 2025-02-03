'use client'

import { useEffect, useState } from 'react'
import Card from '../ui/Card'
import { Voicemail, ChevronDown, ChevronUp } from 'lucide-react'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import { useAuth } from '@/lib/hooks/useAuth'
import { format } from 'date-fns'
import Link from 'next/link'

interface CallStats {
  total: number
  voicemail: number
  calls: {
    voicemail: any[]
  }
}

export default function CallsSummary() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<CallStats>({
    total: 0,
    voicemail: 0,
    calls: {
      voicemail: []
    }
  })
  const [expanded, setExpanded] = useState<boolean>(false)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        console.log('No user found in CallsSummary')
        return
      }

      setLoading(true)
      try {
        console.log('Fetching stats for user:', user.uid)
        const callsRef = collection(db, 'calls')
        const q = query(
          callsRef, 
          where('userId', '==', user.uid),
          where('status', '==', 'voicemail'),
          orderBy('timestamp', 'desc')
        )
        console.log('Executing query...')
        
        try {
          const querySnapshot = await getDocs(q)
          console.log('Query snapshot size:', querySnapshot.size)
          
          const newStats = {
            total: 0,
            voicemail: 0,
            calls: {
              voicemail: []
            }
          }

          querySnapshot.forEach((doc) => {
            const call = { id: doc.id, ...doc.data() }
            console.log('Processing call:', call)
            newStats.total++
            newStats.voicemail++
            newStats.calls.voicemail.push(call as any) // Added type assertion to fix type error
          })

          console.log('Final stats:', newStats)
          setStats(newStats)
        } catch (error: any) {
          console.error('Error fetching voicemails:', error)
        }
      } catch (error) {
        console.error('Error in fetchStats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      console.log('User present, fetching stats...')
      fetchStats()
    }
  }, [user])

  const renderVoicemailList = (voicemails: any[]) => {
    return (
      <div className="mt-4 space-y-2">
        {voicemails.map((voicemail) => (
          <Link
            key={voicemail.id}
            href={`/calls/${voicemail.id}`}
            className="block p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{voicemail.from}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {format(voicemail.timestamp.toDate(), 'PPp')}
                </p>
                {voicemail.transcription && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {voicemail.transcription}
                  </p>
                )}
              </div>
              {voicemail.duration && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.floor(voicemail.duration / 60)}m {voicemail.duration % 60}s
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        <Card className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="flex flex-col">
        <button 
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-full">
              <Voicemail className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Voicemails</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.voicemail}</p>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expanded && renderVoicemailList(stats.calls.voicemail)}
      </Card>
    </div>
  )
} 