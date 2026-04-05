import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const ToastContext = createContext(null)

const VARIANT_STYLES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900 shadow-emerald-100/50',
  error: 'border-red-200 bg-red-50 text-red-900 shadow-red-100/50',
  info: 'border-sky-200 bg-sky-50 text-navy shadow-sky-100/50',
}

function ToastItem({ toast, onDismiss }) {
  const style = VARIANT_STYLES[toast.variant] || VARIANT_STYLES.info
  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm transition-opacity duration-200 ${style}`}
    >
      <span className="mt-0.5 shrink-0" aria-hidden="true">
        {toast.variant === 'success' ? (
          <svg className="h-5 w-5 text-emerald-600" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : toast.variant === 'error' ? (
          <svg className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg className="h-5 w-5 text-sky-600" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </span>
      <p className="min-w-0 flex-1 font-sans text-sm leading-snug">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-lg p-1 text-current opacity-60 hover:opacity-100"
        aria-label="Dismiss"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((message, variant = 'info') => {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, message, variant }])
    window.setTimeout(() => dismiss(id), 6000)
    return id
  }, [dismiss])

  const toast = useMemo(
    () => ({
      success: (message) => showToast(message, 'success'),
      error: (message) => showToast(message, 'error'),
      info: (message) => showToast(message, 'info'),
    }),
    [showToast]
  )

  const value = useMemo(() => ({ showToast, toast, dismiss }), [showToast, toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[min(100vw-2rem,22rem)] flex-col gap-2"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    return {
      toast: {
        success: () => {},
        error: () => {},
        info: () => {},
      },
      showToast: () => {},
      dismiss: () => {},
    }
  }
  return ctx
}
