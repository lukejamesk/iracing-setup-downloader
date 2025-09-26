import { useRef, useCallback, useEffect } from 'react';

interface UseAutoScrollOptions {
  threshold?: number;
}

export const useAutoScroll = (dependencies: any[], options: UseAutoScrollOptions = {}) => {
  const { threshold = 5 } = options;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);


  // Check if user is at the bottom of the scroll
  const checkIfAtBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current;
      const isAtBottomNow = 
        scrollContainer.scrollTop + scrollContainer.clientHeight >= 
        scrollContainer.scrollHeight - threshold;
      const wasAtBottom = isAtBottomRef.current;
      isAtBottomRef.current = isAtBottomNow;
      
    }
  }, [threshold]);

  // Handle scroll events to track if user is at bottom
  const handleScroll = useCallback(() => {
    checkIfAtBottom();
  }, [checkIfAtBottom]);

  // Auto-scroll to bottom when dependencies change, but only if user is at bottom
  useEffect(() => {
    if (scrollContainerRef.current && isAtBottomRef.current) {
      const scrollContainer = scrollContainerRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, dependencies);

  // Check if at bottom when component mounts
  useEffect(() => {
    checkIfAtBottom();
  }, [checkIfAtBottom]);

  return {
    scrollContainerRef,
    handleScroll,
  };
};
