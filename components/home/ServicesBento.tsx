import Link from 'next/link'
import Image from 'next/image'
import { type Lang } from '@/lib/content'
import { SERVICES, T } from '@/lib/i18n'
import { Reveal } from '@/components/Reveal'
import { TextReveal } from '@/components/TextReveal'

export function ServicesBento({ lang }: { lang: Lang }) {
  const services = SERVICES[lang]
  const isAr = lang === 'ar'
  const t = T[lang]
  const eyebrow = isAr ? 'خدماتنا' : 'Our Services'
  const title = isAr ? 'خدماتنا الطبية' : 'Our Services'
  const lede = isAr
    ? 'رعاية شاملة في طب وجراحة العيون مصممة لاحتياجاتك البصرية.'
    : 'Comprehensive ophthalmology care tailored to your vision needs.'
  const bookLabel = isAr ? 'احجز موعدك' : 'Book Consultation'
  const tagline = isAr ? 'رؤيتك أولويتنا.' : 'Your vision is our priority.'
  const bookHref = isAr ? '/book/' : '/en/book/'

  return (
    <section className="relative py-20 md:py-28 bg-white overflow-hidden">
      {/* Soft top-corner glow */}
      <span
        aria-hidden
        className="absolute -top-32 start-[-160px] h-[420px] w-[420px] rounded-full bg-brand-500/8 blur-3xl pointer-events-none"
      />
      <span
        aria-hidden
        className="absolute -bottom-32 end-[-160px] h-[420px] w-[420px] rounded-full bg-brand-600/8 blur-3xl pointer-events-none"
      />

      <div className="container relative">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-14 md:mb-16">
          <Reveal>
            <p className="inline-flex items-center gap-2 text-brand-500 font-semibold text-sm tracking-wider uppercase mb-3">
              <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
              {eyebrow}
              <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
            </p>
          </Reveal>
          <h2 className="text-4xl md:text-5xl text-brand-900 mb-3 leading-tight">
            <TextReveal text={title} step={50} />
          </h2>
          <span
            aria-hidden
            className="block w-12 h-[3px] rounded-full bg-brand-500 mx-auto mb-5"
          />
          <p className="text-ink-muted text-base md:text-lg m-0">
            <TextReveal text={lede} delay={200} step={22} offset={10} />
          </p>
        </div>

        {/* Service cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
          {services.map((s, i) => (
            <Reveal key={s.href} delay={i * 100}>
              <Link
                href={s.href}
                className="
                  group relative block h-full rounded-2xl
                  bg-[linear-gradient(180deg,#ffffff_0%,#f6f9fb_100%)]
                  border border-surface-edge
                  px-7 py-8
                  shadow-[0_2px_8px_rgba(8,18,30,0.04)]
                  hover:shadow-[0_18px_36px_rgba(8,18,30,0.10)]
                  hover:-translate-y-1
                  hover:border-brand-400/40
                  transition-all duration-300
                "
              >
                <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 ring-1 ring-brand-500/15 transition-colors group-hover:bg-brand-100">
                  <Image
                    src={s.icon}
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                  />
                </span>
                <h3 className="text-xl md:text-[1.35rem] leading-snug text-brand-900 mb-3">
                  {s.name}
                </h3>
                <span
                  aria-hidden
                  className="block w-10 h-[2px] rounded-full bg-brand-500/40 mb-4 transition-all group-hover:bg-brand-500 group-hover:w-16"
                />
                <p className="text-[15px] leading-relaxed text-ink-muted m-0">
                  {s.desc}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* Bottom CTA + tagline */}
        <div className="mt-14 md:mt-16 flex flex-col items-center text-center gap-4">
          <span
            aria-hidden
            className="flex items-center justify-center gap-3 w-full max-w-md"
          >
            <span className="flex-1 h-px bg-surface-edge" />
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="#088395"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="flex-1 h-px bg-surface-edge" />
          </span>
          <Reveal delay={120}>
            <Link
              href={bookHref}
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3.5 text-[15px] shadow-[0_8px_24px_rgba(8,131,149,0.30)] transition-all hover:-translate-y-0.5"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span>{bookLabel}</span>
            </Link>
          </Reveal>
          <p className="text-ink-muted text-sm m-0 mt-1">{tagline}</p>
        </div>
      </div>
    </section>
  )
}
