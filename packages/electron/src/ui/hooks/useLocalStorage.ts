import { useState, useEffect } from 'react';

/**
 * Custom hook for managing localStorage with type safety
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [storedValue, setValue] as const;
}

/**
 * Custom hook for managing array-based history in localStorage
 */
export function useHistoryStorage(key: string, maxItems: number = 10) {
  const [history, setHistory] = useState<string[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(key);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.error(`Error loading ${key} history:`, error);
    }
  }, [key]);

  // Add item to history
  const addToHistory = (item: string) => {
    if (item && !history.includes(item)) {
      const newHistory = [item, ...history].slice(0, maxItems);
      setHistory(newHistory);
      localStorage.setItem(key, JSON.stringify(newHistory));
    }
  };

  // Remove item from history
  const removeFromHistory = (itemToRemove: string) => {
    const newHistory = history.filter(item => item !== itemToRemove);
    setHistory(newHistory);
    localStorage.setItem(key, JSON.stringify(newHistory));
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
  };
}
