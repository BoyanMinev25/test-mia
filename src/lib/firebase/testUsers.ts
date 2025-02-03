import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from './firebase' // Import the auth instance directly

export const createTestUser = async () => {
  console.log('Starting test user creation...')
  
  try {
    console.log('Attempting to create user with email: info@fabcrush.com')
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'info@fabcrush.com',
      '123456'
    )
    
    console.log('Test user created successfully:', userCredential.user.uid)
    return userCredential.user
  } catch (error: any) {
    console.log('Error details:', error.code, error.message)
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('User already exists, you can sign in with these credentials')
      // We could automatically sign in here if needed
    } else {
      console.error('Error creating test user:', error)
    }
    throw error
  }
} 