import { useEffect, useState } from 'react'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Courses from './pages/Courses.jsx'
import CourseDetails from './pages/CourseDetails.jsx'
import CourseLearn from './pages/CourseLearn.jsx'
import Quiz from './pages/Quiz.jsx'
import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'
import MyCourses from './pages/MyCourses.jsx'
import Checkout from './pages/Checkout.jsx'
import CertificateView from './pages/CertificateView.jsx'
import Settings from './pages/Settings.jsx'
import Notifications from './pages/Notifications.jsx'
import Profile from './pages/Profile.jsx'
import { getStoredUser } from './lib/auth.js'
import { getDashboardBaseUrl } from './lib/dashboardUrl.js'

function getPathname() {
  return typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '/'
}

export default function App() {
  const [path, setPath] = useState(getPathname)
  const dashboardBaseUrl = getDashboardBaseUrl()

  useEffect(() => {
    if (typeof window === 'undefined') return

    function notify() {
      setPath(getPathname())
    }

    const origPush = window.history.pushState
    const origReplace = window.history.replaceState

    window.history.pushState = function pushStatePatched(...args) {
      const ret = origPush.apply(this, args)
      window.dispatchEvent(new Event('locationchange'))
      return ret
    }
    window.history.replaceState = function replaceStatePatched(...args) {
      const ret = origReplace.apply(this, args)
      window.dispatchEvent(new Event('locationchange'))
      return ret
    }

    window.addEventListener('popstate', notify)
    window.addEventListener('locationchange', notify)

    return () => {
      window.removeEventListener('popstate', notify)
      window.removeEventListener('locationchange', notify)
      window.history.pushState = origPush
      window.history.replaceState = origReplace
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [path])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const currentPath = path.replace(/\/+$/, '') || '/'
    const user = getStoredUser()
    const role = String(user?.role || '').toLowerCase()
    const isAdmin = role === 'admin'

    if (dashboardBaseUrl) {
      if (currentPath === '/admin') {
        window.location.href = `${dashboardBaseUrl}/admin`
        return
      }

      if (currentPath === '/' && isAdmin) {
        window.location.href = `${dashboardBaseUrl}/admin`
      }
    }
  }, [dashboardBaseUrl, path])

  if (path === '/about' || path === '/about/') return <About />
  if (path === '/courses' || path === '/courses/') return <Courses />
  if (path.startsWith('/course/') && path.includes('/learn')) return <CourseLearn />
  if (path.startsWith('/course/') && path.includes('/quiz/')) return <Quiz />
  if (path.startsWith('/course/') && path.includes('/final-quiz')) return <Quiz />
  if (path.startsWith('/course')) return <CourseDetails />
  if (path === '/contact' || path === '/contact/') return <Contact />
  if (path === '/login' || path === '/login/') return <Login />
  if (path === '/checkout' || path === '/checkout/') return <Checkout />
  if (path === '/signup' || path === '/signup/' || path === '/register' || path === '/register/')
    return <SignUp />
  if (path === '/my-courses' || path === '/my-courses/') return <MyCourses />
  if (path.startsWith('/certificate/')) return <CertificateView />
  if (path === '/settings' || path === '/settings/') return <Settings />
  if (path === '/notifications' || path === '/notifications/') return <Notifications />
  if (path === '/profile' || path === '/profile/') return <Profile />
  return <Home />
}
