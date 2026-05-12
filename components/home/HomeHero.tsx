'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { type Lang } from '@/lib/content'
import { HERO_AR, HERO_EN, TRUST_BADGES } from '@/lib/i18n'
import { Reveal } from '@/components/Reveal'
import { TextReveal } from '@/components/TextReveal'

const DOCTOR_HEADSHOT = '/uploads/2024/02/DSC08886-1-removebg-preview.png'

export function HomeHero({ lang }: { lang: Lang }) {
  const hero = lang === 'ar' ? HERO_AR : HERO_EN
  const badges = TRUST_BADGES[lang]
  const reduced = useReducedMotion()

  return (
    <section
      className="relative isolate overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #eef5f7 0%, #ffffff 100%)',
      }}
    >
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

          {/* Doctor portrait — bare, no surrounding decoration */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 0.65, 0.32, 1] }}
            className="relative w-full max-w-[460px] mx-auto"
          >
            <Image
              src={DOCTOR_HEADSHOT}
              alt=""
              width={460}
              height={576}
              priority
              className="block w-full h-auto drop-shadow-[0_18px_28px_rgba(0,0,0,0.22)]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
