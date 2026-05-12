import Link from 'next/link'
import Image from 'next/image'
import { type Lang } from '@/lib/content'
import { SERVICES } from '@/lib/i18n'
import { Reveal } from '@/components/Reveal'
import { TextReveal } from '@/components/TextReveal'
import { TiltCard } from '@/components/TiltCard'

const FEATURE_BG = '/uploads/2024/03/bg.jpg'

export function ServicesBento({ lang }: { lang: Lang }) {
  const services = SERVICES[lang]
  const isAr = lang === 'ar'
  const eyebrow = isAr ? 'تخصصات' : 'Specialties'
  const title = isAr ? 'خدماتنا' : 'Our Services'
  const lede = isAr
    ? 'مجموعة شاملة من الخدمات المتخصصة في طب وجراحة العيون بأحدث التقنيات.'
    : 'A complete range of specialised ophthalmology services using the latest technology.'
  const more = isAr ? 'اعرف المزيد' : 'Learn more'

  // 3 variants for visual variety
  const variants = ['feature', 'accent', 'primary'] as const

  return (
    <section className="relative py-16 md:py-24 bg-surface-soft">
      <div className="container">
        <div className="max-w-2xl mb-10 md:mb-12">
          <Reveal>
            <span className="eyebrow-pill mb-4">{eyebrow}</span>
          </Reveal>
          <h2 className="text-3xl md:text-4xl text-brand-900 mb-3">
            <TextReveal text={title} step={50} />
          </h2>
          <p className="text-ink-muted text-lg m-0">
            <TextReveal text={lede} delay={200} step={22} offset={10} />
          </p>
        </div>

        <div
          className="grid gap-4 md:gap-5 lg:grid-cols-[1.25fr_1fr] lg:grid-rows-2 lg:min-h-[580px]"
          style={{ perspective: 1400 }}
        >
          {services.map((s, idx) => {
            const v = variants[idx] ?? 'accent'
            const isFeature = v === 'feature'
            const cls = [
              'group relative isolate overflow-hidden rounded-[24px]',
              'bg-white border border-surface-edge shadow-soft hover:shadow-lift transition-shadow',
              isFeature ? 'lg:row-span-2 lg:col-start-1' : '',
              v === 'accent' ? 'lg:col-start-2 lg:row-start-1' : '',
              v === 'primary' ? 'lg:col-start-2 lg:row-start-2' : '',
            ].join(' ')

            return (
              <Reveal key={s.href} delay={idx * 100}>
                <TiltCard isRTL={isAr} className={cls}>
                  <Link href={s.href} className="block h-full">
                    {isFeature && (
                      <Image
                        src={FEATURE_BG}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 60vw, 100vw"
                        className="absolute inset-0 z-0 object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    {/* Overlay */}
                    <span
                      aria-hidden
                      className="absolute inset-0 z-[1] pointer-events-none"
                      style={{
                        background: isFeature
                          ? 'linear-gradient(180deg, rgba(2,40,58,.25) 0%, rgba(2,40,58,.85) 70%, rgba(2,40,58,.94) 100%), radial-gradient(70% 60% at 20% 10%, rgba(93,212,212,.30), transparent 60%)'
                          : v === 'accent'
                          ? 'radial-gradient(60% 50% at 100% 0%, rgba(93,212,212,.18), transparent 60%), radial-gradient(60% 50% at 0% 100%, rgba(8,131,149,.10), transparent 60%)'
                          : 'radial-gradient(70% 60% at 0% 0%, rgba(8,131,149,.18), transparent 60%), radial-gradient(60% 50% at 100% 100%, rgba(10,77,104,.10), transparent 60%)',
                      }}
                    />

                    <div className="relative z-[2] flex h-full flex-col gap-3 p-7 md:p-8">
                      <span className="relative inline-flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-white/95 shadow-[0_6px_16px_rgba(8,131,149,.18)] ring-1 ring-brand-500/10 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-2">
                        <span
                          aria-hidden
                          className="absolute -inset-2.5 -z-10 rounded-[28px] bg-[radial-gradient(circle,rgba(93,212,212,0.55),rgba(93,212,212,0)_60%)] blur-md opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110"
                        />
                        <Image src={s.icon} alt="" width={40} height={40} className="h-10 w-10 object-contain" />
                      </span>
                      <h3
                        className={
                          isFeature
                            ? 'mt-2 text-2xl md:text-3xl text-white max-w-[30ch] drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]'
                            : 'mt-2 text-xl md:text-2xl text-brand-900'
                        }
                      >
                        {s.name}
                      </h3>
                      <p
                        className={
                          isFeature
                            ? 'text-white/85 max-w-[36ch] text-[15px] leading-relaxed flex-grow'
                            : 'text-ink-muted text-[15px] leading-relaxed flex-grow'
                        }
                      >
                        {s.desc}
                      </p>
                      <span
                        className={
                          isFeature
                            ? 'inline-flex items-center gap-2 mt-auto font-bold text-white'
                            : 'inline-flex items-center gap-2 mt-auto font-bold text-brand-600'
                        }
                      >
                        <span>{more}</span>
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={
                            'transition-transform duration-200 group-hover:translate-x-1 ' +
                            (isAr ? 'rtl:-scale-x-100 rtl:group-hover:-translate-x-1 rtl:group-hover:translate-x-0' : '')
                          }
                          style={isAr ? { transform: 'scaleX(-1)' } : undefined}
                        >
                          <path d="M5 12h14M13 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </TiltCard>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
