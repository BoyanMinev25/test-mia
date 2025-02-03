import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export function useCalls(filters: CallFilters) {
  return useQuery({
    queryKey: ['calls', filters],
    queryFn: async () => {
      let q = query(collection(db, 'calls'));
      // Add filter conditions...
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Call);
    },
    staleTime: 60 * 1000 // 1 minute cache
  });
} 