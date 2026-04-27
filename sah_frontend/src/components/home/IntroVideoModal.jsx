import { useEffect } from 'react'
import { useI18n } from '../../i18n/I18nProvider.jsx'

function stop(e) {
  e.stopPropagation()
}

export default function IntroVideoModal({ open, onClose, videoUrl }) {
  const { t, dir } = useI18n()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const title = t('home.introVideo')

  return (
    <div className="ivModal" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="ivModal__panel" dir={dir} onClick={stop}>
        <button type="button" className="ivModal__close" onClick={onClose} aria-label={t('nav.closeMenu')}>
          ×
        </button>
        <div className="ivModal__frame">
          <iframe
            src={videoUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}

