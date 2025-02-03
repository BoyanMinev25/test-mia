'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import Card from '@/components/ui/Card'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, Clock, User, Filter, X } from 'lucide-react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import { Call } from '@/lib/types/calls'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from 'date-fns'
import Badge from '@/components/ui/Badge'
import CalendarEventModal from '@/components/modals/CalendarEventModal'
import Button from '@/components/ui/Button'

export default function CalendarPage() {
  const { user } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState<Call[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Call | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const statuses = [
    { 
      id: 'pending', 
      label: 'Pending', 
      icon: <Clock className="w-3.5 h-3.5" />,
      bgClass: 'bg-white dark:bg-transparent hover:bg-amber-100 dark:hover:bg-amber-100/10 text-amber-500 dark:text-amber-100 border border-amber-200 dark:border-amber-200/20',
      activeClass: 'bg-amber-500 text-white border-amber-500'
    },
    { 
      id: 'confirmed', 
      label: 'Confirmed', 
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      bgClass: 'bg-white dark:bg-transparent hover:bg-green-100 dark:hover:bg-green-100/10 text-green-500 dark:text-green-100 border border-green-200 dark:border-green-200/20',
      activeClass: 'bg-green-500 text-white border-green-500'
    },
    { 
      id: 'urgent', 
      label: 'Urgent', 
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      bgClass: 'bg-white dark:bg-transparent hover:bg-red-100 dark:hover:bg-red-100/10 text-red-500 dark:text-red-100 border border-red-200 dark:border-red-200/20',
      activeClass: 'bg-red-500 text-white border-red-500'
    }
  ]

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return

      setLoading(true)
      try {
        const callsRef = collection(db, 'calls')
        let q = query(
          callsRef,
          where('userId', '==', user.uid),
          where('scheduledCallback', '!=', null)
        )

        const querySnapshot = await getDocs(q)
        const fetchedEvents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Call[]

        setEvents(fetchedEvents)
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [user])

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  })

  const filteredEvents = events.filter(event => 
    selectedStatuses.length === 0 || selectedStatuses.includes(event.status)
  )

  const getEventsForDay = (date: Date) => {
    return filteredEvents.filter(event => 
      event.scheduledCallback && 
      isSameDay(event.scheduledCallback.date.toDate(), date)
    ).sort((a, b) => 
      a.scheduledCallback!.date.toDate().getTime() - 
      b.scheduledCallback!.date.toDate().getTime()
    )
  }

  const getSelectedDayEvents = () => {
    return filteredEvents.filter(event => 
      event.scheduledCallback && 
      isSameDay(event.scheduledCallback.date.toDate(), selectedDate)
    ).sort((a, b) => 
      a.scheduledCallback!.date.toDate().getTime() - 
      b.scheduledCallback!.date.toDate().getTime()
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Card with Filters */}
      <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white overflow-hidden relative">
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="mt-2 text-primary-100">Manage your appointments</p>
          </div>
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
            {/* Ripple effect */}
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
            {/* Hover ring effect */}
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
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Filter by Status</h3>
                    <button
                      onClick={() => setIsFiltersOpen(false)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      aria-label="Close filters"
                    >
                      <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {statuses.map(status => (
                      <button
                        key={status.id}
                        onClick={() => {
                          setSelectedStatuses(prev => 
                            prev.includes(status.id)
                              ? prev.filter(s => s !== status.id)
                              : [...prev, status.id]
                          )
                        }}
                        className={`
                          flex items-center space-x-1.5 px-4 py-2 rounded-lg
                          transition-all duration-200 shadow-sm relative z-30
                          ${selectedStatuses.includes(status.id)
                            ? status.activeClass
                            : status.bgClass
                          }
                        `}
                      >
                        <span className="relative z-30 flex items-center space-x-1.5">
                          {status.icon}
                          <span className="font-medium">{status.label}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8">
          <div className="w-32 h-32 bg-white/10 rounded-full" />
        </div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8">
          <div className="w-24 h-24 bg-white/5 rounded-full" />
        </div>
      </Card>

      {/* Calendar Header and Navigation */}
      <Card className="overflow-visible">
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE, MMMM d')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Widget - Today's/Selected Day's Appointments */}
        <div className="mb-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isToday(selectedDate) ? "Today's" : `${format(selectedDate, 'MMM d')}'s`} Appointments
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            {!isToday(selectedDate) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
              >
                Back to Today
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {getSelectedDayEvents().map(event => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="px-4 py-3.5 flex items-center justify-between group">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-base font-medium ${
                        event.status === 'confirmed' ? 'text-green-500' :
                        event.status === 'urgent' ? 'text-red-500' : 'text-amber-500'
                      }`}>
                        {event.from}
                      </span>
                    </div>
                    {event.scheduledCallback?.notes && (
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 truncate pr-4">
                        {event.scheduledCallback.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {format(event.scheduledCallback!.date.toDate(), 'h:mm a')}
                    </span>
                    <ChevronRight 
                      className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" 
                    />
                  </div>
                </div>
              </button>
            ))}
            {getSelectedDayEvents().length === 0 && (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No appointments scheduled for this day</p>
              </div>
            )}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-800">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                className="py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 border-t border-gray-200 dark:border-gray-700">
            {days.map(day => {
              const dayEvents = getEventsForDay(day)
              const isDayToday = isToday(day)
              const isSelected = isSameDay(day, selectedDate)
              const isCurrentMonth = isSameMonth(day, currentMonth)
              
              return (
                <div
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    min-h-[100px] p-1 border-b border-r border-gray-200 dark:border-gray-700
                    cursor-pointer transition-colors relative
                    ${!isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'}
                    ${isSelected ? 'ring-2 ring-primary-500 ring-inset' : ''}
                    hover:bg-gray-50 dark:hover:bg-gray-700/50
                  `}
                >
                  <div className="flex items-center justify-center">
                    <span className={`
                      w-6 h-6 flex items-center justify-center rounded-full text-sm
                      ${isDayToday ? 'bg-primary-500 text-white' : ''}
                      ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'}
                    `}>
                      {format(day, 'd')}
                    </span>
                  </div>

                  {/* Events for the day */}
                  <div className="mt-1 space-y-1">
                    {dayEvents.map((event, index) => (
                      <button
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedEvent(event)
                        }}
                        className={`
                          w-full text-left px-1.5 py-1 rounded-md text-xs
                          ${event.status === 'confirmed' ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                            event.status === 'urgent' ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                            'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'}
                          ${index >= 2 ? 'hidden md:block' : ''}
                        `}
                      >
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">
                            {format(event.scheduledCallback!.date.toDate(), 'HH:mm')}
                          </span>
                          <span className="truncate">{event.from}</span>
                        </div>
                      </button>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 px-1.5 md:hidden">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Event Modal */}
      <CalendarEventModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </motion.div>
  )
} 