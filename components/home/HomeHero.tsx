'use client'

import Link from 'next/link'
import { useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { type Lang } from '@/lib/content'
import { HERO_AR, HERO_EN } from '@/lib/i18n'
import { Reveal } from '@/components/Reveal'
import { TextReveal } from '@/components/TextReveal'

export function HomeHero({ lang }: { lang: Lang }) {
  const hero = lang === 'ar' ? HERO_AR : HERO_EN
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  const isAr = lang === 'ar'

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
      className="relative isolate overflow-hidden bg-brand-900 text-white pt-16 md:pt-24 pb-20 md:pb-28"
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
          {/* Title — large, bold, plain white on the dark navy bg.
              (Previously used grad-text-light but bg-clip:text doesn't
              render on a span containing many inline-block word spans
              from TextReveal — left the title invisible.) */}
          <h1 className="text-4xl md:text-6xl lg:text-[4.2rem] leading-[1.08] tracking-tight text-white">
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
        </div>
      </div>

      {/* Soft fade so the hero blends into the page below. Short and
          subtle — heavy "shadow" was too aggressive. */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-8 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(2,40,58,0) 0%, rgba(247,249,251,0.4) 100%)',
        }}
      />
    </section>
  )
}
