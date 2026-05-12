'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { type Lang } from '@/lib/content'

const IMAGES = Array.from({ length: 11 }, (_, i) => `/uploads/2024/03/${i + 1}.jpeg`)

const GoogleG = () => (
  <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.08-1.78 2.72v2.26h2.89c1.69-1.56 2.69-3.86 2.69-6.62z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.89-2.26c-.81.54-1.83.86-3.07.86-2.36 0-4.36-1.6-5.07-3.74H.96v2.34A8.997 8.997 0 0 0 9 18z" />
    <path fill="#FBBC05" d="M3.93 10.68c-.18-.54-.28-1.12-.28-1.72s.1-1.18.28-1.72V4.9H.96A8.996 8.996 0 0 0 0 8.96c0 1.45.35 2.82.96 4.06l2.97-2.34z" />
    <path fill="#EA4335" d="M9 3.58c1.33 0 2.52.46 3.46 1.36l2.6-2.6C13.46.89 11.42 0 9 0 5.48 0 2.44 2.02.96 4.96l2.97 2.34C4.64 5.18 6.64 3.58 9 3.58z" />
  </svg>
)

export function Testimonials({ lang }: { lang: Lang }) {
  const reduced = useReducedMotion()
  const isAr = lang === 'ar'
  const eyebrow = isAr ? 'تقييمات Google' : 'Google reviews'
  const title = isAr ? 'ثقة مرضانا' : 'Patient stories'
  const lede = isAr
    ? 'قصص حقيقية من مرضى استعادوا رؤيتهم وثقتهم بأنفسهم.'
    : 'Real stories from patients who regained their vision and confidence.'

  return (
    <section className="relative py-16 md:py-24 overflow-hidden isolate">
      {/* Soft section glow */}
      <span
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(8,131,149,0.18), transparent 70%), radial-gradient(ellipse 80% 60% at 50% 100%, rgba(10,77,104,0.10), transparent 70%), linear-gradient(180deg, #f7f9fb 0%, #ffffff 100%)',
        }}
      />
      <div className="container relative">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <motion.span
            initial={reduced ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-white border border-surface-edge shadow-soft text-brand-900 font-semibold text-sm"
          >
            <GoogleG />
            <span>{eyebrow}</span>
          </motion.span>
          <motion.h2
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-3xl md:text-4xl text-brand-900 mb-3"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="text-ink-muted text-lg m-0"
          >
            {lede}
          </motion.p>
        </div>

        {/* Masonry via CSS columns — preserves the natural aspect of each
            Google-review screenshot. */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
          {IMAGES.map((src, i) => (
            <motion.figure
              key={src}
              initial={reduced ? false : { opacity: 0, y: 22, scale: 0.985 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{
                duration: 0.55,
                delay: (i % 6) * 0.08,
                ease: [0.22, 0.65, 0.32, 1],
              }}
              className="mb-5 break-inside-avoid rounded-2xl overflow-hidden bg-white shadow-soft hover:shadow-lift transition-shadow"
            >
              <Image
                src={src}
                alt=""
                width={1280}
                height={720}
                sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                className="block w-full h-auto"
              />
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}
