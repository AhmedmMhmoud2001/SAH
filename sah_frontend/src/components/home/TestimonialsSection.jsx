import avatar1 from '../../assets/img_home/Container.png'
import avatar2 from '../../assets/img_home/Container (1).png'
import avatar3 from '../../assets/img_home/Container (2).png'
import { useI18n } from '../../i18n/I18nProvider.jsx'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { motion, useReducedMotion } from 'framer-motion'
import { resolveAssetUrl } from '../../api/index.js'

const TESTIMONIALS = [
  {
    name: 'عبدالله محمود',
    rating: 5,
    role: 'مدير جديد',
    text: 'أفضل منصة تعليمية في مجال المحاسبة، المحتوى عملي والشهادة أضافت قيمة كبيرة لمسيرتي الذاتية.',
    avatar: avatar1,
  },
  {
    name: 'سارة علي',
    rating: 5,
    role: 'محاسبة',
    text: 'شرح واضح وأمثلة عملية. قدرت أطبق اللي اتعلمته مباشرة في شغلي.',
    avatar: avatar2,
  },
  {
    name: 'محمد حسن',
    rating: 5,
    role: 'محلل مالي',
    text: 'تنظيم ممتاز ودعم سريع. المحتوى محدث وسهل المتابعة خطوة بخطوة.',
    avatar: avatar3,
  },
  {
    name: 'ريم الحربي',
    rating: 5,
    role: 'صاحبة مشروع',
    text: 'الدورات ساعدتني أفهم التقارير المالية وأحسّن قراراتي في إدارة المشروع.',
    avatar: avatar1,
  },
  {
    name: 'أحمد سالم',
    rating: 5,
    role: 'مدقق مبتدئ',
    text: 'محتوى قوي وتمارين مفيدة، فرق معايا جدًا في فهم القيود والتسويات.',
    avatar: avatar2,
  },
]

function Stars({ value }) {
  const { t } = useI18n()
  const full = Math.max(0, Math.min(5, value))
  return (
    <div className="stars" aria-label={t('home.ratingAria', { value: full })}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < full ? 'star star--on' : 'star'}>
          ★
        </span>
      ))}
    </div>
  )
}

function TestimonialCard({ name, role, text, rating, avatar }) {
  return (
    <article className="testimonial">
      <div className="testimonial__stars">
        <Stars value={rating} />
      </div>

      <p className="testimonial__text">{text}</p>

      <div className="testimonial__footer">
       
        <img
          className="testimonial__avatar"
          src={avatar}
          alt=""
          width="44"
          height="44"
          loading="lazy"
          decoding="async"
        />
         <div className="testimonial__who">
          <p className="testimonial__name">{name}</p>
          <p className="testimonial__role">{role}</p>
        </div>
      </div>
    </article>
  )
}

export default function TestimonialsSection({ items }) {
  const { t, lang, dir } = useI18n()
  const reduceMotion = useReducedMotion()
  const enter = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, ease: 'easeOut' },
  }
  const fallbackItems =
    lang === 'en'
      ? [
          {
            name: 'Abdullah Mahmoud',
            rating: 5,
            role: 'New manager',
            text:
              'The best platform for accounting. Practical content and the certificate added real value to my profile.',
            avatar: avatar1,
          },
          {
            name: 'Sara Ali',
            rating: 5,
            role: 'Accountant',
            text:
              'Clear explanations and great examples. I was able to apply what I learned right away.',
            avatar: avatar2,
          },
          {
            name: 'Mohammed Hassan',
            rating: 5,
            role: 'Finance analyst',
            text:
              'Excellent structure and support. The course materials are updated and easy to follow.',
            avatar: avatar3,
          },
          {
            name: 'Reem Alharbi',
            rating: 5,
            role: 'Business owner',
            text:
              'The courses helped me understand financial reports and improve decision-making for my business.',
            avatar: avatar1,
          },
          {
            name: 'Ahmed Salem',
            rating: 5,
            role: 'Junior auditor',
            text:
              'Strong content with useful practice. It really improved my understanding of entries and adjustments.',
            avatar: avatar2,
          },
        ]
      : TESTIMONIALS

  const list = Array.isArray(items) && items.length
    ? items.map((it, idx) => ({
        name: it?.name || '',
        role: it?.role || '',
        text: it?.text || '',
        rating: Number(it?.rating || 5),
        avatar: it?.avatarUrl ? resolveAssetUrl(it.avatarUrl) : (fallbackItems[idx % fallbackItems.length]?.avatar || avatar1),
      })).filter((x) => x.name || x.text || x.role)
    : fallbackItems

  return (
    <section className="section" aria-label={t('home.testimonialsTitle')}>
      <div className="container">
        <motion.header className="section__header" {...enter}>
          <h2 className="section__title">{t('home.testimonialsTitle')}</h2>
          <p className="section__subtitle">{t('home.testimonialsSub')}</p>
        </motion.header>

        <motion.div className="swiperShell swiperShell--testimonials" {...enter} transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}>
          <Swiper
            modules={[ Pagination, Autoplay]}
            key={dir}
            dir={dir}
            slidesPerView={1.05}
            spaceBetween={16}
           
            pagination={{ clickable: true }}
            autoplay={{ delay: 4200, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 1.3, spaceBetween: 16 },
              768: { slidesPerView: 2, spaceBetween: 18 },
              1100: { slidesPerView: 3, spaceBetween: 18 },
            }}
          >
            {list.map((item, idx) => (
              <SwiperSlide key={`${item.name}-${idx}`}>
                <TestimonialCard {...item} />
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>
    </section>
  )
}

