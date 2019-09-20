import { useState, useEffect } from 'react'
import store from '../../store'

const createPersistedState = key =>
  function usePersistedState (initialState) {
    const [state, setState] = useState(() =>
      store.get(
        key,
        typeof initialState === 'function' ? initialState() : initialState
      )
    )

    // Only persist to storage if state changes.
    useEffect(
      () => {
        // persist to storage
        store.set(key, state)
      },
      [state]
    )

    return [state, setState]
  }

export default createPersistedState
