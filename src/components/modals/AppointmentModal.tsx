'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { Calendar as CalendarIcon, Clock, X, ChevronLeft, ChevronRight, ChevronDown, Loader, Bot } from 'lucide-react'
import Button from '../ui/Button'
import { Call } from '@/lib/types/calls'
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isPast } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface AppointmentModalProps {
  call: Call | null
  isOpen: boolean
  onClose: () => void
  onSchedule: (id: string, date: Date, time: string, message: string) => Promise<void>
}

// Generate hours (0-23)
const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
// Generate minutes (00, 15, 30, 45)
const minutes = ['00', '15', '30', '45']

export default function AppointmentModal({
  call,
  isOpen,
  onClose,
  onSchedule
}: AppointmentModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedHour, setSelectedHour] = useState('09')
  const [selectedMinute, setSelectedMinute] = useState('00')
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(true)
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [scheduling, setScheduling] = useState(false)
  const [suggestedMessage, setSuggestedMessage] = useState('')
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTime, setSelectedTime] = useState('09:00')
  
  const hourListRef = useRef<HTMLDivElement>(null)
  const minuteListRef = useRef<HTMLDivElement>(null)

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(null)
      setIsCalendarExpanded(true)
      setIsTimePickerOpen(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (isTimePickerOpen) {
      // Scroll to selected values
      const hourElement = document.getElementById(`hour-${selectedHour}`)
      const minuteElement = document.getElementById(`minute-${selectedMinute}`)
      
      if (hourElement && hourListRef.current) {
        hourListRef.current.scrollTop = hourElement.offsetTop - 100
      }
      if (minuteElement && minuteListRef.current) {
        minuteListRef.current.scrollTop = minuteElement.offsetTop - 100
      }
    }
  }, [isTimePickerOpen, selectedHour, selectedMinute])

  useEffect(() => {
    if (selectedHour && selectedMinute) {
      setSelectedTime(`${selectedHour}:${selectedMinute}`)
    }
  }, [selectedHour, selectedMinute])

  const handlePrevMonth = () => setCurrentMonth(prev => addMonths(prev, -1))
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1))

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  })

  const getSuggestion = async () => {
    if (!call?.transcription || !selectedDate) return

    setIsLoadingSuggestion(true)
    try {
      const response = await fetch('/api/openai/suggest-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcription: call.transcription,
          date: selectedDate ? format(selectedDate, 'PPP') : '',
          time: `${selectedHour}:${selectedMinute}`
        })
      })

      const data = await response.json()
      setSuggestedMessage(data.suggestion)
      setMessage(data.suggestion)
    } catch (error) {
      console.error('Error getting suggestion:', error)
    } finally {
      setIsLoadingSuggestion(false)
    }
  }

  const handleSchedule = async () => {
    // More thorough validation
    if (!selectedDate || !selectedHour || !selectedMinute || !message.trim() || !call?.id || !call?.from) {
      toast.error('Please fill in all required fields', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#F87171',
          color: '#FFFFFF',
          borderRadius: '0.75rem',
        },
      })
      return
    }

    setScheduling(true)
    try {
      const time = `${selectedHour}:${selectedMinute}`
      
      // Validate time format
      if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
        throw new Error('Invalid time format')
      }
      
      // Create and validate date object
      const scheduledDateTime = new Date(`${selectedDate.toISOString().split('T')[0]}T${time}`)
      if (isNaN(scheduledDateTime.getTime())) {
        throw new Error('Invalid date/time')
      }

      await onSchedule(call.id, scheduledDateTime, time, message)
      
      // Create SMS message with appointment details
      const smsMessage = `Your appointment has been scheduled for ${format(scheduledDateTime, 'MMM d')} at ${format(scheduledDateTime, 'h:mm a')}. ${message}`
      
      // Open SMS app with pre-filled message
      const encodedMessage = encodeURIComponent(smsMessage)
      const smsLink = `sms:${call.from}?body=${encodedMessage}`
      window.open(smsLink, '_blank')
      
      onClose()
    } catch (error) {
      console.error('Error scheduling appointment:', error)
      toast.error('Failed to schedule appointment. Please try again.', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#F87171',
          color: '#FFFFFF',
          borderRadius: '0.75rem',
        },
      })
    } finally {
      setScheduling(false)
    }
  }

  const handleSuggestAppointment = async () => {
    if (!call?.transcription) return

    if (!selectedDate || !selectedHour || !selectedMinute) {
      toast.error('Please select date and time first', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#F87171',
          color: '#FFFFFF',
          borderRadius: '0.75rem',
        },
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/openai/suggest-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcription: call.transcription,
          date: format(selectedDate, 'PPP'),
          time: `${selectedHour}:${selectedMinute}`
        })
      })

      const data = await response.json()
      setMessage(data.suggestion)
    } catch (error) {
      console.error('Error getting suggestion:', error)
      toast.error('Failed to get AI suggestion. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6"
        >
          <div className="p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>

            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Schedule Appointment
            </Dialog.Title>

            <div className="space-y-4">
              {/* Date Selection */}
              <div>
                <div 
                  onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
                  className="flex items-center justify-between cursor-pointer p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                >
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select date'}
                    </span>
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      isCalendarExpanded ? 'rotate-180' : ''
                    }`} 
                  />
                </div>

                <AnimatePresence>
                  {isCalendarExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {/* Calendar UI */}
                      <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <button
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <h2 className="text-lg font-semibold">
                            {format(currentMonth, 'MMMM yyyy')}
                          </h2>
                          <button
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                              {day}
                            </div>
                          ))}
                          
                          {days.map((day) => {
                            const isSelected = selectedDate && isSameDay(day, selectedDate)
                            const isPastDay = isPast(day) && !isSameDay(day, new Date())
                            const isDisabled = isPastDay || !isSameMonth(day, currentMonth)

                            return (
                              <button
                                key={day.toString()}
                                onClick={() => {
                                  if (!isDisabled) {
                                    setSelectedDate(day)
                                    setIsCalendarExpanded(false)
                                  }
                                }}
                                disabled={isDisabled}
                                className={`
                                  p-2 rounded-full text-sm relative
                                  ${isDisabled ? 
                                    'text-gray-300 dark:text-gray-600 cursor-not-allowed' :
                                    'hover:bg-gray-100 dark:hover:bg-gray-600'
                                  }
                                  ${isSelected ? 
                                    'bg-primary-500 text-white hover:bg-primary-600' : 
                                    'text-gray-700 dark:text-gray-300'
                                  }
                                `}
                              >
                                {format(day, 'd')}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <div 
                    onClick={() => setIsTimePickerOpen(true)}
                    className="flex items-center justify-between cursor-pointer p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {selectedHour}:{selectedMinute}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
              )}

              {/* Time Picker Dialog */}
              <Dialog
                open={isTimePickerOpen}
                onClose={() => setIsTimePickerOpen(false)}
                className="fixed inset-0 z-50"
              >
                <div className="flex min-h-screen items-center justify-center">
                  <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-xl" />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative bg-white dark:bg-gray-800 rounded-lg w-80 p-4"
                  >
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select Time
                      </div>
                      <button
                        onClick={() => setIsTimePickerOpen(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="mt-4 flex space-x-4">
                      {/* Hours */}
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
                          Hour
                        </div>
                        <div 
                          ref={hourListRef}
                          className="h-48 overflow-y-auto snap-y snap-mandatory mask-gradient"
                        >
                          {hours.map(hour => (
                            <button
                              key={hour}
                              id={`hour-${hour}`}
                              onClick={() => setSelectedHour(hour)}
                              className={`
                                w-full py-2 text-center snap-start
                                ${selectedHour === hour 
                                  ? 'text-primary-500 font-medium text-lg' 
                                  : 'text-gray-600 dark:text-gray-400'
                                }
                              `}
                            >
                              {hour}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Minutes */}
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
                          Minute
                        </div>
                        <div 
                          ref={minuteListRef}
                          className="h-48 overflow-y-auto snap-y snap-mandatory mask-gradient"
                        >
                          {minutes.map(minute => (
                            <button
                              key={minute}
                              id={`minute-${minute}`}
                              onClick={() => setSelectedMinute(minute)}
                              className={`
                                w-full py-2 text-center snap-start
                                ${selectedMinute === minute 
                                  ? 'text-primary-500 font-medium text-lg' 
                                  : 'text-gray-600 dark:text-gray-400'
                                }
                              `}
                            >
                              {minute}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </Dialog>

              {/* Message */}
              <div className="space-y-4">
                <button
                  onClick={handleSuggestAppointment}
                  disabled={isLoading}
                  className={`
                    w-full flex items-center justify-center space-x-2 p-3 
                    ${!selectedDate || !selectedHour || !selectedMinute 
                      ? 'bg-primary-300 cursor-not-allowed' 
                      : 'bg-primary-500 hover:bg-primary-600'
                    }
                    text-white rounded-xl transition-colors
                  `}
                >
                  {isLoading ? (
                    <span>Thinking...</span>
                  ) : (
                    <>
                      <Bot className="w-5 h-5" />
                      <span>AI Answer</span>
                    </>
                  )}
                </button>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border-gray-200 dark:border-gray-700"
                  placeholder="Add appointment notes..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSchedule}
                  disabled={!selectedDate || !selectedHour || !selectedMinute || !message.trim() || scheduling}
                >
                  {scheduling ? 'Scheduling...' : 'Schedule & Send SMS'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Dialog>
  )
} 