import { useState, useEffect } from 'react'
import { Mail, Phone, MapPin, Send, MessageSquare, Trash2, CheckCircle, ExternalLink, Save, Globe, Briefcase, MessageCircle, Camera } from 'lucide-react'
import { useI18n } from '../../context/I18nContext'
import { getAdminContactMessages, markContactMessageRead, deleteContactMessage, getAdminContactInfo, updateAdminContactInfo } from '../../api'
import './AdminPages.css'

export default function Contact() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState('messages')
  const [messages, setMessages] = useState([])
  const [info, setInfo] = useState({
    email: '', phone: '', address: '', whatsapp: '',
    facebook: '', twitter: '', instagram: '', linkedin: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [msgRes, infoRes] = await Promise.all([
        getAdminContactMessages(),
        getAdminContactInfo()
      ])
      setMessages(msgRes.messages || [])
      setInfo(infoRes || {})
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function safeUrl(url) {
    const raw = (url || '').trim()
    if (!raw) return ''
    if (/^https?:\/\//i.test(raw)) return raw
    return `https://${raw}`
  }

  async function handleMarkRead(id) {
    try {
      await markContactMessageRead(id)
      setMessages(messages.map(m => m.id === id ? { ...m, isRead: true } : m))
    } catch (error) {
      alert(t('contact.markReadFailed'))
    }
  }

  async function handleDelete(id) {
    if (!confirm(t('contact.deleteMsgConfirm'))) return
    try {
      await deleteContactMessage(id)
      setMessages(messages.filter(m => m.id !== id))
    } catch (error) {
      alert(t('contact.deleteFailed'))
    }
  }

  async function handleUpdateInfo(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateAdminContactInfo(info)
      alert(t('contact.updateSuccess'))
    } catch (error) {
      alert(t('contact.updateFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>{t('contact.adminTitle')}</h1>
        <div className="tab-switcher" style={{ display: 'flex', gap: '10px', background: 'var(--bg-secondary)', padding: '5px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <button 
            className={`btn ${activeTab === 'messages' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('messages')}
          >
            <MessageSquare size={18} /> {t('contact.tab.messages')}
          </button>
          <button 
            className={`btn ${activeTab === 'info' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('info')}
          >
            <Globe size={18} /> {t('contact.tab.info')}
          </button>
        </div>
      </div>

      {loading ? <p>{t('msg.loading')}</p> : (
        <div className="contact-container" style={{ marginTop: '30px' }}>
          {activeTab === 'messages' ? (
            <div className="messages-section">
              <div className="stats-grid" style={{ marginBottom: '20px' }}>
                <div className="stat-card">
                  <p className="stat-card-title">{t('contact.newMessages')}</p>
                  <p className="stat-card-value">{messages.filter(m => !m.isRead).length}</p>
                </div>
                <div className="stat-card">
                  <p className="stat-card-title">{t('contact.totalMessages')}</p>
                  <p className="stat-card-value">{messages.length}</p>
                </div>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('contact.from')}</th>
                    <th>{t('contact.subject')}</th>
                    <th>{t('contact.date')}</th>
                    <th>{t('contact.status')}</th>
                    <th>{t('actions.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr key={msg.id} className={!msg.isRead ? 'unread-row' : ''} style={{ background: !msg.isRead ? 'rgba(var(--primary-rgb), 0.05)' : 'transparent' }}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{msg.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{msg.email}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: !msg.isRead ? 600 : 400 }}>{msg.subject || t('contact.noSubject')}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {msg.message}
                        </div>
                      </td>
                      <td>{new Date(msg.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${msg.isRead ? 'badge-success' : 'badge-warning'}`}>
                          {msg.isRead ? t('contact.read') : t('contact.new')}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {!msg.isRead && (
                            <button className="action-btn" onClick={() => handleMarkRead(msg.id)} title={t('contact.markRead')}>
                              <CheckCircle size={18} />
                            </button>
                          )}
                          <button className="action-btn delete" onClick={() => handleDelete(msg.id)} title={t('contact.deleteMsg')}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <form onSubmit={handleUpdateInfo} className="contact-info-form">
              <div className="contact-info-header">
                <div>
                  <h2>{t('contact.infoTitle')}</h2>
                  <p className="contact-info-subtitle">
                    {t('contact.infoSubtitle')}
                  </p>
                </div>
                <div className="suffixActions">
                  {info?.email ? (
                    <a className="linkPill" href={`mailto:${info.email}`} target="_blank" rel="noreferrer">
                      <Mail size={14} /> {t('contact.emailTest')} <ExternalLink size={14} />
                    </a>
                  ) : null}
                  {info?.phone ? (
                    <a className="linkPill" href={`tel:${info.phone}`} target="_blank" rel="noreferrer">
                      <Phone size={14} /> {t('contact.callTest')} <ExternalLink size={14} />
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="contact-info-sections">
                <div className="contact-info-card">
                  <div className="contact-info-cardHeader">
                    <div className="contact-info-cardTitle">
                      <Briefcase size={18} /> {t('contact.basicInfo')}
                    </div>
                  </div>

                  <div className="contact-info-grid">
                    <div className="field">
                      <div className="field-labelRow">
                        <label>{t('contact.publicEmail')}</label>
                        {info.email ? <span className="field-help">{info.email}</span> : null}
                      </div>
                      <div className="inputWrap">
                        <span className="inputIcon"><Mail size={16} /></span>
                        <input
                          className="inputWithIcon"
                          type="email"
                          value={info.email || ''}
                          placeholder={t('contact.publicEmailPh')}
                          onChange={e => setInfo({ ...info, email: e.target.value })}
                        />
                      </div>
                      <div className="field-help">{t('contact.publicEmailHelp')}</div>
                    </div>

                    <div className="field">
                      <div className="field-labelRow">
                        <label>{t('contact.phoneNumber')}</label>
                        {info.phone ? <span className="field-help">{info.phone}</span> : null}
                      </div>
                      <div className="inputWrap">
                        <span className="inputIcon"><Phone size={16} /></span>
                        <input
                          className="inputWithIcon"
                          type="text"
                          value={info.phone || ''}
                          placeholder="01002265274"
                          onChange={e => setInfo({ ...info, phone: e.target.value })}
                        />
                      </div>
                      <div className="field-help">{t('contact.phoneHelp')}</div>
                    </div>

                    <div className="field contact-info-gridFull">
                      <div className="field-labelRow">
                        <label>{t('contact.officeAddress')}</label>
                      </div>
                      <textarea
                        className="inputWithIcon"
                        style={{ paddingInlineStart: 14, minHeight: 90 }}
                        value={info.address || ''}
                        placeholder="الرياض، المملكة العربية السعودية"
                        onChange={e => setInfo({ ...info, address: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="contact-info-card">
                  <div className="contact-info-cardHeader">
                    <div className="contact-info-cardTitle">
                      <Globe size={18} /> {t('contact.social')}
                    </div>
                    <div className="suffixActions">
                      {info.whatsapp ? (
                        <a className="linkPill" href={`https://wa.me/${String(info.whatsapp).replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer">
                          <MessageCircle size={14} /> {t('contact.whatsapp')} <ExternalLink size={14} />
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <div className="contact-info-grid">
                    <div className="field">
                      <div className="field-labelRow">
                        <label>{t('contact.whatsappNumber')}</label>
                      </div>
                      <div className="inputWrap">
                        <span className="inputIcon"><MessageCircle size={16} /></span>
                        <input
                          className="inputWithIcon"
                          type="text"
                          value={info.whatsapp || ''}
                          placeholder="966500000022"
                          onChange={e => setInfo({ ...info, whatsapp: e.target.value })}
                        />
                      </div>
                      <div className="field-help">{t('contact.whatsappDigitsHelp')}</div>
                    </div>

                    <div className="field">
                      <div className="field-labelRow">
                        <label>{t('contact.social.facebook')}</label>
                        {info.facebook ? (
                          <a className="linkPill" href={safeUrl(info.facebook)} target="_blank" rel="noreferrer">
                            {t('contact.social.open')} <ExternalLink size={14} />
                          </a>
                        ) : null}
                      </div>
                      <div className="inputWrap">
                        <span className="inputIcon"><Globe size={16} /></span>
                        <input
                          className="inputWithIcon"
                          type="text"
                          value={info.facebook || ''}
                          placeholder="https://facebook.com/sah"
                          onChange={e => setInfo({ ...info, facebook: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="field">
                      <div className="field-labelRow">
                        <label>{t('contact.social.twitter')}</label>
                        {info.twitter ? (
                          <a className="linkPill" href={safeUrl(info.twitter)} target="_blank" rel="noreferrer">
                            {t('contact.social.open')} <ExternalLink size={14} />
                          </a>
                        ) : null}
                      </div>
                      <div className="inputWrap">
                        <span className="inputIcon"><Globe size={16} /></span>
                        <input
                          className="inputWithIcon"
                          type="text"
                          value={info.twitter || ''}
                          placeholder="https://x.com/sah"
                          onChange={e => setInfo({ ...info, twitter: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="field">
                      <div className="field-labelRow">
                        <label>{t('contact.social.instagram')}</label>
                        {info.instagram ? (
                          <a className="linkPill" href={safeUrl(info.instagram)} target="_blank" rel="noreferrer">
                            {t('contact.social.open')} <ExternalLink size={14} />
                          </a>
                        ) : null}
                      </div>
                      <div className="inputWrap">
                        <span className="inputIcon"><Camera size={16} /></span>
                        <input
                          className="inputWithIcon"
                          type="text"
                          value={info.instagram || ''}
                          placeholder="https://instagram.com/sah"
                          onChange={e => setInfo({ ...info, instagram: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="field">
                      <div className="field-labelRow">
                        <label>{t('contact.social.linkedin')}</label>
                        {info.linkedin ? (
                          <a className="linkPill" href={safeUrl(info.linkedin)} target="_blank" rel="noreferrer">
                            {t('contact.social.open')} <ExternalLink size={14} />
                          </a>
                        ) : null}
                      </div>
                      <div className="inputWrap">
                        <span className="inputIcon"><Briefcase size={16} /></span>
                        <input
                          className="inputWithIcon"
                          type="text"
                          value={info.linkedin || ''}
                          placeholder="https://linkedin.com/company/sah"
                          onChange={e => setInfo({ ...info, linkedin: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="contact-saveBar">
                <div className="contact-saveHint">
                  {saving ? t('contact.saveHint.saving') : t('contact.saveHint.tip')}
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <Save size={18} /> {saving ? t('contact.updating') : t('contact.saveContactInfo')}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}