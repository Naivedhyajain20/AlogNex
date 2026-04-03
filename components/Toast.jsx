'use client'
import { useState, useCallback, useEffect } from 'react'

let _addToast = null

export function useToast() {
  const [toasts, setToasts] = useState([])

  const add = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  // expose globally so any component can call showToast without prop drilling
  useEffect(() => { _addToast = add }, [add])

  return { toasts, add }
}

export function showToast(message, type = 'info') {
  if (_addToast) _addToast(message, type)
}

export default function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>
      ))}
    </div>
  )
}
