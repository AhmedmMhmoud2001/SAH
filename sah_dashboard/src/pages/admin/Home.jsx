import { useEffect, useState } from 'react'
import { Save, Home as HomeIcon, Image as ImageIcon, Star, Plus, Trash2, Upload, Video } from 'lucide-react'
import { useI18n } from '../../context/I18nContext'
import {
  getAdminHome,
  updateAdminHome,
  uploadHomeFeatureIcon,
  uploadHomeTestimonialAvatar,
} from '../../api'
import './AdminPages.css'

function apiOrigin() {
  try {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    return new URL(base).origin
  } catch {
    return 'http://localhost:3000'
  }
}

function resolveAsset(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${apiOrigin()}${url.startsWith('/') ? '' : '/'}${url}`
}

function safeParseArray(val) {
  if (!val) return []
  if (Array.isArray(val)) return val
  try {
    const parsed = JSON.parse(val)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function AdminHomeEditor() {
  const { t, isRTL } = useI18n()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    heroTitleAr: '',
    heroTitleEn: '',
    heroBrand: 'Odoo',
    heroSubtitleAr: '',
    heroSubtitleEn: '',
    heroCtaLabelAr: '',
    heroCtaLabelEn: '',
    heroCtaHref: '#courses',
    introVideoUrl: '',
    heroImageUrl: '',

    featuresAr: [],
    featuresEn: [],

    testimonialsAr: [],
    testimonialsEn: [],

    stepsAr: [],
    stepsEn: [],

    ctaTitleAr: '',
    ctaTitleEn: '',
    ctaSubAr: '',
    ctaSubEn: '',
    ctaBtnAr: '',
    ctaBtnEn: '',
    ctaHref: '#courses',
  })

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const data = await getAdminHome()
        if (cancelled) return
        setForm((prev) => ({
          ...prev,
          ...data,
          featuresAr: data?.featuresArParsed ?? safeParseArray(data?.featuresAr),
          featuresEn: data?.featuresEnParsed ?? safeParseArray(data?.featuresEn),
          testimonialsAr: data?.testimonialsArParsed ?? safeParseArray(data?.testimonialsAr),
          testimonialsEn: data?.testimonialsEnParsed ?? safeParseArray(data?.testimonialsEn),
          stepsAr: data?.stepsArParsed ?? safeParseArray(data?.stepsAr),
          stepsEn: data?.stepsEnParsed ?? safeParseArray(data?.stepsEn),
        }))
      } catch (e) {
        console.error(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  async function onUploadFeatureIcon(langKey, idx, e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res = await uploadHomeFeatureIcon(file)
      setForm((p) => {
        const next = { ...p }
        const arr = [...(next[langKey] || [])]
        arr[idx] = { ...(arr[idx] || {}), iconUrl: res?.url || '' }
        next[langKey] = arr
        return next
      })
    } catch (err) {
      console.error(err)
      alert(t('home.uploadFailed'))
    } finally {
      e.target.value = ''
    }
  }

  async function onUploadTestimonialAvatar(langKey, idx, e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res = await uploadHomeTestimonialAvatar(file)
      setForm((p) => {
        const next = { ...p }
        const arr = [...(next[langKey] || [])]
        arr[idx] = { ...(arr[idx] || {}), avatarUrl: res?.url || '' }
        next[langKey] = arr
        return next
      })
    } catch (err) {
      console.error(err)
      alert(t('home.uploadFailed'))
    } finally {
      e.target.value = ''
    }
  }

  async function onSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateAdminHome({
        heroTitleAr: form.heroTitleAr,
        heroTitleEn: form.heroTitleEn,
        heroBrand: form.heroBrand,
        heroSubtitleAr: form.heroSubtitleAr,
        heroSubtitleEn: form.heroSubtitleEn,
        heroCtaLabelAr: form.heroCtaLabelAr,
        heroCtaLabelEn: form.heroCtaLabelEn,
        heroCtaHref: form.heroCtaHref,
        introVideoUrl: form.introVideoUrl,
        featuresAr: form.featuresAr,
        featuresEn: form.featuresEn,
        testimonialsAr: form.testimonialsAr,
        testimonialsEn: form.testimonialsEn,
        stepsAr: form.stepsAr,
        stepsEn: form.stepsEn,
        ctaTitleAr: form.ctaTitleAr,
        ctaTitleEn: form.ctaTitleEn,
        ctaSubAr: form.ctaSubAr,
        ctaSubEn: form.ctaSubEn,
        ctaBtnAr: form.ctaBtnAr,
        ctaBtnEn: form.ctaBtnEn,
        ctaHref: form.ctaHref,
      })
      alert(t('home.updated'))
    } catch (err) {
      console.error(err)
      alert(t('home.updateFailed'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading">{t('msg.loading')}</div>

  return (
    <div className="admin-page home-editor" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="page-header">
        <div className="header-text">
          <h1>{t('nav.home')}</h1>
          <p className="subtitle">{t('home.editorSubtitle')}</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={onSave} disabled={saving}>
          <Save size={20} /> {saving ? t('home.saving') : t('home.publish')}
        </button>
      </div>

      <form onSubmit={onSave} className="editor-form" style={{ maxWidth: 1100 }}>
        <div className="card editor-card">
          <div className="card-header">
            <HomeIcon className="header-icon" />
            <div>
              <h3>{t('home.hero')}</h3>
              <p>{t('home.heroSub')}</p>
            </div>
          </div>
          <div className="card-body">
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="form-group">
                <label>{t('home.heroTitleAr')}</label>
                <input value={form.heroTitleAr || ''} onChange={(e) => setForm({ ...form, heroTitleAr: e.target.value })} />
              </div>
              <div className="form-group">
                <label>{t('home.heroTitleEn')}</label>
                <input value={form.heroTitleEn || ''} onChange={(e) => setForm({ ...form, heroTitleEn: e.target.value })} />
              </div>
              <div className="form-group">
                <label>{t('home.brandToken')}</label>
                <input value={form.heroBrand || ''} onChange={(e) => setForm({ ...form, heroBrand: e.target.value })} />
              </div>
              <div className="form-group">
                <label><Video size={16} /> {t('home.introVideoUrl')}</label>
                <input value={form.introVideoUrl || ''} onChange={(e) => setForm({ ...form, introVideoUrl: e.target.value })} />
              </div>
              <div className="form-group">
                <label>{t('home.subtitleAr')}</label>
                <textarea
                  value={form.heroSubtitleAr || ''}
                  onChange={(e) => setForm({ ...form, heroSubtitleAr: e.target.value })}
                  rows={4}
                  style={{ width: '100%', minHeight: 120, resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label>{t('home.subtitleEn')}</label>
                <textarea
                  value={form.heroSubtitleEn || ''}
                  onChange={(e) => setForm({ ...form, heroSubtitleEn: e.target.value })}
                  rows={4}
                  style={{ width: '100%', minHeight: 120, resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label>{t('home.ctaLabelAr')}</label>
                <input value={form.heroCtaLabelAr || ''} onChange={(e) => setForm({ ...form, heroCtaLabelAr: e.target.value })} />
              </div>
              <div className="form-group">
                <label>{t('home.ctaLabelEn')}</label>
                <input value={form.heroCtaLabelEn || ''} onChange={(e) => setForm({ ...form, heroCtaLabelEn: e.target.value })} />
              </div>
              <div className="form-group">
                <label>{t('home.ctaHref')}</label>
                <input value={form.heroCtaHref || ''} onChange={(e) => setForm({ ...form, heroCtaHref: e.target.value })} />
              </div>
            </div>
          </div>
        </div>

        <div className="card editor-card">
          <div className="card-header">
            <ImageIcon className="header-icon" />
            <div>
              <h3>{t('home.features')}</h3>
              <p>{t('home.featuresSub')}</p>
            </div>
          </div>
          <div className="card-body">
            {(['featuresAr', 'featuresEn']).map((key) => (
              <div key={key} style={{ marginBottom: 18 }}>
                <h4 style={{ margin: '0 0 10px' }}>{key === 'featuresAr' ? t('home.lang.ar') : t('home.lang.en')}</h4>
                <div style={{ display: 'grid', gap: 12 }}>
                  {(form[key] || []).map((it, idx) => (
                    <div key={idx} className="contact-info-card" style={{ padding: 16 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 220px', gap: 12, alignItems: 'start' }}>
                        <div className="form-group">
                          <label>{t('home.item.title')}</label>
                          <input
                            value={it?.title || ''}
                            onChange={(e) => {
                              const arr = [...form[key]]
                              arr[idx] = { ...(arr[idx] || {}), title: e.target.value }
                              setForm({ ...form, [key]: arr })
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>{t('home.item.description')}</label>
                          <input
                            value={it?.desc || ''}
                            onChange={(e) => {
                              const arr = [...form[key]]
                              arr[idx] = { ...(arr[idx] || {}), desc: e.target.value }
                              setForm({ ...form, [key]: arr })
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label><Upload size={16} /> {t('home.item.icon')}</label>
                          <input type="file" accept="image/*" onChange={(e) => onUploadFeatureIcon(key, idx, e)} />
                          {it?.iconUrl ? (
                            <img src={resolveAsset(it.iconUrl)} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 12, marginTop: 8 }} />
                          ) : null}
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            const arr = [...form[key]]
                            arr.splice(idx, 1)
                            setForm({ ...form, [key]: arr })
                          }}
                        >
                          <Trash2 size={16} /> {t('home.item.remove')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ marginTop: 10 }}
                  onClick={() => setForm({ ...form, [key]: [...(form[key] || []), { title: '', desc: '', iconUrl: '' }] })}
                >
                  <Plus size={16} /> {t('home.item.addFeature')}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card editor-card">
          <div className="card-header">
            <Star className="header-icon" />
            <div>
              <h3>{t('home.testimonials')}</h3>
              <p>{t('home.testimonialsSub')}</p>
            </div>
          </div>
          <div className="card-body">
            {(['testimonialsAr', 'testimonialsEn']).map((key) => (
              <div key={key} style={{ marginBottom: 18 }}>
                <h4 style={{ margin: '0 0 10px' }}>{key === 'testimonialsAr' ? t('home.lang.ar') : t('home.lang.en')}</h4>
                <div style={{ display: 'grid', gap: 12 }}>
                  {(form[key] || []).map((it, idx) => (
                    <div key={idx} className="contact-info-card" style={{ padding: 16 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                          <label>{t('home.testimonial.name')}</label>
                          <input
                            value={it?.name || ''}
                            onChange={(e) => {
                              const arr = [...form[key]]
                              arr[idx] = { ...(arr[idx] || {}), name: e.target.value }
                              setForm({ ...form, [key]: arr })
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>{t('home.testimonial.role')}</label>
                          <input
                            value={it?.role || ''}
                            onChange={(e) => {
                              const arr = [...form[key]]
                              arr[idx] = { ...(arr[idx] || {}), role: e.target.value }
                              setForm({ ...form, [key]: arr })
                            }}
                          />
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label>{t('home.testimonial.text')}</label>
                          <textarea
                            value={it?.text || ''}
                            rows={5}
                            style={{ width: '100%', minHeight: 140, resize: 'vertical' }}
                            onChange={(e) => {
                              const arr = [...form[key]]
                              arr[idx] = { ...(arr[idx] || {}), text: e.target.value }
                              setForm({ ...form, [key]: arr })
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>{t('home.testimonial.rating')}</label>
                          <input
                            type="number"
                            min={1}
                            max={5}
                            value={it?.rating ?? 5}
                            onChange={(e) => {
                              const arr = [...form[key]]
                              arr[idx] = { ...(arr[idx] || {}), rating: Number(e.target.value || 5) }
                              setForm({ ...form, [key]: arr })
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label><Upload size={16} /> {t('home.testimonial.avatar')}</label>
                          <input type="file" accept="image/*" onChange={(e) => onUploadTestimonialAvatar(key, idx, e)} />
                          {it?.avatarUrl ? (
                            <img src={resolveAsset(it.avatarUrl)} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 999, marginTop: 8 }} />
                          ) : null}
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            const arr = [...form[key]]
                            arr.splice(idx, 1)
                            setForm({ ...form, [key]: arr })
                          }}
                        >
                          <Trash2 size={16} /> {t('home.item.remove')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ marginTop: 10 }}
                  onClick={() => setForm({ ...form, [key]: [...(form[key] || []), { name: '', role: '', text: '', rating: 5, avatarUrl: '' }] })}
                >
                  <Plus size={16} /> {t('home.item.addTestimonial')}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card editor-card">
          <div className="card-header">
            <Video className="header-icon" />
            <div>
              <h3>{t('home.ctaSection')}</h3>
              <p>{t('home.ctaSectionSub')}</p>
            </div>
          </div>
          <div className="card-body">
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="form-group">
                <label>{t('home.ctaTitleAr')}</label>
                <input value={form.ctaTitleAr || ''} onChange={(e) => setForm({ ...form, ctaTitleAr: e.target.value })} />
              </div>
              <div className="form-group">
                <label>{t('home.ctaTitleEn')}</label>
                <input value={form.ctaTitleEn || ''} onChange={(e) => setForm({ ...form, ctaTitleEn: e.target.value })} />
              </div>
              <div className="form-group">
                <label>{t('home.ctaSubAr')}</label>
                <textarea
                  value={form.ctaSubAr || ''}
                  onChange={(e) => setForm({ ...form, ctaSubAr: e.target.value })}
                  rows={4}
                  style={{ width: '100%', minHeight: 120, resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label>{t('home.ctaSubEn')}</label>
                <textarea
                  value={form.ctaSubEn || ''}
                  onChange={(e) => setForm({ ...form, ctaSubEn: e.target.value })}
                  rows={4}
                  style={{ width: '100%', minHeight: 120, resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label>{t('home.ctaBtnAr')}</label>
                <input value={form.ctaBtnAr || ''} onChange={(e) => setForm({ ...form, ctaBtnAr: e.target.value })} />
              </div>
              <div className="form-group">
                <label>{t('home.ctaBtnEn')}</label>
                <input value={form.ctaBtnEn || ''} onChange={(e) => setForm({ ...form, ctaBtnEn: e.target.value })} />
              </div>
              <div className="form-group">
                <label>{t('home.ctaHref')}</label>
                <input value={form.ctaHref || ''} onChange={(e) => setForm({ ...form, ctaHref: e.target.value })} />
              </div>
            </div>
          </div>
        </div>

        <div className="contact-saveBar">
          <div className="contact-saveHint">{saving ? t('contact.saveHint.saving') : t('home.publish')}</div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={18} /> {saving ? t('contact.updating') : t('actions.save')}
          </button>
        </div>
      </form>
    </div>
  )
}

