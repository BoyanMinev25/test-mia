import { db } from './firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { subDays, subHours, subMinutes } from 'date-fns'
import { getAuth } from 'firebase/auth'

const sampleTranscriptions = [
  "Hi, I'm calling about my car's brake issue. It's making a squeaking sound.",
  "Hello, I need to schedule an oil change for my Toyota Camry.",
  "My check engine light just came on. Can someone take a look at it?",
  "I had my car serviced last week, but the problem is still there.",
  "Looking to get a quote for transmission repair.",
  "My AC isn't working properly, it's blowing warm air.",
]

const phoneNumbers = [
  '+1 (555) 234-5678',
  '+1 (555) 876-5432',
  '+1 (555) 345-6789',
  '+1 (555) 987-6543',
  '+1 (555) 456-7890',
]

const statuses = ['pending', 'confirmed', 'urgent']

export async function seedCalls() {
  try {
    const auth = getAuth()
    const currentUser = auth.currentUser
    
    if (!currentUser) {
      console.error('No user logged in')
      return
    }

    const callsCollection = collection(db, 'calls')
    const numberOfCalls = Math.floor(Math.random() * 3) + 1 // Generate 1-3 calls

    const addedCalls = []
    
    for (let i = 0; i < numberOfCalls; i++) {
      const randomHours = Math.floor(Math.random() * 72) // Random time within last 3 days
      const timestamp = subHours(new Date(), randomHours)
      
      const call = {
        userId: currentUser.uid,
        from: phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)],
        to: '+1 (555) 999-0000', // Your business number
        status: statuses[Math.floor(Math.random() * statuses.length)],
        duration: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
        timestamp: Timestamp.fromDate(timestamp),
        transcription: sampleTranscriptions[Math.floor(Math.random() * sampleTranscriptions.length)],
        voicemailUrl: 'https://example.com/voicemail.mp3'
      }

      const docRef = await addDoc(callsCollection, call)
      addedCalls.push(docRef.id)
    }
    
    console.log('Added test calls:', addedCalls)
    if (addedCalls.length > 0) {
      window.location.reload()
    }
  } catch (error) {
    console.error('Error in seedCalls:', error)
  }
} 