'use client'

import { type ReactNode } from 'react'
import { Reveal } from './Reveal'
import { TextReveal } from './TextReveal'

/**
 * Inner-page hero. Matches the home hero's dark-navy aesthetic for
 * visual consistency across the site:
 *   * brand-900 background
 *   * faint chevron + dot textures
 *   * two soft blurred accent glows
 *   * centered single-column content (eyebrow + h1 + lede + CTAs)
 *
 * No side image — every inner page should look like the others.
 */
export function PageHero({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow?: string
  title: string
  lede?: string
  /** ignored — kept for backward compatibility with existing callers */
  image?: string
  imageAlt?: string
  children?: ReactNode
}) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-900 text-white -mt-[80px] md:-mt-[90px] pt-[120px] md:pt-[140px] pb-14 md:pb-20">
      {/* Chevron texture */}
      <span
        aria-hidden
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='20' viewBox='0 0 40 20'><path d='M0 20 L20 0 L40 20' fill='none' stroke='%23ffffff' stroke-width='1' opacity='0.5'/></svg>\")",
        }}
      />
      {/* Dot texture */}
      <span
        aria-hidden
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Floating accent glows */}
      <span
        aria-hidden
        className="absolute -top-32 end-[-140px] h-[420px] w-[420px] rounded-full bg-brand-500/25 blur-3xl animate-float-a respect-motion"
      />
      <span
        aria-hidden
        className="absolute -bottom-40 start-[-120px] h-[380px] w-[380px] rounded-full bg-brand-700/40 blur-3xl animate-float-b respect-motion"
      />

      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center">
          {eyebrow && (
            <Reveal>
              <p className="inline-block px-4 py-1.5 rounded-full bg-white/[0.08] ring-1 ring-white/15 backdrop-blur-sm text-white text-sm font-semibold">
                {eyebrow}
              </p>
            </Reveal>
          )}
          <h1 className="mt-4 text-3xl md:text-5xl text-white leading-tight">
            <TextReveal text={title} delay={120} step={55} />
          </h1>
          {lede && (
            <p className="mt-5 text-white/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              <TextReveal text={lede} delay={500} step={22} offset={10} />
            </p>
          )}
          {children && (
            <Reveal delay={240}>
              <div className="mt-7 flex flex-wrap justify-center gap-3">{children}</div>
            </Reveal>
          )}
        </div>
      </div>

      {/* Bottom fade so the hero blends into the next section */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(2,40,58,0) 0%, rgba(255,255,255,1) 100%)',
        }}
      />
    </section>
  )
}
