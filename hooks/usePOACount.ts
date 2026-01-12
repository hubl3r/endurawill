// hooks/usePOACount.ts
'use client';

import { useState, useEffect } from 'react';

export function usePOACount() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch('/api/poa/list');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCount(data.poas.length);
          }
        }
      } catch (error) {
        console.error('Error fetching POA count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();

    // Optional: Refresh count every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return { count, loading };
}
