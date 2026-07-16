import { useCallback, useEffect, useState } from 'react'

export function useNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )

  useEffect(() => {
    if (typeof Notification === 'undefined') return
    setPermission(Notification.permission)
  }, [])

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'unsupported'
    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }, [])

  const notify = useCallback(
    (title, options) => {
      if (typeof Notification === 'undefined') return
      if (Notification.permission !== 'granted') return
      try {
        new Notification(title, options)
      } catch {
        // Some browsers throw if the tab isn't focused-eligible; fail silently.
      }
    },
    []
  )

  return { permission, requestPermission, notify }
}
