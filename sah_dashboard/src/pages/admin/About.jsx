import { useState, useEffect } from 'react'
import { Save, Languages, Video, Image as ImageIcon, Type } from 'lucide-react'
import { useI18n } from '../../context/I18nContext'
import { getAdminAbout, updateAdminAbout, uploadAboutImage } from '../../api'
import './AdminPages.css'

import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['link'],
    ['clean']
  ],
}

export default function AboutEditor() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    titleAr: '',
    titleEn: '',
    contentAr: '',
    contentEn: '',
    videoUrl: '',
    imageUrl: ''
  })

  function apiOrigin() {
    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      return new URL(base).origin
    } catch {
      return 'http://localhost:3000'
    }
  }

  function resolveImageUrl(url) {
    if (!url) return ''
    if (/^https?:\/\//i.test(url)) return url
    return `${apiOrigin()}${url.startsWith('/') ? '' : '/'}${url}`
  }

  useEffect(() => {
    async function load() {
      try {
        const data = await getAdminAbout()
        setFormData(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleImageFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const data = await uploadAboutImage(file)
      setFormData(prev => ({ ...prev, imageUrl: data?.url || '' }))
    } catch (err) {
      console.error(err)
      alert(t('about.imageUploadFailed'))
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateAdminAbout(formData)
      alert(t('about.updated'))
    } catch (err) {
      alert(t('about.updateFailed'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading">{t('msg.loading')}</div>

  return (
    <div className="admin-page about-editor">
      <div className="page-header">
        <div className="header-text">
          <h1>{t('about.editorTitle')}</h1>
          <p className="subtitle">{t('about.editorSubtitle')}</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={saving}>
          <Save size={20} /> {saving ? t('about.saving') : t('about.publish')}
        </button>
      </div>

      <div className="editor-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
        {/* Localization Section */}
        <div className="card editor-card">
          <div className="card-header">
            <Languages className="header-icon" />
            <div>
              <h3>{t('about.localizedContent')}</h3>
              <p>{t('about.localizedContentSub')}</p>
            </div>
          </div>
          <div className="card-body">
            <div className="language-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
              <div className="lang-column ar">
                <div className="lang-indicator">العربية</div>
                <div className="form-group">
                  <label>العنوان</label>
                  <input 
                    type="text" 
                    className="form-control-lg"
                    value={formData.titleAr} 
                    onChange={e => setFormData({...formData, titleAr: e.target.value})} 
                    placeholder="مثال: عن أكاديمية SAH"
                  />
                </div>
                <div className="form-group">
                  <label>المحتوى (محرر احترافي)</label>
                  <div className="quill-wrapper">
                    <ReactQuill 
                      theme="snow" 
                      value={formData.contentAr} 
                      onChange={val => setFormData({...formData, contentAr: val})}
                      modules={quillModules}
                      placeholder="اكتب قصة نجاح الأكاديمية هنا..."
                    />
                  </div>
                </div>
              </div>

              <div className="lang-column en">
                <div className="lang-indicator">{t('about.enSection')}</div>
                <div className="form-group">
                  <label>{t('home.item.title')}</label>
                  <input 
                    type="text" 
                    className="form-control-lg"
                    value={formData.titleEn} 
                    onChange={e => setFormData({...formData, titleEn: e.target.value})} 
                    placeholder="e.g. About SAH Academy"
                  />
                </div>
                <div className="form-group">
                  <label>{t('about.contentEnLabel')}</label>
                  <div className="quill-wrapper">
                    <ReactQuill 
                      theme="snow" 
                      value={formData.contentEn} 
                      onChange={val => setFormData({...formData, contentEn: val})}
                      modules={quillModules}
                      placeholder="Describe your academy's mission and history..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Media Section */}
        <div className="card editor-card">
          <div className="card-header">
            <Video className="header-icon" />
            <div>
              <h3>{t('about.media')}</h3>
              <p>{t('about.mediaSub')}</p>
            </div>
          </div>
          <div className="card-body">
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div className="form-group">
                <label><Video size={16} /> {t('about.youtubeLink')}</label>
                <input 
                  type="text" 
                  value={formData.videoUrl} 
                  onChange={e => setFormData({...formData, videoUrl: e.target.value})} 
                  placeholder={t('about.youtubePh')}
                />
                <small className="help-text">{t('about.youtubeHelp')}</small>
              </div>
              <div className="form-group">
                <label><ImageIcon size={16} /> {t('about.heroImage')}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  disabled={uploadingImage}
                />
                <small className="help-text">
                  {uploadingImage ? t('about.uploadingImage') : t('about.uploadHelp')}
                </small>

                {formData.imageUrl ? (
                  <div style={{ marginTop: 12 }}>
                    <img
                      src={resolveImageUrl(formData.imageUrl)}
                      alt="About banner"
                      style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 12 }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}