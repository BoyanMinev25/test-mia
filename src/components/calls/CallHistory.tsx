'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, ChevronDown, Voicemail, Calendar, History, ChevronRight, Clock, CheckCircle, AlertTriangle, Plus, Tag, MessageSquare, AlertCircle, CalendarCheck, Phone, SlidersHorizontal, Filter } from 'lucide-react'
import Card from '../ui/Card'
import { format } from 'date-fns'
import { collection, query, where, orderBy, getDocs, doc, updateDoc, Timestamp, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import { useAuth } from '@/lib/hooks/useAuth'
import { Call } from '@/lib/types/calls'
import { motion, AnimatePresence } from 'framer-motion'
import SMSModal from '../modals/SMSModal'
import AppointmentModal from '../modals/AppointmentModal'
import Link from 'next/link'
import Badge from '../ui/Badge'
import { useSearch } from '@/lib/contexts/SearchContext'
import SearchFilters from '../modals/SearchFilters'
import CallRecord from './CallRecord'
import toast from 'react-hot-toast'

interface StatusCategory {
  id: string
  label: string
  color: string
  icon: JSX.Element
}

const defaultStatuses: StatusCategory[] = [
  {
    id: 'pending',
    label: 'Pending',
    color: 'text-yellow-500',
    icon: <Clock className="w-4 h-4" />
  },
  {
    id: 'confirmed',
    label: 'Confirmed',
    color: 'text-green-500',
    icon: <CheckCircle className="w-4 h-4" />
  },
  {
    id: 'urgent',
    label: 'Urgent',
    color: 'text-red-500',
    icon: <AlertTriangle className="w-4 h-4" />
  }
]

interface SMSModalProps {
  phoneNumber: string
  isOpen: boolean
  onClose: () => void
  onSend: (message: string) => Promise<void>
}

export default function CallHistory() {
  const { user } = useAuth()
  const { searchTerm, filters, setSearchTerm, setFilters } = useSearch()
  const [calls, setCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCallId, setExpandedCallId] = useState<string | null>(null)
  const [customStatuses, setCustomStatuses] = useState<StatusCategory[]>([])
  const [isAddingStatus, setIsAddingStatus] = useState(false)
  const [newStatusLabel, setNewStatusLabel] = useState('')
  const [isSMSModalOpen, setIsSMSModalOpen] = useState(false)
  const [selectedCallForSMS, setSelectedCallForSMS] = useState<Call | null>(null)
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
  const [selectedCall, setSelectedCall] = useState<Call | null>(null)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const expandedCallRef = useRef<HTMLDivElement>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const fetchCalls = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const callsRef = collection(db, 'calls')
      const q = query(
        callsRef,
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const fetchedCalls = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Call[]

      // Custom sort by priority
      const sortedCalls = fetchedCalls.sort((a, b) => {
        const getPriority = (status: string) => {
          if (status === 'urgent') return 0
          if (status === 'pending') return 1
          if (status.includes('scheduled')) return 2
          return 3
        }
        return getPriority(a.status) - getPriority(b.status)
      })

      setCalls(sortedCalls)
    } catch (error) {
      console.error('Error fetching calls:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchCalls()
  }, [fetchCalls])

  // Effect to handle scrolling when a call is expanded
  useEffect(() => {
    if (expandedCallId && expandedCallRef.current) {
      setTimeout(() => {
        const element = expandedCallRef.current
        if (element) {
          const elementTop = element.getBoundingClientRect().top
          const offset = elementTop + window.scrollY - 100 // 100px buffer from top
          
          window.scrollTo({
            top: offset,
            behavior: 'smooth'
          })
        }
      }, 100)
    }
  }, [expandedCallId])

  const toggleCallExpansion = (callId: string) => {
    setExpandedCallId(expandedCallId === callId ? null : callId)
  }

  const handleAddCustomStatus = () => {
    if (newStatusLabel.trim()) {
      const newStatus: StatusCategory = {
        id: `custom-${Date.now()}`,
        label: newStatusLabel.trim(),
        color: 'text-gray-500',
        icon: <Tag className="w-4 h-4" />
      }
      setCustomStatuses([...customStatuses, newStatus])
      setNewStatusLabel('')
      setIsAddingStatus(false)
    }
  }

  const handleSchedule = async (call: Call) => {
    try {
      const callRef = doc(db, 'calls', call.id)
      await updateDoc(callRef, {
        scheduledCallback: {
          date: Timestamp.fromDate(new Date()),
          notes: ''
        }
      })
      // Refresh calls
      fetchCalls()
    } catch (error) {
      console.error('Error scheduling callback:', error)
    }
  }

  const handleViewHistory = async (call: Call) => {
    try {
      const callsRef = collection(db, 'calls')
      const q = query(
        callsRef,
        where('from', '==', call.from),
        orderBy('timestamp', 'desc')
      )
      const snapshot = await getDocs(q)
      // Instead of just console.log, we'll show this in the UI
      setSelectedCall(call)
      // You might want to create a new modal for showing history
      toast.success(`Found ${snapshot.docs.length} previous calls`)
    } catch (error) {
      console.error('Error viewing history:', error)
      toast.error('Failed to load call history')
    }
  }

  const addTestCall = async () => {
    if (!user) {
      toast.error('Please sign in to add test calls')
      return
    }

    try {
      const callsRef = collection(db, 'calls')
      const testCall = {
        userId: user.uid,
        from: `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 10000)}`,
        timestamp: Timestamp.fromDate(new Date()),
        duration: Math.floor(Math.random() * 300),
        transcription: "Hello, I'm calling about the project deadline. Could you please give me a call back? It's important.",
        status: 'pending',
        scheduledCallback: Math.random() > 0.5 ? {
          date: Timestamp.fromDate(new Date(Date.now() + 86400000)),
          notes: 'Need to discuss project timeline'
        } : null
      }

      await addDoc(callsRef, testCall)
      await fetchCalls()
      toast.success('Test call added successfully')
    } catch (error) {
      console.error('Error adding test call:', error)
      toast.error('Failed to add test call')
    }
  }

  // Update the status when selecting from our categories
  const handleStatusChange = async (callId: string, newStatus: string) => {
    try {
      const callRef = doc(db, 'calls', callId)
      await updateDoc(callRef, {
        status: newStatus
      })
      await fetchCalls()
      toast.success('Status updated successfully')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const handleSendSMS = (phoneNumber: string, message: string) => {
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message)
    // Create the SMS link
    const smsLink = `sms:${phoneNumber}?body=${encodedMessage}`
    // Open in new window/tab
    window.open(smsLink, '_blank')
  }

  const handleScheduleAppointment = async (callId: string, date: Date, time: string, message: string) => {
    try {
      const callRef = doc(db, 'calls', callId)
      await updateDoc(callRef, {
        status: 'scheduled',
        scheduledCallback: {
          date: Timestamp.fromDate(date),
          notes: message
        }
      })
      await fetchCalls() // Refresh the calls list
      setIsAppointmentModalOpen(false)
    } catch (error) {
      console.error('Error scheduling appointment:', error)
    }
  }

  const getStatusIconComponent = (status: string, scheduledDate?: any) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'urgent':
        return <AlertTriangle className="w-6 h-6 text-red-500" />
      default:
        return scheduledDate ? 
          <CalendarCheck className="w-6 h-6 text-green-500" /> : 
          <AlertCircle className="w-6 h-6 text-gray-500" />
    }
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400'
      case 'confirmed':
        return 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
      case 'urgent':
        return 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
      default:
        return 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400'
    }
  }

  const getTimeLabel = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) {
      return 'Just now'
    } else if (diff < 3600) {
      return `${Math.floor(diff / 60)} minutes ago`
    } else if (diff < 86400) {
      return `${Math.floor(diff / 3600)} hours ago`
    } else if (diff < 259200) {
      return `${Math.floor(diff / 86400)} days ago`
    } else {
      return format(date, 'MMM d, yyyy, h:mm a')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'missed':
        return 'text-red-500 dark:text-red-400'
      case 'voicemail':
        return 'text-amber-500 dark:text-amber-400'
      case 'confirmed':
        return 'text-green-500 dark:text-green-400'
      default:
        return 'text-gray-900 dark:text-white'
    }
  }

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_blank')
  }

  const getFilteredCalls = () => {
    return calls
      .filter(call => {
        // Filter by search term
        const matchesSearch = searchTerm
          ? call.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
            call.transcription?.toLowerCase().includes(searchTerm.toLowerCase())
          : true;

        // Filter by status - check if any selected status matches
        const matchesStatus = filters.statuses?.length > 0
          ? filters.statuses.some((status: string) => {
              if (status === 'confirmed') {
                // Match both 'confirmed' and 'scheduled' statuses when 'confirmed' is selected
                return call.status === 'confirmed' || call.status === 'scheduled';
              }
              return call.status === status;
            })
          : true;

        // Filter by date range - only if both dates are selected
        const callDate = call.timestamp.toDate();
        const matchesDateRange = (
          // If either date is not selected, don't filter by that date
          (!filters.fromDate || new Date(filters.fromDate) <= callDate) &&
          (!filters.toDate || new Date(filters.toDate) >= callDate)
        );

        return matchesSearch && matchesStatus && matchesDateRange;
      })
      // Sort by timestamp, most recent first
      .sort((a, b) => b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime());
  };

  const filteredCalls = getFilteredCalls();

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) {
      return 'Just now'
    } else if (diff < 3600) {
      return `${Math.floor(diff / 60)} minutes ago`
    } else if (diff < 86400) {
      return `${Math.floor(diff / 3600)} hours ago`
    } else if (diff < 259200) {
      return `${Math.floor(diff / 86400)} days ago`
    } else {
      return format(date, 'MMM d, yyyy, h:mm a')
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'confirmed':
        return 'success'
      case 'urgent':
        return 'danger'
      default:
        return 'neutral'
    }
  }

  const toggleUrgentStatus = async (e: React.MouseEvent, call: Call) => {
    e.stopPropagation()
    if (call.status !== 'pending' && call.status !== 'urgent') return

    try {
      const newStatus = call.status === 'pending' ? 'urgent' : 'pending'
      const callRef = doc(db, 'calls', call.id)
      await updateDoc(callRef, {
        status: newStatus
      })
      await fetchCalls()
      toast.success(`Call marked as ${newStatus}`)
    } catch (error) {
      console.error('Error toggling urgent status:', error)
      toast.error('Failed to update call status')
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleFilterChange = (filters: any) => {
    setFilters(filters)
  }

  // Effect to handle calendar state
  useEffect(() => {
    const handleCalendarState = () => {
      const searchFilters = document.querySelector('.search-filters')
      if (!searchFilters) return
      
      const fromPicker = searchFilters.querySelector('[data-from-picker]')
      const toPicker = searchFilters.querySelector('[data-to-picker]')
      
      setIsCalendarOpen(!!(fromPicker || toPicker))
    }

    // Set up a mutation observer to watch for calendar changes
    const observer = new MutationObserver(handleCalendarState)
    const searchFilters = document.querySelector('.search-filters')
    
    if (searchFilters) {
      observer.observe(searchFilters, { childList: true, subtree: true })
    }

    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Blur overlay */}
      {isCalendarOpen && (
        <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-[99]" />
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`space-y-6 relative`}
      >
        {/* Header */}
        <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white overflow-hidden relative">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h1 className="text-3xl font-bold">Call History</h1>
              <p className="mt-2 text-primary-100">{calls.length} calls total</p>
            </div>
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="p-4 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Toggle filters"
            >
              <Filter className="w-8 h-8" />
            </button>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8">
            <div className="w-32 h-32 bg-white/10 rounded-full" />
          </div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8">
            <div className="w-24 h-24 bg-white/5 rounded-full" />
          </div>

          {/* Expandable Filters Section */}
          <AnimatePresence>
            {isFiltersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 bg-white dark:bg-gray-800 rounded-xl p-4 relative z-20 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-4 w-full">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Search & Filter</h3>
                      <button
                        onClick={() => setIsFiltersOpen(false)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                        aria-label="Close filters"
                      >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>

                    <SearchFilters
                      onClose={() => setIsFiltersOpen(false)}
                      onSearch={handleSearch}
                      onFilterChange={handleFilterChange}
                      initialFilters={filters}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Test Button */}
        <div className="flex justify-end">
          <button
            onClick={addTestCall}
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors"
          >
            Add Test Call
          </button>
        </div>

        {/* Calls List */}
        <Card className="p-0">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredCalls.map((call) => (
              <div 
                key={call.id}
                ref={call.id === expandedCallId ? expandedCallRef : null}
                className={`
                  group call-record relative
                  ${expandedCallId && expandedCallId !== call.id ? 'blur-[2px]' : ''}
                `}
              >
                <div 
                  className={`
                    px-1 py-2 cursor-pointer
                    ${expandedCallId === call.id ? 'bg-gray-50 dark:bg-gray-800/50' : ''}
                    hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                  `}
                  onClick={() => toggleCallExpansion(call.id)}
                >
                  {/* Main content layout */}
                  <div className="flex flex-col space-y-1.5">
                    {/* Phone number row with status */}
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 pl-1">
                        {call.from}
                      </h3>
                      <div 
                        className={`
                          flex items-center ml-3 relative group/status
                          ${(call.status === 'pending' || call.status === 'urgent') ? 'cursor-pointer' : ''}
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (call.status === 'pending' || call.status === 'urgent') {
                            toggleUrgentStatus(e, call);
                          }
                        }}
                      >
                        <div className="relative">
                          {getStatusIconComponent(call.status, call.scheduledCallback?.date)}
                          {/* Hover tooltip */}
                          {(call.status === 'pending' || call.status === 'urgent') && (
                            <div className="absolute opacity-0 group-hover/status:opacity-100 transition-opacity duration-200 -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                              {call.status === 'pending' ? 'Mark as urgent' : 'Mark as pending'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Message preview */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 px-1">
                      {call.transcription}
                    </p>

                    {/* Date/time row */}
                    <div className="flex items-center justify-end text-sm text-gray-500 px-1">
                      {format(call.timestamp.toDate(), 'MMM dd, yyyy, h:mm a')}
                    </div>
                  </div>

                  {/* Expand indicator */}
                  <div className="absolute right-1 top-1/2 -translate-y-1/2">
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                        expandedCallId === call.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {expandedCallId === call.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-1 py-2 bg-gray-50 dark:bg-gray-800/50 space-y-3"
                    >
                      {/* Message Bubble */}
                      {call.transcription && (
                        <div className="bg-white dark:bg-gray-700/50 rounded-lg p-3 shadow-sm">
                          <p className="text-gray-600 dark:text-gray-300">
                            {call.transcription}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Left Column */}
                        <div className="space-y-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedCallForSMS(call)
                              setIsSMSModalOpen(true)
                            }}
                            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            <MessageSquare className="w-5 h-5" />
                            <span>Send SMS</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewHistory(call)
                            }}
                            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            <History className="w-5 h-5" />
                            <span>History</span>
                          </button>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedCall(call)
                              setIsAppointmentModalOpen(true)
                            }}
                            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0063CC] transition-colors"
                          >
                            <Calendar className="w-5 h-5" />
                            <span>Schedule</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCall(call.from)
                            }}
                            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-colors"
                          >
                            <Phone className="w-5 h-5" />
                            <span>Call</span>
                          </button>
                        </div>
                      </div>

                      {/* Scheduled Info */}
                      {call.scheduledCallback?.date && (
                        <div className="bg-[#007AFF]/5 dark:bg-[#007AFF]/10 rounded-lg p-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-[#007AFF]">
                              <Calendar className="w-5 h-5" />
                              <span className="text-sm font-medium">Scheduled</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {format(call.scheduledCallback.date.toDate(), 'MMM d, h:mm a')}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {filteredCalls.length === 0 && (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                <p>No calls found</p>
              </div>
            )}
          </div>
        </Card>

        {/* Modals */}
        <AppointmentModal
          call={selectedCall}
          isOpen={isAppointmentModalOpen}
          onClose={() => setIsAppointmentModalOpen(false)}
          onSchedule={handleScheduleAppointment}
        />

        <SMSModal
          phoneNumber={selectedCallForSMS?.from || ''}
          transcription={selectedCallForSMS?.transcription || ''}
          isOpen={isSMSModalOpen}
          onClose={() => {
            setIsSMSModalOpen(false)
            setSelectedCallForSMS(null)
          }}
        />
      </motion.div>
    </>
  )
} 