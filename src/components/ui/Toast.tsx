import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  type: ToastType
  exiting: boolean
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, message, type, exiting: false }])

    // Start exit animation after 2.8s, remove after 3s
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      )
    }, 2800)

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(<ToastContainer toasts={toasts} />, document.body)}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const typeStyles: Record<ToastType, string> = {
  success:
    'bg-green-600 dark:bg-green-700 text-white',
  error:
    'bg-red-600 dark:bg-red-700 text-white',
  info:
    'bg-[var(--color-card)] text-[var(--color-text)] border border-[var(--color-border)]',
}

const typeIcons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
}

function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) return null

  return (
    <>
      {/* Mobile: bottom-center, above bottom nav (~70px). Desktop: top-right. */}
      <div
        className="fixed z-50 flex flex-col gap-2 pointer-events-none
          bottom-20 left-4 right-4
          sm:bottom-auto sm:top-4 sm:left-auto sm:right-4 sm:w-80"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </>
  )
}

function ToastItem({ toast }: { toast: ToastItem }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation on next frame
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const isShown = visible && !toast.exiting

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg
        text-sm font-medium
        ${typeStyles[toast.type]}`}
      style={{
        transition: 'opacity 200ms ease, transform 200ms ease',
        opacity: isShown ? 1 : 0,
        transform: isShown ? 'translateY(0)' : 'translateY(8px)',
      }}
    >
      <span className="text-base leading-none" aria-hidden="true">
        {typeIcons[toast.type]}
      </span>
      <span>{toast.message}</span>
    </div>
  )
}
