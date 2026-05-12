'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { type Lang } from '@/lib/content'
import { HERO_AR, HERO_EN, TRUST_BADGES } from '@/lib/i18n'
import { TiltCard } from '@/components/TiltCard'
import { Reveal } from '@/components/Reveal'
import { TextReveal } from '@/components/TextReveal'

const DOCTOR_HEADSHOT = '/uploads/2024/02/DSC08886-1-removebg-preview.png'

export function HomeHero({ lang }: { lang: Lang }) {
  const hero = lang === 'ar' ? HERO_AR : HERO_EN
  const badges = TRUST_BADGES[lang]
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced || !ref.current) return
    let raf = 0
    const el = ref.current
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = ((e.clientX - r.left) / r.width) * 100
      const y = ((e.clientY - r.top) / r.height) * 100
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--spot-x', `${x}%`)
        el.style.setProperty('--spot-y', `${y}%`)
      })
    }
    el.addEventListener('pointermove', onMove, { passive: true })
    return () => el.removeEventListener('pointermove', onMove)
  }, [reduced])

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #eef5f7 0%, #ffffff 100%)',
        ['--spot-x' as string]: '50%',
        ['--spot-y' as string]: '40%',
      }}
    >
      {/* Cursor spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-[background] duration-[80ms] respect-motion"
        style={{
          background:
            'radial-gradient(420px circle at var(--spot-x) var(--spot-y), rgba(8,131,149,.18), rgba(8,131,149,0) 60%)',
        }}
      />
      {/* Floating shapes */}
      <span
        aria-hidden
        className="absolute -top-40 end-[-120px] h-[520px] w-[520px] rounded-full bg-brand-500/35 blur-3xl animate-float-a respect-motion"
      />
      <span
        aria-hidden
        className="absolute -bottom-44 start-[-100px] h-[460px] w-[460px] rounded-full bg-brand-600/30 blur-3xl animate-float-b respect-motion"
      />
      <span
        aria-hidden
        className="hidden md:block absolute top-[40%] start-[38%] h-[320px] w-[320px] rounded-full bg-brand-400/35 blur-3xl animate-float-c respect-motion"
      />
      {/* Subtle noise */}
      <span aria-hidden className="absolute inset-0 bg-noise opacity-[0.035] mix-blend-multiply pointer-events-none" />

      <div className="container relative py-16 md:py-24 lg:py-28">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center">
          <div>
            <Reveal>
              <p className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/80 backdrop-blur border border-brand-500/15 text-brand-600 text-sm font-semibold shadow-[0_2px_12px_rgba(8,131,149,0.10)]">
                {hero.eyebrow}
              </p>
            </Reveal>
            <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-brand-900">
              <TextReveal text={hero.title} delay={120} step={55} />
            </h1>
            <p className="mt-6 text-ink-muted text-base md:text-lg max-w-[56ch] leading-relaxed">
              <TextReveal text={hero.lede} delay={500} step={22} offset={10} />
            </p>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={hero.primaryCta.href} className="btn btn-lg btn-primary">
                  {hero.primaryCta.label}
                </Link>
                <Link href={hero.ghostCta.href} className="btn btn-lg btn-ghost">
                  {hero.ghostCta.label}
                </Link>
              </div>
            </Reveal>
            <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 list-none p-0">
              {badges.map((b, i) => (
                <Reveal as="li" key={b} delay={300 + i * 80} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 shadow-ring">
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="#088395" strokeWidth="2.5">
                      <path d="M3.5 8.5l3 3 6-6" />
                    </svg>
                  </span>
                  <span className="text-[15px] font-medium text-ink">{b}</span>
                </Reveal>
              ))}
            </ul>
          </div>

          {/* Doctor card — 3D layered stack */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 0.65, 0.32, 1] }}
            className="relative w-full max-w-[380px] mx-auto"
            style={{ perspective: 1400 }}
          >
            {/* Outer glow */}
            <span
              aria-hidden
              className="absolute -inset-y-10 -inset-x-8 rounded-[40px] bg-[radial-gradient(60%_60%_at_50%_60%,rgba(8,131,149,.45),rgba(10,77,104,.15)_50%,transparent_75%)] blur-2xl pointer-events-none"
            />
            <TiltCard
              isRTL={lang === 'ar'}
              className="group relative aspect-[4/5] animate-doctor-float respect-motion"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Conic ring */}
              <span
                aria-hidden
                className="absolute inset-0 rounded-[30px] bg-gradient-ring animate-ring-spin respect-motion"
                style={{
                  WebkitMask:
                    'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                  mask:
                    'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  padding: 2,
                }}
              />
              {/* Front frame */}
              <div className="absolute inset-0 rounded-[30px] overflow-hidden bg-gradient-brand-soft shadow-lift ring-1 ring-white/15 flex items-end justify-center">
                <span
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 0%, rgba(255,255,255,.18), transparent 60%), radial-gradient(circle at 50% 110%, rgba(255,255,255,.22), transparent 55%)',
                  }}
                />
                <Image
                  src={DOCTOR_HEADSHOT}
                  alt=""
                  width={460}
                  height={576}
                  priority
                  className="relative h-full w-full object-contain object-bottom drop-shadow-[0_18px_28px_rgba(0,0,0,0.22)]"
                />
              </div>
            </TiltCard>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
