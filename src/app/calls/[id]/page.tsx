'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import { Call } from '@/lib/types/calls'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Phone, 
  Clock, 
  Calendar,
  MessageSquare,
  Play,
  Download,
  User,
  PhoneMissed,
  Voicemail,
  Filter
} from 'lucide-react'
import { format } from 'date-fns'

export default function CallDetailPage({
  params
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [call, setCall] = useState<Call | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  useEffect(() => {
    if (!params?.id) {
      setLoading(false)
      return
    }

    const fetchCall = async () => {
      try {
        const callDoc = await getDoc(doc(db, 'calls', params.id))
        if (callDoc.exists()) {
          setCall({ id: callDoc.id, ...callDoc.data() } as Call)
        }
      } catch (error) {
        console.error('Error fetching call:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCall()
  }, [params.id])

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  if (!call) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Call not found</p>
        </div>
      </Card>
    )
  }

  const getStatusIcon = () => {
    switch (call.status) {
      case 'answered':
        return <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
      case 'missed':
        return <PhoneMissed className="w-6 h-6 text-red-600 dark:text-red-400" />
      case 'voicemail':
        return <Voicemail className="w-6 h-6 text-amber-600 dark:text-amber-400" />
      default:
        return <Phone className="w-6 h-6 text-gray-600 dark:text-gray-400" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>
      </div>

      <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                {getStatusIcon()}
              </div>
              <h1 className="text-2xl font-bold">{call.from}</h1>
            </div>
            <div className="mt-2 space-y-1 text-primary-100">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{format(call.timestamp.toDate(), 'PPP')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{format(call.timestamp.toDate(), 'p')}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="secondary" icon={<Phone className="w-4 h-4" />}>
              Call Back
            </Button>
            <Button variant="secondary" icon={<MessageSquare className="w-4 h-4" />}>
              Send SMS
            </Button>
          </div>
        </div>
      </Card>

      {call.voicemailUrl && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Voicemail</h2>
          <div className="flex space-x-3">
            <Button variant="primary" icon={<Play className="w-4 h-4" />}>
              Play Voicemail
            </Button>
            <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
              Download
            </Button>
          </div>
        </Card>
      )}

      {call.transcription && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transcription</h2>
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
            {call.transcription}
          </p>
        </Card>
      )}

      <button
        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
        className="p-4 bg-white/10 rounded-full hover:bg-white/20 transition-colors relative group"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-40"
        />
        <Filter className="w-8 h-8 relative z-10" />
        <motion.div
          className="absolute inset-0 rounded-full bg-white/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [0.8, 1.05, 1],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white/30"
          initial={{ scale: 0.8, opacity: 0 }}
          whileHover={{
            scale: 1.1,
            opacity: 1,
            transition: { duration: 0.3 },
          }}
        />
      </button>
    </motion.div>
  )
} 