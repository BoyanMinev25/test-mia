import { db } from './firebase'
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore'
import { Call, CallFilters } from '../types/calls'

export const getCalls = async (userId: string, filters?: CallFilters) => {
  let q = query(
    collection(db, 'calls'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  )

  if (filters?.status) {
    q = query(q, where('status', '==', filters.status))
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Call[]
}

export const addCall = async (callData: Omit<Call, 'id'>) => {
  const docRef = await addDoc(collection(db, 'calls'), callData)
  return docRef.id
}

export const updateCall = async (callId: string, updates: Partial<Call>) => {
  const callRef = doc(db, 'calls', callId)
  await updateDoc(callRef, updates)
} 