import React, { useCallback } from 'react';
import { Call } from '@/lib/types/calls';

export const CallList = React.memo(({ calls, onSelect }: { 
  calls: Call[]; 
  onSelect: (call: Call) => void 
}) => {
  const handleClick = useCallback((call: Call) => {
    onSelect(call);
  }, [onSelect]);

  return (
    <ul>
      {calls.map(call => (
        <li key={call.id} onClick={() => handleClick(call)}>
          {call.from} - {call.status}
        </li>
      ))}
    </ul>
  );
}); 