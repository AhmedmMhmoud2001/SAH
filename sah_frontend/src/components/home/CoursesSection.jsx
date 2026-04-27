import cardHeaderImg from '../../assets/img_home/Card Header.png'
import clockIcon from '../../assets/img_home/tabler_clock-filled.png'
import studentsIcon from '../../assets/img_home/mdi_account-student.png'
import { useI18n } from '../../i18n/I18nProvider.jsx'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { getCourses, resolveAssetUrl } from '../../api/index.js'

const COURSES = [
  {
    id: 'c1',
    title: 'أساسيات المحاسبة المالية',
    enTitle: 'Financial Accounting Fundamentals',
    price: '120 دولار',
    metaLeft: '20 ساعة',
    metaRight: ' 20 طالب',
    desc:
      'تعلم المبادئ الأساسية للمحاسبة المالية من خلال دروس تفاعلية مع مدرب ذكاء اصطناعي متخصص',
    enDesc:
      'Learn the fundamentals of financial accounting through interactive lessons with an AI instructor.',
    image: cardHeaderImg,
  },
  {
    id: 'c2',
    title: 'المحاسبة الإدارية وتحليل التكاليف',
    enTitle: 'Managerial Accounting & Cost Analysis',
    price: '220 دولار',
    metaLeft: '20 ساعة',
    metaRight: ' 20 طالب',
    desc: 'أدوات عملية لاتخاذ القرار وإدارة التكاليف بكفاءة.',
    enDesc: 'Practical tools for decision-making and managing costs efficiently.',
    image: cardHeaderImg,
  },
  {
    id: 'c3',
    title: 'Odoo للمحاسبة وإدارة المبيعات',
    enTitle: 'Odoo for Accounting & Sales',
    price: '180 دولار',
    metaLeft: '20 ساعة',
    metaRight: ' 20 طالب',
    desc: 'تطبيقات عملية على Odoo لإدارة الحسابات والمبيعات.',
    enDesc: 'Hands-on Odoo workflows for accounting and sales management.',
    image: cardHeaderImg,
  },
  {
    id: 'c4',
    title: 'تحليل القوائم المالية',
    enTitle: 'Financial Statements Analysis',
    price: '150 دولار',
    metaLeft: '20 ساعة',
    metaRight: ' 20 طالب',
    desc: 'اقرأ القوائم المالية واستخرج المؤشرات المهمة للأعمال.',
    enDesc: 'Read financial statements and extract key business insights.',
    image: cardHeaderImg,
  },
  {
    id: 'c5',
    title: 'Excel للمحاسبين من الصفر للاحتراف',
    enTitle: 'Excel for Accountants: From Zero to Pro',
    price: '199 دولار',
    metaLeft: '20 ساعة',
    metaRight: ' 20 طالب',
    desc: 'مهارات Excel التي يحتاجها المحاسب يوميًا بسرعة وبشكل عملي.',
    enDesc: 'Essential daily Excel skills for accountants—fast and practical.',
    image: cardHeaderImg,
  },
  {
    id: 'c6',
    title: 'Odoo المخزون والمشتريات',
    enTitle: 'Odoo Inventory & Purchases',
    price: '210 دولار',
    metaLeft: '20 ساعة',
    metaRight: ' 20 طالب',
    desc: 'إدارة المخزون والمشتريات في Odoo خطوة بخطوة.',
    enDesc: 'Manage inventory and purchasing in Odoo step by step.',
    image: cardHeaderImg,
  },
]

function CourseMeta({ icon, label, value, variant }) {
  return (
    <span className="course__meta" aria-label={`${label}: ${value}`}>
      <span
        className={
          variant === 'clock'
            ? 'course__metaIconWrap course__metaIconWrap--clock'
            : 'course__metaIconWrap course__metaIconWrap--grad'
        }
      >
        <img className="course__metaIcon" src={icon} alt="" width="16" height="16" />
      </span>
      <span className="course__metaValue">{value}</span>
    </span>
  )
}

function formatPrice(price, lang) {
  const n = typeof price === 'number' ? price : Number(price)
  if (!Number.isFinite(n)) return lang === 'en' ? '—' : '—'
  if (lang === 'en') return `${n} SAR`
  return `${n} ر.س`
}

function CourseCard({
  id,
  title,
  image,
  duration,
  students,
  price,
  shortDesc,
}) {
  const { t, lang } = useI18n()
  const shownPrice = formatPrice(price, lang)
  return (
    <a className="course course--clickable" href={`/course/${id}`} aria-label={title}>
      <div className="course__header">
        <img
          className="course__image"
          src={image}
          alt=""
          width="360"
          height="190"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="course__body">
        <div className="course__metaRow" aria-label={t('courseDetails.meta')}>
          <CourseMeta
            variant="clock"
            icon={clockIcon}
            label={t('courseDetails.duration')}
            value={duration}
          />
          <CourseMeta
            variant="grad"
            icon={studentsIcon}
            label={t('courseDetails.students')}
            value={students}
          />
        </div>
        <h3 className="course__title">{title}</h3>
        <p className="course__desc">{shortDesc}</p>
        <div className="course__bottom">
          <p className="course__price" aria-label={t('courseDetails.priceAria', { price: shownPrice })}>
            {shownPrice}
          </p>
        </div>
      </div>
    </a>
  )
}

export default function CoursesSection() {
  const { t, dir, lang } = useI18n()
  const reduceMotion = useReducedMotion()
  const [items, setItems] = useState([])
  const enter = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, ease: 'easeOut' },
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const featuredData = await getCourses({ lang, page: 1, limit: 6, featured: true })
        const featuredList = Array.isArray(featuredData?.courses) ? featuredData.courses : []
        if (featuredList.length) {
          if (!cancelled) setItems(featuredList)
          return
        }
        const data = await getCourses({ lang, page: 1, limit: 6 })
        const list = Array.isArray(data?.courses) ? data.courses : []
        if (!cancelled) setItems(list)
      } catch (e) {
        console.error(e)
        if (!cancelled) setItems([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [lang])

  const slides = useMemo(() => {
    if (items.length) return items
    // fallback to static demo cards if API is unavailable
    return COURSES.map((c) => ({
      id: c.id,
      title: lang === 'en' ? c.enTitle : c.title,
      shortDesc: lang === 'en' ? c.enDesc : c.desc,
      duration: c.metaLeft,
      students: c.metaRight,
      price: c.price,
      image: c.image,
    }))
  }, [items, lang])

  return (
    <section className="section" id="courses" aria-label={t('home.featuredCourses')}>
      <div className="container">
        <motion.header className="section__header" {...enter}>
          <h2 className="section__title">{t('home.featuredCourses')}</h2>
          <p className="section__subtitle">{t('home.featuredCoursesSub')}</p>
        </motion.header>

        <motion.div className="swiperShell" {...enter} transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}>
          <Swiper
            modules={[ Pagination, Autoplay]}
            key={dir}
            dir={dir}
            slidesPerView={1.1}
            spaceBetween={16}
           
            pagination={{ clickable: true }}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            breakpoints={{
              560: { slidesPerView: 1.6, spaceBetween: 16 },
              768: { slidesPerView: 2.2, spaceBetween: 18 },
              1024: { slidesPerView: 3, spaceBetween: 18 },
              1200: { slidesPerView: 4, spaceBetween: 18 },
            }}
          >
            {slides.map((c) => (
              <SwiperSlide key={c.id}>
                <CourseCard
                  id={c.id}
                  title={c.title}
                  shortDesc={c.shortDesc}
                  duration={c.duration || ''}
                  students={c.students || ''}
                  price={c.price}
                  image={resolveAssetUrl(c.image) || cardHeaderImg}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        <motion.div className="section__footer" {...enter} transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}>
          <motion.a
            className="btn btn--allCourses"
            href="/courses"
            whileHover={reduceMotion ? undefined : { y: -1 }}
            whileTap={reduceMotion ? undefined : { y: 0 }}
          >
            <span>{t('home.browseAll')}</span>
            <svg
              className="btn__icon"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

