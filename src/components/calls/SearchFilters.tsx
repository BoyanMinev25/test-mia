'use client'

import { useState } from 'react'
import { X, Search } from 'lucide-react'

interface SearchFiltersProps {
  onClose: () => void
  onSearch: (term: string) => void
  onFilterChange: (filters: any) => void
}

export default function SearchFilters({ onClose, onSearch, onFilterChange }: SearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    onSearch(e.target.value)
  }

  const handleFilterChange = () => {
    onFilterChange({
      status,
      fromDate,
      toDate
    })
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatus('')
    setFromDate('')
    setToDate('')
    onSearch('')
    onFilterChange({})
  }

  return (
    <div className="p-4 space-y-4 animate-slideDown">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search calls..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200"
        />
        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
      </div>

      {/* Status Filter */}
      <select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value)
          handleFilterChange()
        }}
        className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200"
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="urgent">Urgent</option>
        <option value="scheduled">Scheduled</option>
      </select>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            From
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value)
              handleFilterChange()
            }}
            className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            To
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value)
              handleFilterChange()
            }}
            className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <button
          onClick={clearFilters}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          Clear Filters
        </button>
        <button
          onClick={onClose}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
} 