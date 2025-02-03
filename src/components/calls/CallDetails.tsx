'use client'

import { useState } from 'react'
import { Call } from '@/lib/types/calls'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { Phone, MessageSquare, Play, Download, Pencil, Save } from 'lucide-react'
import { format } from 'date-fns'
import { updateCall } from '@/lib/firebase/callsUtils'

interface CallDetailsProps {
  call: Call
}

export default function CallDetails({ call }: CallDetailsProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notes, setNotes] = useState(call.notes || '')

  const handleSaveNotes = async () => {
    try {
      await updateCall(call.id, { notes })
      setIsEditingNotes(false)
    } catch (error) {
      console.error('Error saving notes:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">{call.from}</h2>
            <div className="mt-2 space-y-1 text-sm text-gray-500">
              <p>Call ID: {call.callSid}</p>
              <p>Time: {format(call.timestamp, 'PPpp')}</p>
              {call.duration > 0 && (
                <p>Duration: {Math.round(call.duration / 60)} minutes</p>
              )}
            </div>
          </div>
          <Badge variant={
            call.status === 'answered' ? 'success' :
            call.status === 'missed' ? 'error' : 'warning'
          }>
            {call.status}
          </Badge>
        </div>

        <div className="mt-6 flex space-x-3">
          <Button
            variant="primary"
            icon={<Phone className="w-4 h-4" />}
          >
            Call Back
          </Button>
          <Button
            variant="secondary"
            icon={<MessageSquare className="w-4 h-4" />}
          >
            Send SMS
          </Button>
        </div>
      </Card>

      {call.voicemailUrl && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Voicemail</h3>
          <div className="flex space-x-3">
            <Button
              variant="primary"
              icon={<Play className="w-4 h-4" />}
            >
              Play Voicemail
            </Button>
            <Button
              variant="secondary"
              icon={<Download className="w-4 h-4" />}
            >
              Download
            </Button>
          </div>
        </Card>
      )}

      {call.transcription && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Transcription</h3>
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
            {call.transcription}
          </p>
        </Card>
      )}

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Notes</h3>
          <Button
            variant="secondary"
            size="sm"
            icon={isEditingNotes ? <Save className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            onClick={() => isEditingNotes ? handleSaveNotes() : setIsEditingNotes(true)}
          >
            {isEditingNotes ? 'Save' : 'Edit'}
          </Button>
        </div>
        {isEditingNotes ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-32 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            placeholder="Add notes about this call..."
          />
        ) : (
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
            {notes || 'No notes added yet.'}
          </p>
        )}
      </Card>
    </div>
  )
} 