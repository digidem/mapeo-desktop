// @ts-check
import { useEffect, useRef } from 'react'

/** @param {function(string):void} callBack  */
const subscribeToProjectInvites = callBack => {
  const intervalId = setInterval(() => callBack('abc123'), 3000)
  return () => clearInterval(intervalId)
}

/** @param {function(string):void} onInviteReceived */
export default function useProjectInviteListener (onInviteReceived) {
  const callbackRef = useRef(onInviteReceived)

  useEffect(() => {
    callbackRef.current = onInviteReceived
  }, [onInviteReceived])

  useEffect(() => {
    /** @param {string} key */
    const handleInvite = key => callbackRef.current(key)
    const unsubscribe = subscribeToProjectInvites(handleInvite)

    return () => unsubscribe()
  }, [])
}
