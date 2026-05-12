'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { type Lang } from '@/lib/content'

const IMAGES = Array.from({ length: 11 }, (_, i) => `/uploads/2024/03/${i + 1}.jpeg`)

const GoogleG = () => (
  <svg viewBox="0 0 18 18" width="16" height="16" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.08-1.78 2.72v2.26h2.89c1.69-1.56 2.69-3.86 2.69-6.62z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.89-2.26c-.81.54-1.83.86-3.07.86-2.36 0-4.36-1.6-5.07-3.74H.96v2.34A8.997 8.997 0 0 0 9 18z" />
    <path fill="#FBBC05" d="M3.93 10.68c-.18-.54-.28-1.12-.28-1.72s.1-1.18.28-1.72V4.9H.96A8.996 8.996 0 0 0 0 8.96c0 1.45.35 2.82.96 4.06l2.97-2.34z" />
    <path fill="#EA4335" d="M9 3.58c1.33 0 2.52.46 3.46 1.36l2.6-2.6C13.46.89 11.42 0 9 0 5.48 0 2.44 2.02.96 4.96l2.97 2.34C4.64 5.18 6.64 3.58 9 3.58z" />
  </svg>
)

function Star({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11.48 3.5l2.39 4.84 5.34.78c.46.07.65.64.31.97l-3.87 3.77.91 5.32c.08.46-.4.81-.81.59L11 17.26 6.25 19.77c-.41.22-.89-.13-.81-.59l.91-5.32-3.87-3.77c-.33-.33-.15-.9.31-.97l5.34-.78L10.52 3.5c.21-.42.78-.42 1 0z" />
    </svg>
  )
}

function QuoteBadge() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-white" aria-hidden="true">
      <path d="M7 7h4v4H7a2 2 0 0 0-2 2v1H3v-3a4 4 0 0 1 4-4Zm10 0h4v4h-4a2 2 0 0 0-2 2v1h-2v-3a4 4 0 0 1 4-4Z" />
    </svg>
  )
}

export function Testimonials({ lang }: { lang: Lang }) {
  const reduced = useReducedMotion()
  const isAr = lang === 'ar'

  const eyebrow = isAr ? 'تقييمات عملائنا' : 'Patient Testimonials'
  const title = isAr ? 'قصص رؤية واضحة ورعاية متميزة' : 'Stories of Clear Vision & Exceptional Care'
  const lede = isAr
    ? 'يشارك مرضانا تجاربهم في تحسين الرؤية، الرعاية المتخصصة، والثقة الممنوحة لعيادتنا لصحة عيون مدى الحياة.'
    : 'Our patients share their journeys of improved vision, expert care, and the trust they place in our clinic for lifelong eye health.'
  const seeAll = isAr ? 'احجز موعدك' : 'Book your visit'
  const seeAllHref = isAr ? '/book/' : '/en/book/'
  const verifiedLabel = isAr ? 'تقييمات Google موثّقة' : 'Verified Google reviews'
  const ratingLabel = isAr ? 'تقييم المرضى' : 'Patient rating'

  // Pick 3 prominent screenshots for the featured cards; rest stay in the
  // overflow gallery below.
  const featured = [IMAGES[0], IMAGES[1], IMAGES[2]]
  const more = IMAGES.slice(3)

  return (
    <section className="relative isolate overflow-hidden bg-brand-900 text-white">
      {/* Background pattern + glow */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <span
        aria-hidden
        className="absolute -top-32 end-[-160px] h-[520px] w-[520px] rounded-full bg-brand-500/25 blur-3xl pointer-events-none"
      />
      <span
        aria-hidden
        className="absolute -bottom-40 start-[-120px] h-[440px] w-[440px] rounded-full bg-brand-700/40 blur-3xl pointer-events-none"
      />

      <div className="container relative py-20 md:py-28">
        {/* Header row */}
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-end mb-12 md:mb-16">
          <div>
            <motion.span
              initial={reduced ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 text-brand-400 font-semibold text-sm sm:text-base"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-400" />
              {eyebrow}
            </motion.span>
            <motion.h2
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="mt-4 text-white text-4xl md:text-5xl leading-[1.1] tracking-tight max-w-[18ch]"
            >
              {title}
            </motion.h2>
          </div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="lg:pb-2"
          >
            <p className="text-white/75 text-base md:text-lg leading-relaxed mb-6 max-w-md">
              {lede}
            </p>
            <Link
              href={seeAllHref}
              className="inline-flex items-center gap-3 rounded-full bg-brand-500 hover:bg-brand-400 text-white font-semibold py-3 ps-6 pe-2.5 transition-all hover:-translate-y-0.5 shadow-glow"
            >
              <span>{seeAll}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-900/40">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={isAr ? { transform: 'scaleX(-1)' } : undefined}
                >
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Featured 3-up cards */}
        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {featured.map((src, i) => (
            <motion.figure
              key={src}
              initial={reduced ? false : { opacity: 0, y: 24, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 0.65, 0.32, 1] }}
              className="group relative isolate rounded-3xl p-6 sm:p-7 ring-1 ring-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] backdrop-blur-sm hover:ring-brand-400/40 transition-all"
            >
              <span
                aria-hidden
                className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{
                  background:
                    'radial-gradient(50% 60% at 50% 0%, rgba(93,212,212,0.18), transparent 65%)',
                }}
              />
              {/* Stars */}
              <div className="flex gap-1 text-brand-400 mb-5">
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star key={s} />
                ))}
              </div>

              {/* The actual Google review screenshot, framed cleanly */}
              <div className="relative rounded-2xl overflow-hidden bg-white shadow-soft">
                <Image
                  src={src}
                  alt=""
                  width={1280}
                  height={720}
                  sizes="(min-width: 768px) 360px, 100vw"
                  className="block w-full h-auto"
                />
              </div>

              {/* Verified Google footer */}
              <figcaption className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <GoogleG />
                  <span className="text-white">Google</span>
                  <span className="text-white/60">·</span>
                  <span className="text-white/70">{verifiedLabel}</span>
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 shadow-glow">
                  <QuoteBadge />
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        {/* Secondary masonry of remaining reviews — keep them visible but
            subordinate to the 3 featured cards. */}
        {more.length > 0 && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-12 sm:mt-16"
          >
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 text-white/55 text-xs tracking-widest uppercase">
                <span className="h-px w-10 bg-white/20" />
                {isAr ? 'المزيد من التقييمات' : 'More reviews'}
                <span className="h-px w-10 bg-white/20" />
              </span>
            </div>
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
              {more.map((src, i) => (
                <motion.figure
                  key={src}
                  initial={reduced ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                  transition={{ duration: 0.45, delay: (i % 4) * 0.06 }}
                  className="mb-4 break-inside-avoid rounded-2xl overflow-hidden ring-1 ring-white/10 bg-white shadow-soft hover:ring-brand-400/40 transition-all"
                >
                  <Image
                    src={src}
                    alt=""
                    width={1280}
                    height={720}
                    sizes="(min-width: 1024px) 240px, (min-width: 768px) 33vw, 50vw"
                    className="block w-full h-auto"
                  />
                </motion.figure>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bottom rating summary */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mt-12 md:mt-16 flex flex-col items-center text-center gap-3"
        >
          <div className="inline-flex items-center gap-3 rounded-full bg-white/10 ring-1 ring-white/15 px-5 py-2.5 backdrop-blur-sm">
            <GoogleG />
            <span className="font-semibold">5.0</span>
            <span className="flex gap-0.5 text-brand-400">
              {[0, 1, 2, 3, 4].map((s) => (
                <Star key={s} className="!w-3.5 !h-3.5 [&>path]:fill-current" />
              ))}
            </span>
            <span className="text-white/70 text-sm">{ratingLabel}</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
