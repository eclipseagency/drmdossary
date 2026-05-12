'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { type Lang } from '@/lib/content'
import { TextReveal } from '@/components/TextReveal'

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
  const prevLabel = isAr ? 'السابق' : 'Previous'
  const nextLabel = isAr ? 'التالي' : 'Next'

  // Carousel state
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const updateActive = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const slides = track.querySelectorAll<HTMLElement>('[data-slide]')
    if (slides.length === 0) return
    const center = track.scrollLeft + track.clientWidth / 2
    let best = 0
    let bestDelta = Infinity
    slides.forEach((s, i) => {
      // For RTL, browsers report scrollLeft as positive or negative depending
      // on engine — using offsetLeft against the actual track works in both.
      const slideCenter = s.offsetLeft + s.clientWidth / 2 - track.offsetLeft
      const delta = Math.abs(slideCenter - center)
      if (delta < bestDelta) {
        bestDelta = delta
        best = i
      }
    })
    setActive(best)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(updateActive)
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    updateActive()
    return () => track.removeEventListener('scroll', onScroll)
  }, [updateActive])

  function scrollByCards(direction: 1 | -1) {
    const track = trackRef.current
    if (!track) return
    const first = track.querySelector<HTMLElement>('[data-slide]')
    if (!first) return
    // Slide width plus the visible gap between slides.
    const styles = window.getComputedStyle(track)
    const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0
    const step = first.clientWidth + gap
    const dir = isAr ? -direction : direction
    track.scrollBy({ left: dir * step, behavior: reduced ? 'auto' : 'smooth' })
  }

  function scrollToIndex(i: number) {
    const track = trackRef.current
    if (!track) return
    const slide = track.querySelectorAll<HTMLElement>('[data-slide]')[i]
    if (!slide) return
    track.scrollTo({
      left: slide.offsetLeft - track.offsetLeft - (track.clientWidth - slide.clientWidth) / 2,
      behavior: reduced ? 'auto' : 'smooth',
    })
  }

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
            <h2 className="mt-4 text-white text-4xl md:text-5xl leading-[1.1] tracking-tight max-w-[18ch]">
              <TextReveal text={title} step={55} />
            </h2>
          </div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="lg:pb-2"
          >
            <p className="text-white/75 text-base md:text-lg leading-relaxed mb-6 max-w-md">
              <TextReveal text={lede} delay={400} step={22} offset={10} />
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

        {/* Carousel of all reviews */}
        <div className="relative">
          <div
            ref={trackRef}
            className="flex gap-5 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-6 -mx-4 px-4 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            tabIndex={0}
            aria-label={isAr ? 'تقييمات المرضى' : 'Patient reviews'}
          >
            {IMAGES.map((src, i) => (
              <motion.figure
                key={src}
                data-slide
                initial={reduced ? false : { opacity: 0, y: 24, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.06, ease: [0.22, 0.65, 0.32, 1] }}
                className="group relative isolate flex-none basis-[85%] sm:basis-[55%] md:basis-[44%] lg:basis-[31%] snap-center rounded-3xl p-6 sm:p-7 ring-1 ring-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] backdrop-blur-sm hover:ring-brand-400/40 transition-all"
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

                {/* The actual Google review screenshot */}
                <div className="relative rounded-2xl overflow-hidden bg-white shadow-soft">
                  <Image
                    src={src}
                    alt=""
                    width={1280}
                    height={720}
                    sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 85vw"
                    className="block w-full h-auto"
                  />
                </div>

                {/* Verified Google footer */}
                <figcaption className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <GoogleG />
                    <span className="text-white">Google</span>
                    <span className="text-white/60">·</span>
                    <span className="text-white/70 hidden sm:inline">{verifiedLabel}</span>
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 shadow-glow">
                    <QuoteBadge />
                  </span>
                </figcaption>
              </motion.figure>
            ))}
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-white/70 text-sm">
              <span className="font-semibold text-white tabular-nums">
                {String(active + 1).padStart(2, '0')}
              </span>
              <span>/</span>
              <span className="tabular-nums">{String(IMAGES.length).padStart(2, '0')}</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Pagination dots — compact for 11 items */}
              <div className="hidden sm:flex items-center gap-1.5" role="tablist" aria-label={isAr ? 'مؤشر التقييمات' : 'Reviews indicator'}>
                {IMAGES.map((_, i) => (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={active === i}
                    aria-label={`${i + 1}`}
                    onClick={() => scrollToIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      active === i ? 'w-6 bg-brand-400' : 'w-1.5 bg-white/25 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>

              {/* Prev / Next */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={prevLabel}
                  onClick={() => scrollByCards(-1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 hover:bg-white/20 hover:ring-white/30 transition-all"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isAr ? 'scaleX(1)' : 'scaleX(-1)' }}>
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label={nextLabel}
                  onClick={() => scrollByCards(1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 hover:bg-brand-400 shadow-glow transition-all"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isAr ? 'scaleX(-1)' : 'scaleX(1)' }}>
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

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
                <Star key={s} className="!w-3.5 !h-3.5" />
              ))}
            </span>
            <span className="text-white/70 text-sm">{ratingLabel}</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
