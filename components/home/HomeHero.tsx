'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { type Lang } from '@/lib/content'
import { HERO_AR, HERO_EN, TRUST_BADGES } from '@/lib/i18n'
import { Reveal } from '@/components/Reveal'
import { TextReveal } from '@/components/TextReveal'

export function HomeHero({ lang }: { lang: Lang }) {
  const hero = lang === 'ar' ? HERO_AR : HERO_EN
  const badges = TRUST_BADGES[lang]
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  const isAr = lang === 'ar'
  const microPill = isAr ? 'استشاري ذو خبرة' : 'Trusted Specialist'

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
      className="relative isolate overflow-hidden bg-brand-900 text-white -mt-[80px] md:-mt-[90px] pt-[140px] md:pt-[160px] pb-20 md:pb-28"
      style={{
        ['--spot-x' as string]: '50%',
        ['--spot-y' as string]: '40%',
      }}
    >
      {/* Chevron texture */}
      <span
        aria-hidden
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='20' viewBox='0 0 40 20'><path d='M0 20 L20 0 L40 20' fill='none' stroke='%23ffffff' stroke-width='1' opacity='0.5'/></svg>\")",
        }}
      />
      {/* Dotted texture mid-screen */}
      <span
        aria-hidden
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Cursor spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-[background] duration-[80ms] respect-motion"
        style={{
          background:
            'radial-gradient(520px circle at var(--spot-x) var(--spot-y), rgba(8,131,149,.32), rgba(8,131,149,0) 60%)',
        }}
      />
      {/* Floating accent glows */}
      <span
        aria-hidden
        className="absolute -top-32 end-[-160px] h-[520px] w-[520px] rounded-full bg-brand-500/30 blur-3xl animate-float-a respect-motion"
      />
      <span
        aria-hidden
        className="absolute -bottom-40 start-[-120px] h-[460px] w-[460px] rounded-full bg-brand-700/45 blur-3xl animate-float-b respect-motion"
      />

      <div className="container relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Top trust pill */}
          <Reveal>
            <p className="inline-flex items-center gap-2.5 ps-2 pe-4 py-2 rounded-full bg-white/[0.08] ring-1 ring-white/15 backdrop-blur-sm text-white text-sm font-semibold">
              <span
                aria-hidden
                className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 shadow-glow"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <span>{microPill}</span>
            </p>
          </Reveal>

          {/* Eyebrow */}
          <Reveal delay={60}>
            <p className="mt-6 text-brand-400 font-semibold text-sm tracking-wider uppercase">
              {hero.eyebrow}
            </p>
          </Reveal>

          {/* Title — large, bold, plain white on the dark navy bg.
              (Previously used grad-text-light but bg-clip:text doesn't
              render on a span containing many inline-block word spans
              from TextReveal — left the title invisible.) */}
          <h1 className="mt-3 text-4xl md:text-6xl lg:text-[4.2rem] leading-[1.08] tracking-tight text-white">
            <TextReveal text={hero.title} delay={120} step={55} />
          </h1>

          {/* Lede */}
          <p className="mt-7 text-white/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            <TextReveal text={hero.lede} delay={500} step={28} offset={10} />
          </p>

          {/* CTAs */}
          <Reveal delay={240}>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                href={hero.primaryCta.href}
                className="inline-flex items-center gap-3 rounded-full bg-brand-500 hover:bg-brand-400 text-white font-bold py-3.5 ps-6 pe-2 text-[15px] shadow-[0_8px_24px_rgba(8,131,149,0.40)] transition-all hover:-translate-y-0.5"
              >
                <span>{hero.primaryCta.label}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-900/40">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={isAr ? { transform: 'scaleX(-1)' } : undefined}>
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
              <Link
                href={hero.ghostCta.href}
                className="inline-flex items-center gap-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] ring-1 ring-white/15 text-white font-bold py-3.5 px-6 text-[15px] transition-all hover:-translate-y-0.5"
              >
                <span>{hero.ghostCta.label}</span>
              </Link>
            </div>
          </Reveal>

          {/* Trust-badge chips */}
          <ul className="mt-10 flex flex-wrap justify-center gap-2.5 list-none p-0">
            {badges.map((b, i) => (
              <Reveal as="li" key={b} delay={320 + i * 80}>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] ring-1 ring-white/10 text-white/85 text-[13.5px] font-semibold px-3.5 py-2">
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="#5DD4D4" strokeWidth="2.5" aria-hidden>
                    <path d="M3.5 8.5l3 3 6-6" />
                  </svg>
                  <span>{b}</span>
                </span>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>

      {/* Soft fade so the hero blends into the page below */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(2,40,58,0) 0%, rgba(247,249,251,1) 100%)',
        }}
      />
    </section>
  )
}
