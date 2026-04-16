'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

type Notice = {
  id: string
  type: 'error' | 'success' | 'info'
  message: string
}

type NotificationContextValue = {
  notify: (type: Notice['type'], message: string) => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notices, setNotices] = useState<Notice[]>([])

  const notify = useCallback((type: Notice['type'], message: string) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    setNotices(current => [...current, { id, type, message }])
    window.setTimeout(() => {
      setNotices(current => current.filter(item => item.id !== id))
    }, 3200)
  }, [])

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
        {notices.map(notice => (
          <div
            key={notice.id}
            className={`rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-sm transition-all ${
              notice.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : notice.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            <div className="text-sm font-medium">{notice.message}</div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotifications must be used within NotificationsProvider')

  return {
    error: (message: string) => context.notify('error', message),
    success: (message: string) => context.notify('success', message),
    info: (message: string) => context.notify('info', message),
  }
}
