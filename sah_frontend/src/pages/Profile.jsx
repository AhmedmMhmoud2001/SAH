import { useEffect, useState } from 'react'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import { useI18n } from '../i18n/I18nProvider.jsx'
import {
  changeMyPassword,
  deleteMyAccount,
  getMyEnrollments,
  getMyProfile,
  resolveApiUrl,
  updateMyProfile,
  uploadMyAvatar,
} from '../lib/auth.js'
import './profile.css'

export default function Profile() {
  const { dir, lang, t } = useI18n()
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [enrollments, setEnrollments] = useState([])
  const [loadingEnrollments, setLoadingEnrollments] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)
        setLoadingEnrollments(true)
        setErrorMessage('')
        const [me, enrollmentList] = await Promise.all([
          getMyProfile(),
          getMyEnrollments(lang),
        ])
        setUser(me)
        setName(me?.name || '')
        setPhone(me?.phone || '')
        setEnrollments(enrollmentList)
      } catch (error) {
        const msg = error?.message || 'Failed to load profile.'
        setErrorMessage(msg)
        if (msg.toLowerCase().includes('session expired') || msg.toLowerCase().includes('no token')) {
          window.location.assign('/login')
          return
        }
        setEnrollments([])
      } finally {
        setLoading(false)
        setLoadingEnrollments(false)
      }
    }

    loadProfile()
  }, [lang])

  async function handleUpdateProfile(e) {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    try {
      setSavingProfile(true)
      const nextUser = await updateMyProfile({ name, phone })
      setUser(nextUser)
      setSuccessMessage('Profile updated successfully.')
    } catch (error) {
      setErrorMessage(error?.message || 'Failed to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    try {
      setSavingPassword(true)
      await changeMyPassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setSuccessMessage('Password changed successfully.')
    } catch (error) {
      setErrorMessage(error?.message || 'Failed to change password.')
    } finally {
      setSavingPassword(false)
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setErrorMessage('')
    setSuccessMessage('')
    try {
      setUploadingAvatar(true)
      const result = await uploadMyAvatar(file)
      setUser((prev) => ({ ...(prev || {}), avatarUrl: result.avatarUrl }))
      setSuccessMessage('Profile image updated.')
    } catch (error) {
      setErrorMessage(error?.message || 'Failed to upload avatar.')
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.')
    if (!confirmed) return

    setErrorMessage('')
    setSuccessMessage('')
    try {
      setDeletingAccount(true)
      await deleteMyAccount()
      window.location.assign('/signup')
    } catch (error) {
      setErrorMessage(error?.message || 'Failed to delete account.')
    } finally {
      setDeletingAccount(false)
    }
  }

  const avatarSrc = user?.avatarUrl ? resolveApiUrl(user.avatarUrl) : ''

  return (
    <div className="app" dir={dir} lang={lang}>
      <Navbar authenticated homePath="/app" />
      <main className="profilePage">
        <div className="container profileWrap">
          <h1 className="profileTitle">{t('profile.title')}</h1>
          {loading ? <p>Loading profile...</p> : null}
          {errorMessage ? <p className="authMessage authMessage--error">{errorMessage}</p> : null}
          {successMessage ? <p className="authMessage authMessage--success">{successMessage}</p> : null}

          {!loading && user ? (
            <div className="profileCard">
              <section className="profileSection">
                <div className="profileAvatarRow">
                  <div className="profileAvatar">
                    {avatarSrc ? <img src={avatarSrc} alt={user.name || 'User'} /> : <span>{(user.name || 'U').slice(0, 1).toUpperCase()}</span>}
                  </div>
                  <div>
                    <h2>{t('profile.photo')}</h2>
                    <label className="btn btn--ghost profileUploadBtn">
                      {uploadingAvatar ? t('profile.uploading') : t('profile.upload')}
                      <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={uploadingAvatar} />
                    </label>
                  </div>
                </div>
              </section>

              <section className="profileSection">
                <h2>{t('profile.accountInfo')}</h2>
                <form onSubmit={handleUpdateProfile} className="profileForm">
                  <label>
                    {t('profile.name')}
                    <input value={name} onChange={(e) => setName(e.target.value)} required />
                  </label>
                  <label>
                    {t('profile.email')}
                    <input value={user.email || ''} disabled />
                  </label>
                  <label>
                    {t('profile.phone')}
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('profile.phonePlaceholder')} />
                  </label>
                  <button className="profilePrimaryBtn" type="submit" disabled={savingProfile}>
                    {savingProfile ? t('profile.saving') : t('profile.save')}
                  </button>
                </form>
              </section>

              <section className="profileSection">
                <h2>{t('profile.coursesTitle')}</h2>
                {loadingEnrollments ? (
                  <p>{t('msg.loading')}</p>
                ) : enrollments.length === 0 ? (
                  <p>{t('msg.noData')}</p>
                ) : (
                  <div className="profileCoursesTableWrap">
                    <table className="profileCoursesTable">
                      <thead>
                        <tr>
                          <th>{t('nav.courses')}</th>
                          <th>{t('reports.learning.completedLessons')}</th>
                          <th>{t('reports.learning.completionRate')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrollments.map((item) => (
                          <tr key={item.enrollmentId}>
                            <td>{item.course?.title || '-'}</td>
                            <td>{item.completedLessons ?? 0}/{item.totalLessons ?? 0}</td>
                            <td>{item.progress}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="profileSection">
                <h2>{t('profile.changePassword')}</h2>
                <form onSubmit={handleChangePassword} className="profileForm">
                  <label>
                    {t('profile.currentPassword')}
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    {t('profile.newPassword')}
                    <input
                      type="password"
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </label>
                  <button className="profilePrimaryBtn" type="submit" disabled={savingPassword}>
                    {savingPassword ? t('profile.updating') : t('profile.changePasswordBtn')}
                  </button>
                </form>
              </section>

              <section className="profileSection profileDanger">
                <h2>{t('profile.dangerZone')}</h2>
                <p>{t('profile.deleteHint')}</p>
                <button className="profileDangerBtn" type="button" onClick={handleDeleteAccount} disabled={deletingAccount}>
                  {deletingAccount ? t('profile.deleting') : t('profile.deleteAccount')}
                </button>
              </section>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  )
}
