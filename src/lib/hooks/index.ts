'use client'

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type RefObject,
} from 'react'
import { useSession } from 'next-auth/react'
import type { SessionUser } from '@/types'

// ─────────────────────────────────────────────
// useCurrentUser
// ─────────────────────────────────────────────

/**
 * Returns the authenticated session user (typed), plus loading/status state.
 */
export function useCurrentUser(): {
  user: SessionUser | null
  status: 'authenticated' | 'unauthenticated' | 'loading'
  isLoading: boolean
} {
  const { data: session, status } = useSession()
  return {
    user: (session?.user as SessionUser) ?? null,
    status,
    isLoading: status === 'loading',
  }
}

// ─────────────────────────────────────────────
// usePagination
// ─────────────────────────────────────────────

/**
 * Manages pagination state for a given total item count and page size.
 */
export function usePagination(total: number, limit: number) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const hasNext = page < totalPages
  const hasPrev = page > 1

  // Clamp page when total changes
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [totalPages, page])

  const nextPage = useCallback(() => {
    if (hasNext) setPage((p) => p + 1)
  }, [hasNext])

  const prevPage = useCallback(() => {
    if (hasPrev) setPage((p) => p - 1)
  }, [hasPrev])

  const goToPage = useCallback(
    (target: number) => {
      setPage(Math.min(Math.max(1, target), totalPages))
    },
    [totalPages],
  )

  return { page, setPage, totalPages, hasNext, hasPrev, nextPage, prevPage, goToPage }
}

// ─────────────────────────────────────────────
// useDebounce
// ─────────────────────────────────────────────

/**
 * Debounces a rapidly-changing value and only updates the returned
 * value once the caller stops changing it for `delay` milliseconds.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// ─────────────────────────────────────────────
// useLocalStorage
// ─────────────────────────────────────────────

/**
 * Persists state to localStorage. Falls back gracefully when localStorage
 * is unavailable (e.g., SSR, private browsing in some browsers).
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value
        try {
          window.localStorage.setItem(key, JSON.stringify(next))
        } catch {
          // Quota exceeded or storage unavailable — silently ignore
        }
        return next
      })
    },
    [key],
  )

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // Silently ignore
    }
    setStoredValue(initialValue)
  }, [key, initialValue])

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== key || e.storageArea !== window.localStorage) return
      try {
        setStoredValue(e.newValue !== null ? (JSON.parse(e.newValue) as T) : initialValue)
      } catch {
        // Ignore malformed JSON
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

// ─────────────────────────────────────────────
// useMediaQuery
// ─────────────────────────────────────────────

/**
 * Returns true when the given CSS media query matches.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia(query)
    setMatches(mql.matches)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
}

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}

// ─────────────────────────────────────────────
// useNotifications
// ─────────────────────────────────────────────

interface NotificationState {
  unreadCount: number
  isLoading: boolean
  error: string | null
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refresh: () => void
}

/**
 * Fetches unread notification count and provides helpers to mark
 * notifications as read. Polls every 60 seconds while the tab is focused.
 */
export function useNotifications(): NotificationState {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetch('/api/notifications/unread-count')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setUnreadCount(data?.count ?? 0)
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load notifications')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [tick])

  // Poll every 60 s
  useEffect(() => {
    const id = setInterval(refresh, 60_000)
    return () => clearInterval(id)
  }, [refresh])

  const markAsRead = useCallback(async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
    setUnreadCount((c) => Math.max(0, c - 1))
  }, [])

  const markAllAsRead = useCallback(async () => {
    await fetch('/api/notifications/read-all', { method: 'PATCH' })
    setUnreadCount(0)
  }, [])

  return { unreadCount, isLoading, error, markAsRead, markAllAsRead, refresh }
}

// ─────────────────────────────────────────────
// useMessages
// ─────────────────────────────────────────────

interface MessageState {
  unreadCount: number
  isLoading: boolean
  error: string | null
  refresh: () => void
}

/**
 * Fetches unread message count. Polls every 60 seconds.
 */
export function useMessages(): MessageState {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetch('/api/messages/unread-count')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setUnreadCount(data?.count ?? 0)
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load messages')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [tick])

  useEffect(() => {
    const id = setInterval(refresh, 60_000)
    return () => clearInterval(id)
  }, [refresh])

  return { unreadCount, isLoading, error, refresh }
}

// ─────────────────────────────────────────────
// useClickOutside
// ─────────────────────────────────────────────

/**
 * Fires `callback` when a click/touch event occurs outside the given element.
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  callback: () => void,
): void {
  const callbackRef = useRef(callback)
  useEffect(() => { callbackRef.current = callback })

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callbackRef.current()
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [ref])
}

// ─────────────────────────────────────────────
// useKeyboard
// ─────────────────────────────────────────────

/**
 * Fires `callback` when the specified keyboard key is pressed.
 * Respects modifier keys via options.
 */
export function useKeyboard(
  key: string,
  callback: (e: KeyboardEvent) => void,
  options: { ctrl?: boolean; alt?: boolean; shift?: boolean; meta?: boolean } = {},
): void {
  const callbackRef = useRef(callback)
  useEffect(() => { callbackRef.current = callback })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== key) return
      if (options.ctrl !== undefined && e.ctrlKey !== options.ctrl) return
      if (options.alt !== undefined && e.altKey !== options.alt) return
      if (options.shift !== undefined && e.shiftKey !== options.shift) return
      if (options.meta !== undefined && e.metaKey !== options.meta) return
      callbackRef.current(e)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [key, options.ctrl, options.alt, options.shift, options.meta])
}

// ─────────────────────────────────────────────
// useToggle
// ─────────────────────────────────────────────

/**
 * Simple boolean toggle with helpers.
 * Returns [value, toggle, setTrue, setFalse]
 */
export function useToggle(
  initial = false,
): [boolean, () => void, () => void, () => void] {
  const [value, setValue] = useState(initial)
  const toggle = useCallback(() => setValue((v) => !v), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])
  return [value, toggle, setTrue, setFalse]
}

// ─────────────────────────────────────────────
// useCopyToClipboard
// ─────────────────────────────────────────────

/**
 * Returns a [copied, copy] tuple.
 * `copied` resets to `false` after `resetMs` milliseconds (default 2000).
 */
export function useCopyToClipboard(
  resetMs = 2000,
): [boolean, (text: string) => Promise<boolean>] {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text)
        } else {
          // Fallback for older browsers / non-HTTPS
          const ta = document.createElement('textarea')
          ta.value = text
          ta.style.position = 'fixed'
          ta.style.opacity = '0'
          document.body.appendChild(ta)
          ta.focus()
          ta.select()
          document.execCommand('copy')
          document.body.removeChild(ta)
        }
        setCopied(true)
        timeoutRef.current = setTimeout(() => setCopied(false), resetMs)
        return true
      } catch {
        setCopied(false)
        return false
      }
    },
    [resetMs],
  )

  // Cleanup on unmount
  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }, [])

  return [copied, copy]
}
