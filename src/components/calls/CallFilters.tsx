'use client'

import { useState } from 'react'
import { Calendar, Search } from 'lucide-react'
import Button from '../ui/Button'
import { CallFilters } from '@/lib/types/calls'

interface CallFiltersProps {
  onFilterChange: (filters: CallFilters) => void
}

export default function CallFiltersComponent({ onFilterChange }: CallFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState<CallFilters['status']>()
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  const handleFilterChange = () => {
    onFilterChange({
      searchTerm,
      status,
      startDate,
      endDate
    })
  }

  return (
    <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
        <input
          type="text"
          placeholder="Search calls..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            handleFilterChange()
          }}
          className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 
            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <select
        value={status || ''}
        onChange={(e) => {
          setStatus(e.target.value as CallFilters['status'])
          handleFilterChange()
        }}
        className="w-full px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 
          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        <option value="">All Status</option>
        <option value="answered">Answered</option>
        <option value="missed">Missed</option>
        <option value="voicemail">Voicemail</option>
      </select>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={startDate?.toISOString().split('T')[0] || ''}
            onChange={(e) => {
              setStartDate(e.target.value ? new Date(e.target.value) : undefined)
              handleFilterChange()
            }}
            className="w-full px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={endDate?.toISOString().split('T')[0] || ''}
            onChange={(e) => {
              setEndDate(e.target.value ? new Date(e.target.value) : undefined)
              handleFilterChange()
            }}
            className="w-full px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <Button
        variant="secondary"
        onClick={() => {
          setSearchTerm('')
          setStatus(undefined)
          setStartDate(undefined)
          setEndDate(undefined)
          onFilterChange({})
        }}
        className="w-full"
      >
        Clear Filters
      </Button>
    </div>
  )
} 