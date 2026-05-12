import Link from 'next/link'
import Image from 'next/image'
import { type Lang } from '@/lib/content'
import { SERVICES, T } from '@/lib/i18n'
import { PageHero } from './PageHero'
import { Breadcrumbs } from './Breadcrumbs'
import { CTABand } from './CTABand'
import { Reveal } from './Reveal'
import { TiltCard } from './TiltCard'

export function ServicesIndex({ lang }: { lang: Lang }) {
  const services = SERVICES[lang]
  const isAr = lang === 'ar'
  const t = T[lang]
  const title = isAr ? 'الخدمات' : 'Services'
  const lede = isAr
    ? 'تقدم العيادة مجموعة شاملة من الخدمات المتخصصة في طب وجراحة العيون باستخدام أحدث التقنيات وأكثرها تطورًا.'
    : 'A complete range of specialised ophthalmology services using the latest, most advanced technology.'
  const more = t.learnMore
  const bookUrl = isAr ? '/book/' : '/en/book/'

  return (
    <>
      <PageHero eyebrow={isAr ? 'تخصصاتنا' : 'Specialties'} title={title} lede={lede}>
        <Link href={bookUrl} className="btn btn-lg btn-light">
          {t.bookNow}
        </Link>
      </PageHero>
      <Breadcrumbs lang={lang} items={[{ label: title }]} />

      <section className="py-16 md:py-20 bg-white">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: 1400 }}>
            {services.map((s, i) => (
              <Reveal key={s.href} delay={i * 100}>
                <TiltCard isRTL={isAr} max={5} className="h-full rounded-2xl">
                  <Link
                    href={s.href}
                    className="group block h-full p-8 rounded-2xl bg-white border border-surface-edge shadow-soft hover:shadow-lift hover:border-brand-400/40 transition-all duration-300"
                  >
                    <span className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50 transition-transform duration-300 group-hover:scale-110">
                      <Image src={s.icon} alt="" width={48} height={48} className="h-12 w-12 object-contain" />
                    </span>
                    <h3 className="text-2xl text-brand-900 mb-3 leading-tight">{s.name}</h3>
                    <p className="text-ink-muted m-0 mb-5 leading-relaxed">{s.desc}</p>
                    <span className="inline-flex items-center gap-1.5 font-bold text-brand-600">
                      {more}
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
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      >
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTABand lang={lang} />
    </>
  )
}
