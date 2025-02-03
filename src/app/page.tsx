'use client'

import { useAuth } from '@/lib/hooks/useAuth'

export default function HomePage() {
  const { user, loading } = useAuth()
  
  // Just return null and let AuthContext handle all navigation
  return null;
}
