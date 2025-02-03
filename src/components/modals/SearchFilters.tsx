'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Search, Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

const statuses = [
  { 
    id: 'pending', 
    label: 'Pending', 
    icon: <Clock className="w-3.5 h-3.5" />,
    bgClass: 'bg-transparent hover:bg-amber-100/10 text-amber-500 border border-amber-200',
    activeClass: 'bg-amber-500 text-white border-amber-500',
    description: 'Pending callbacks'
  },
  { 
    id: 'confirmed', 
    label: 'Confirmed', 
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    bgClass: 'bg-transparent hover:bg-green-100/10 text-green-500 border border-green-200',
    activeClass: 'bg-green-500 text-white border-green-500',
    description: 'Confirmed and scheduled appointments'
  },
  { 
    id: 'urgent', 
    label: 'Urgent', 
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    bgClass: 'bg-transparent hover:bg-red-100/10 text-red-500 border border-red-200',
    activeClass: 'bg-red-500 text-white border-red-500',
    description: 'Urgent callbacks'
  }
] as const;

type StatusId = typeof statuses[number]['id'];

interface SearchFiltersProps {
  onClose: () => void
  onSearch: (term: string) => void
  onFilterChange: (filters: {
    statuses?: StatusId[]
    fromDate?: string
    toDate?: string
  }) => void
  initialFilters?: {
    statuses?: StatusId[]
    fromDate?: string
    toDate?: string
  }
}

export default function SearchFilters({ 
  onClose, 
  onSearch, 
  onFilterChange,
  initialFilters = {}
}: SearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<StatusId[]>(initialFilters.statuses || [])
  const [fromDate, setFromDate] = useState<Date | undefined>(
    initialFilters.fromDate ? new Date(initialFilters.fromDate) : undefined
  )
  const [toDate, setToDate] = useState<Date | undefined>(
    initialFilters.toDate ? new Date(initialFilters.toDate) : undefined
  )
  const [showFromPicker, setShowFromPicker] = useState(false)
  const [showToPicker, setShowToPicker] = useState(false)

  const handleFilterChange = useCallback((filterType: string, value: string) => {
    // ... filter logic ...
  }, [/* Add any dependencies used inside */])

  useEffect(() => {
    // ... effect logic ...
  }, [handleFilterChange]) // Include in dependencies

  // Effect to handle scroll locking
  useEffect(() => {
    if (showFromPicker || showToPicker) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showFromPicker, showToPicker])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearch(value)
  }

  const toggleStatus = (statusId: string) => {
    setSelectedStatuses(prev => 
      prev.includes(statusId as StatusId)
        ? prev.filter(s => s !== statusId as StatusId)
        : [...prev, statusId as StatusId]
    )
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedStatuses([])
    setFromDate(undefined)
    setToDate(undefined)
    onSearch('')
    onFilterChange({})
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <label htmlFor="call-search" className="sr-only">
          Search calls
        </label>
        <input
          id="call-search"
          name="call-search"
          type="text"
          placeholder="Search calls..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </h4>
          {selectedStatuses.length > 0 && (
            <button
              onClick={() => setSelectedStatuses([])}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {statuses.map(statusOption => (
            <button
              key={statusOption.id}
              onClick={() => toggleStatus(statusOption.id)}
              className={`
                flex items-center space-x-1.5 px-4 py-2 rounded-lg
                transition-all duration-200 shadow-sm
                ${selectedStatuses.includes(statusOption.id as StatusId)
                  ? statusOption.activeClass
                  : statusOption.bgClass
                }
              `}
            >
              {statusOption.icon}
              <span>{statusOption.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Date Range
          </h4>
          {(fromDate || toDate) && (
            <button
              onClick={() => {
                setFromDate(undefined)
                setToDate(undefined)
              }}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <button
              onClick={() => {
                setShowFromPicker(!showFromPicker)
                setShowToPicker(false)
              }}
              className="w-full flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <span>{fromDate ? format(fromDate, 'MMM d, yyyy') : 'From'}</span>
              <Calendar className="w-4 h-4 text-gray-400" />
            </button>
            {showFromPicker && (
              <div className="fixed inset-0 z-[100]" data-from-picker>
                <div 
                  className="fixed inset-0 bg-black/50" 
                  onClick={() => setShowFromPicker(false)}
                />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                  <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 mx-4 max-w-sm w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Select Start Date</h3>
                      <button
                        onClick={() => setShowFromPicker(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <DayPicker
                      mode="single"
                      selected={fromDate}
                      onSelect={(date) => {
                        setFromDate(date || undefined)
                        setShowFromPicker(false)
                      }}
                      disabled={toDate ? { after: toDate } : undefined}
                      className="!bg-white dark:!bg-gray-800"
                      classNames={{
                        months: "flex flex-col",
                        month: "space-y-4",
                        caption: "flex justify-between items-center px-2",
                        caption_label: "text-xl font-semibold text-gray-900 dark:text-white text-center flex-grow",
                        nav: "flex items-center space-x-2",
                        nav_button: "h-8 w-8 bg-transparent p-0 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors",
                        nav_button_previous: "absolute left-2",
                        nav_button_next: "absolute right-2",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-gray-500 dark:text-gray-400 w-9 font-normal text-[0.8rem]",
                        row: "flex w-full mt-2",
                        cell: "text-center text-sm relative p-0 rounded-md",
                        day: "w-9 h-9 p-0 font-normal hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-900 dark:text-white",
                        day_selected: "bg-primary-500 text-white hover:bg-primary-600 dark:hover:bg-primary-600 rounded-md font-semibold",
                        day_today: "text-primary-500 dark:text-primary-400 font-semibold",
                        day_outside: "text-gray-400 dark:text-gray-600",
                        day_disabled: "text-gray-300 dark:text-gray-600",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowToPicker(!showToPicker)
                setShowFromPicker(false)
              }}
              className="w-full flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <span>{toDate ? format(toDate, 'MMM d, yyyy') : 'To'}</span>
              <Calendar className="w-4 h-4 text-gray-400" />
            </button>
            {showToPicker && (
              <div className="fixed inset-0 z-[100]" data-to-picker>
                <div 
                  className="fixed inset-0 bg-black/50" 
                  onClick={() => setShowToPicker(false)}
                />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                  <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 mx-4 max-w-sm w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Select End Date</h3>
                      <button
                        onClick={() => setShowToPicker(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <DayPicker
                      mode="single"
                      selected={toDate}
                      onSelect={(date) => {
                        setToDate(date || undefined)
                        setShowToPicker(false)
                      }}
                      disabled={fromDate ? { before: fromDate } : undefined}
                      className="!bg-white dark:!bg-gray-800"
                      classNames={{
                        months: "flex flex-col",
                        month: "space-y-4",
                        caption: "flex justify-between items-center px-2",
                        caption_label: "text-xl font-semibold text-gray-900 dark:text-white text-center flex-grow",
                        nav: "flex items-center space-x-2",
                        nav_button: "h-8 w-8 bg-transparent p-0 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors",
                        nav_button_previous: "absolute left-2",
                        nav_button_next: "absolute right-2",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-gray-500 dark:text-gray-400 w-9 font-normal text-[0.8rem]",
                        row: "flex w-full mt-2",
                        cell: "text-center text-sm relative p-0 rounded-md",
                        day: "w-9 h-9 p-0 font-normal hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-900 dark:text-white",
                        day_selected: "bg-primary-500 text-white hover:bg-primary-600 dark:hover:bg-primary-600 rounded-md font-semibold",
                        day_today: "text-primary-500 dark:text-primary-400 font-semibold",
                        day_outside: "text-gray-400 dark:text-gray-600",
                        day_disabled: "text-gray-300 dark:text-gray-600",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clear All Button */}
      {(selectedStatuses.length > 0 || fromDate || toDate || searchTerm) && (
        <button
          onClick={clearFilters}
          className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  )
} 