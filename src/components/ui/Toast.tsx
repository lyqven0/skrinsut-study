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

const typeConfigs: Record<ToastType, { iconBg: string; textColor: string; borderColor: string; icon: string }> = {
  success: {
    iconBg: 'bg-emerald-500 text-white shadow-emerald-500/30',
    textColor: 'text-slate-900 dark:text-slate-100',
    borderColor: 'border-emerald-500/30 dark:border-emerald-500/20',
    icon: '✓',
  },
  error: {
    iconBg: 'bg-rose-500 text-white shadow-rose-500/30',
    textColor: 'text-slate-900 dark:text-slate-100',
    borderColor: 'border-rose-500/30 dark:border-rose-500/20',
    icon: '✕',
  },
  info: {
    iconBg: 'bg-blue-500 text-white shadow-blue-500/30',
    textColor: 'text-slate-900 dark:text-slate-100',
    borderColor: 'border-blue-500/30 dark:border-blue-500/20',
    icon: 'ℹ',
  },
}

function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) return null

  return (
    <>
      {/* Mobile: bottom-center, above bottom nav (~75px). Desktop: top-right. */}
      <div
        className="fixed z-50 flex flex-col gap-2 pointer-events-none
          bottom-20 left-4 right-4
          sm:bottom-auto sm:top-5 sm:left-auto sm:right-5 sm:w-80"
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
  const config = typeConfigs[toast.type]

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
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl
        text-xs sm:text-sm font-semibold liquid-glass-dock border ${config.borderColor} shadow-2xl`}
      style={{
        transition: 'opacity 250ms cubic-bezier(0.16, 1, 0.3, 1), transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: isShown ? 1 : 0,
        transform: isShown ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.96)',
      }}
    >
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 shadow-md ${config.iconBg}`}
        aria-hidden="true"
      >
        {config.icon}
      </span>
      <span className={config.textColor}>{toast.message}</span>
    </div>
  )
}
