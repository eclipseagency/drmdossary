import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getPage, type Lang } from '@/lib/content'
import { SERVICES, T } from '@/lib/i18n'
import { PageHero } from './PageHero'
import { Breadcrumbs } from './Breadcrumbs'
import { CTABand } from './CTABand'
import { Reveal } from './Reveal'

const HERO_IMG: Record<string, string> = {
  '/corneal-surgeries/': '/uploads/2024/02/Group-12.png',
  '/treatment-of-cataracts/': '/uploads/2024/02/Group-104.png',
  '/vision-correction-surgeries/': '/uploads/2024/02/Group-10.png',
  '/en/corneal-surgeries/': '/uploads/2024/02/Group-12.png',
  '/en/treatment-of-cataracts/': '/uploads/2024/02/Group-104.png',
  '/en/vision-correction-surgeries/': '/uploads/2024/02/Group-10.png',
}

export function ServicePage({ url }: { url: string }) {
  const page = getPage(url)
  if (!page) notFound()
  const lang: Lang = page.lang
  const t = T[lang]
  const isAr = lang === 'ar'

  const servicesIndex = isAr ? '/services/' : '/en/services/'
  const servicesLabel = isAr ? 'الخدمات' : 'Services'
  const relTitle = isAr ? 'خدمات ذات صلة' : 'Related services'
  const more = t.learnMore
  const bookUrl = isAr ? '/book/' : '/en/book/'

  const allServices = SERVICES[lang]
  const related = allServices.filter((s) => s.href !== url)

  return (
    <>
      <PageHero
        eyebrow={isAr ? 'خدمة طبية' : 'Service'}
        title={page.title}
        lede={page.seo_description}
        image={HERO_IMG[url]}
      >
        <Link href={bookUrl} className="btn btn-lg btn-light">
          {t.bookNow}
        </Link>
        <Link href={servicesIndex} className="btn btn-lg btn-outline-light">
          {isAr ? 'كل الخدمات' : 'All services'}
        </Link>
      </PageHero>

      <Breadcrumbs
        lang={lang}
        items={[{ href: servicesIndex, label: servicesLabel }, { label: page.title }]}
      />

      <section className="py-12 md:py-16 bg-white">
        <div className="container-narrow">
          <article
            className="prose-medical"
            dangerouslySetInnerHTML={{ __html: page.body_html }}
          />
        </div>
      </section>

      {/* Related services */}
      {related.length > 0 && (
        <section className="py-16 md:py-20 bg-surface-soft">
          <div className="container">
            <Reveal>
              <h2 className="text-2xl md:text-3xl text-brand-900 text-center mb-10">{relTitle}</h2>
            </Reveal>
            <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {related.map((s, i) => (
                <Reveal key={s.href} delay={i * 100}>
                  <Link
                    href={s.href}
                    className="group block h-full p-7 rounded-2xl bg-white border border-surface-edge shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300"
                  >
                    <span className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
                      <Image src={s.icon} alt="" width={40} height={40} className="h-9 w-9 object-contain" />
                    </span>
                    <h3 className="text-xl text-brand-900 mb-2">{s.name}</h3>
                    <p className="text-ink-muted text-[15px] m-0 mb-4 leading-relaxed">{s.desc}</p>
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
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTABand lang={lang} />
    </>
  )
}
