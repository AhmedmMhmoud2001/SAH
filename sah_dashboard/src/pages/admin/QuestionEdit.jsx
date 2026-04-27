import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useI18n } from '../../context/I18nContext'
import { getAdminQuestion, updateAdminQuestion } from '../../api'

export default function QuestionEdit() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    quizId: '',
    text: '',
    textEn: '',
    options: ['', '', '', ''],
    optionsEn: ['', '', '', ''],
    correctIndex: 0,
  })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const q = await getAdminQuestion(id)
        if (!mounted) return
        const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options
        const optionsEn = typeof q.optionsEn === 'string' ? JSON.parse(q.optionsEn) : q.optionsEn
        setForm({
          quizId: q.quizId,
          text: q.text || '',
          textEn: q.textEn || '',
          options: Array.isArray(options) ? options : ['', '', '', ''],
          optionsEn: Array.isArray(optionsEn) ? optionsEn : ['', '', '', ''],
          correctIndex: q.correctIndex ?? 0,
        })
      } catch (e) {
        console.error(e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [id])

  function updateOption(index, value, isEn = false) {
    const key = isEn ? 'optionsEn' : 'options'
    const next = [...form[key]]
    next[index] = value
    setForm({ ...form, [key]: next })
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    try {
      await updateAdminQuestion(id, form)
      navigate('/admin/questions')
    } catch (e) {
      console.error(e)
      alert(t('msg.error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>{t('actions.edit')} Question</h1>
        <button className="btn" type="button" onClick={() => navigate('/admin/questions')}>
          {t('actions.cancel')}
        </button>
      </div>

      {loading ? (
        <div className="loading">{t('msg.loading')}</div>
      ) : (
        <form className="card" onSubmit={onSubmit}>
          <div className="form-group">
            <label>Question (Arabic)</label>
            <input value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Question (English)</label>
            <input value={form.textEn} onChange={(e) => setForm({ ...form, textEn: e.target.value })} required />
          </div>

          <div className="form-group">
            <label>Options</label>
            {form.options.map((opt, i) => (
              <input key={i} value={opt} onChange={(e) => updateOption(i, e.target.value, false)} required />
            ))}
          </div>
          <div className="form-group">
            <label>Options (English)</label>
            {form.optionsEn.map((opt, i) => (
              <input key={i} value={opt} onChange={(e) => updateOption(i, e.target.value, true)} required />
            ))}
          </div>
          <div className="form-group">
            <label>Correct Answer Index (0-3)</label>
            <input
              type="number"
              min="0"
              max="3"
              value={form.correctIndex}
              onChange={(e) => setForm({ ...form, correctIndex: parseInt(e.target.value || '0') })}
            />
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {t('actions.save')}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

