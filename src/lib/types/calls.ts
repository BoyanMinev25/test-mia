import { Timestamp } from 'firebase/firestore';

export interface Call {
  id: string
  userId: string
  callSid: string
  from: string
  to: string
  status: 'pending' | 'confirmed' | 'urgent' | string
  duration: number
  timestamp: Timestamp
  transcription?: string
  voicemailUrl?: string
  notes?: string
  scheduledCallback?: {
    date: any // Firebase Timestamp
    notes?: string
  }
  scheduled?: Timestamp
}

export interface CallFilters {
  status?: 'missed' | 'answered' | 'voicemail'
  startDate?: Date
  endDate?: Date
  searchTerm?: string
}

export interface CallHistory {
  phoneNumber: string
  totalCalls: number
  firstCall: any // Firebase Timestamp
  lastCall: any // Firebase Timestamp
  calls: Call[]
} 