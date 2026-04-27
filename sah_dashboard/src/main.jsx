import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './components/layout/MainLayout.css'
import './pages/admin/AdminPages.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
