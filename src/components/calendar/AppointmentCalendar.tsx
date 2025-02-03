'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import Card from '../ui/Card'

export default function AppointmentCalendar() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white overflow-hidden relative">
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-3xl font-bold">Appointments</h1>
            <p className="mt-2 text-primary-100">Manage your schedule</p>
          </div>
          <div className="p-4 bg-white/10 rounded-full">
            <CalendarIcon className="w-8 h-8" />
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8">
          <div className="w-32 h-32 bg-white/10 rounded-full" />
        </div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8">
          <div className="w-24 h-24 bg-white/5 rounded-full" />
        </div>
      </Card>

      {/* Calendar implementation goes here */}
      <Card>
        <div className="p-6">
          <p className="text-center text-gray-500 dark:text-gray-400">
            Calendar component coming soon...
          </p>
        </div>
      </Card>
    </div>
  )
} 