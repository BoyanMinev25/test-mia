import { useState, useEffect } from 'react';

export function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('');
  
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(query);
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [query, onSearch]);

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search calls..."
    />
  );
} 