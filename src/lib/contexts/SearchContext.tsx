'use client'

import React, { createContext, useContext, useState } from 'react'

interface SearchContextType {
  searchTerm: string
  setSearchTerm: (term: string) => void
  filters: any
  setFilters: (filters: any) => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({})

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm, filters, setFilters }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
} 