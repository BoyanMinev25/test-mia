import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore'
import { db } from './firebase'
import { getAuth } from 'firebase/auth'

export async function cleanupDatabase() {
  try {
    const auth = getAuth()
    const currentUser = auth.currentUser
    
    if (!currentUser) {
      throw new Error('No user logged in')
    }

    console.log('Starting database cleanup...')
    const callsRef = collection(db, 'calls')
    const q = query(
      callsRef,
      where('userId', '==', currentUser.uid)
    )
    
    const snapshot = await getDocs(q)
    console.log(`Found ${snapshot.size} records to delete`)
    
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
    
    const deletedCount = snapshot.size
    console.log(`Successfully deleted ${deletedCount} records`)
    return deletedCount
  } catch (error) {
    console.error('Error cleaning up database:', error)
    throw error
  }
} 