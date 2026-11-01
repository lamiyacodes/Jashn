import { useEffect } from 'react'
import { saveState } from '../lib/storage'

/** Saves the state to the browser once it has stopped changing for a moment. */
export default function useDebouncedSave(state, delay = 400) {
  useEffect(() => {
    const timer = setTimeout(() => saveState(state), delay)
    return () => clearTimeout(timer)
  }, [state, delay])
}
