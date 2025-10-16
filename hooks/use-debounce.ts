import { useEffect, useRef } from "react"

/* eslint-disable @typescript-eslint/no-explicit-any */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T & { cancel: () => void } {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>()

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const debouncedFunction = ((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }) as T

  ;(debouncedFunction as any).cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  return debouncedFunction as T & { cancel: () => void }
} 