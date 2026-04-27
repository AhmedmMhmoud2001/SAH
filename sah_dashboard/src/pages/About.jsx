import { useState, useEffect } from 'react'
import { useI18n } from '../context/I18nContext'
import { getAbout } from '../api'
import './pages.css'

export default function About() {
  const { lang, isRTL } = useI18n()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await getAbout()
        setData(res)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="loading">Loading...</div>
  if (!data) return <div className="error">Failed to load content</div>

  const title = lang === 'ar' ? data.titleAr : data.titleEn
  const content = lang === 'ar' ? data.contentAr : data.contentEn

  return (
    <div className="public-about-page animate-fade-in">
      {/* Hero Section */}
      <div className="about-hero-section" style={{ 
        position: 'relative',
        height: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(rgba(10, 25, 47, 0.7), rgba(10, 25, 47, 0.7)), url(${data.imageUrl || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1920'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 className="hero-title" style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '20px', letterSpacing: '-1px' }}>
            {title}
          </h1>
          <div className="hero-divider" style={{ width: '80px', height: '4px', background: 'var(--primary)', margin: '0 auto' }}></div>
        </div>
      </div>

      {/* Content Section */}
      <div className="about-main-content" style={{ padding: '80px 0', background: 'var(--bg-primary)' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div className="content-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: data.videoUrl ? '1.2fr 0.8fr' : '1fr', 
            gap: '60px',
            alignItems: 'start'
          }}>
            <div className="text-wrapper">
              <div className="about-description" style={{ 
                fontSize: '1.2rem', 
                lineHeight: '1.8', 
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-line'
              }}>
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>
              
              <div className="stats-strip" style={{ 
                display: 'flex', 
                gap: '40px', 
                marginTop: '50px',
                padding: '30px',
                background: 'var(--bg-secondary)',
                borderRadius: '20px',
                border: '1px solid var(--border-color)'
              }}>
                <div className="stat-item">
                  <h4 style={{ color: 'var(--primary)', fontSize: '2rem', marginBottom: '5px' }}>10k+</h4>
                  <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Students</p>
                </div>
                <div className="stat-item">
                  <h4 style={{ color: 'var(--primary)', fontSize: '2rem', marginBottom: '5px' }}>50+</h4>
                  <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Courses</p>
                </div>
                <div className="stat-item">
                  <h4 style={{ color: 'var(--primary)', fontSize: '2rem', marginBottom: '5px' }}>24/7</h4>
                  <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Support</p>
                </div>
              </div>
            </div>

            {data.videoUrl && (
              <div className="sticky-video" style={{ position: 'sticky', top: '100px' }}>
                <div className="video-container" style={{ 
                  borderRadius: '24px', 
                  overflow: 'hidden', 
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  background: '#000'
                }}>
                  <iframe 
                    width="100%" 
                    height="350" 
                    src={data.videoUrl.replace('watch?v=', 'embed/')} 
                    title="Introduction Video" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
                <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.9rem', opacity: 0.6 }}>
                  Watch our introduction video
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

