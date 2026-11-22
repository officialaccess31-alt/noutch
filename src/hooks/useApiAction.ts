'use client'

import { useState } from 'react'
import { ApiError } from '@/lib/api'
import { useToast } from '@/components/toast'

// For button actions (send, save, delete). Shows the backend's error as a toast
// and exposes field errors so forms can mark the right input.
export function useApiAction() {
  const toast = useToast()
  const [pending, setPending] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Returns the result, or null if it failed (the toast has already been shown).
  async function run<T>(action: () => Promise<T>, errorTitle = 'Something went wrong'): Promise<T | null> {
    setPending(true)
    setFieldErrors({})
    try {
      return await action()
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fieldErrors)
        toast.error(err.status === 0 ? 'Connection problem' : errorTitle, err.message)
      } else {
        toast.error(errorTitle, 'Something unexpected happened. Try again.')
      }
      return null
    } finally {
      setPending(false)
    }
  }

  return { run, pending, fieldErrors }
}
