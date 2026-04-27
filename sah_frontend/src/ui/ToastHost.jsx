import { useEffect, useMemo, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { useI18n } from '../i18n/I18nProvider.jsx'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 640px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])

  return isMobile
}

export default function ToastHost() {
  const { dir } = useI18n()
  const isMobile = useIsMobile()

  const position = isMobile ? 'top-center' : 'top-right'
  const toastStyle = useMemo(
    () => ({
      direction: dir,
      fontWeight: 800,
    }),
    [dir],
  )

  return (
    <Toaster
      position={position}
      toastOptions={{
        duration: 3500,
        style: toastStyle,
      }}
    />
  )
}

