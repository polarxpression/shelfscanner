
"use client";

import { useState, useEffect, useCallback } from 'react';

// A helper function to get the initial value from localStorage or use the provided initial value.
// It's defined outside the hook to avoid being recreated on every render.
const getInitialValue = <T>(key: string, initialValue: T): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
};

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Use a function in useState to ensure getInitialValue is only called once on the client.
  const [storedValue, setStoredValue] = useState<T>(() => getInitialValue(key, initialValue));

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function, just like the real useState API.
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // This effect synchronizes the state if the localStorage is changed in another tab.
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        setStoredValue(JSON.parse(event.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}
