'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { type Lang } from '@/lib/content'
import { HERO_AR, HERO_EN, TRUST_BADGES } from '@/lib/i18n'
import { Reveal } from '@/components/Reveal'
import { TextReveal } from '@/components/TextReveal'

const HERO_IMG = '/uploads/hero-bg.png'

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
      className="relative isolate overflow-hidden -mt-[80px] md:-mt-[90px] pt-[80px] md:pt-[90px]"
      style={{
        background:
          'radial-gradient(60% 60% at 0% 0%, rgba(8,131,149,0.10), transparent 60%), linear-gradient(180deg,#f1f7f9 0%,#ffffff 60%,#eef5f7 100%)',
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
            'radial-gradient(420px circle at var(--spot-x) var(--spot-y), rgba(8,131,149,.14), rgba(8,131,149,0) 60%)',
        }}
      />
      {/* Floating accent shapes */}
      <span
        aria-hidden
        className="absolute -top-32 end-[-120px] h-[420px] w-[420px] rounded-full bg-brand-500/22 blur-3xl animate-float-a respect-motion"
      />
      <span
        aria-hidden
        className="absolute -bottom-40 start-[-100px] h-[380px] w-[380px] rounded-full bg-brand-600/18 blur-3xl animate-float-b respect-motion"
      />

      <div className="container relative py-12 md:py-16 lg:py-20">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">
          <div className="order-2 lg:order-1">
            <Reveal>
              <p className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/90 backdrop-blur border border-brand-500/15 text-brand-600 text-sm font-semibold shadow-[0_2px_12px_rgba(8,131,149,0.10)]">
                {hero.eyebrow}
              </p>
            </Reveal>
            <h1 className="mt-5 text-4xl md:text-5xl lg:text-[3.4rem] leading-[1.1] tracking-tight">
              <TextReveal text={hero.title} className="grad-text" delay={120} step={55} />
            </h1>
            <p className="mt-6 text-ink-muted text-base md:text-lg max-w-[56ch] leading-relaxed">
              <TextReveal text={hero.lede} delay={500} step={28} offset={10} />
            </p>
            <Reveal delay={240}>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={hero.primaryCta.href} className="btn btn-lg btn-primary">
                  {hero.primaryCta.label}
                </Link>
                <Link href={hero.ghostCta.href} className="btn btn-lg btn-ghost">
                  {hero.ghostCta.label}
                </Link>
              </div>
            </Reveal>
            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 list-none p-0">
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

          {/* Doctor portrait — contained, properly sized */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 0.65, 0.32, 1] }}
            className="order-1 lg:order-2 relative mx-auto w-full max-w-[480px] lg:max-w-[520px] aspect-[4/5] lg:aspect-[5/6]"
          >
            {/* Soft radial glow behind */}
            <span
              aria-hidden
              className="absolute -inset-6 lg:-inset-10 rounded-[40px] bg-[radial-gradient(60%_60%_at_50%_50%,rgba(8,131,149,0.22),rgba(10,77,104,0.08)_55%,transparent_75%)] blur-2xl pointer-events-none"
            />
            <Image
              src={HERO_IMG}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 520px, 90vw"
              className="object-contain object-bottom drop-shadow-[0_24px_42px_rgba(8,18,30,0.18)]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
