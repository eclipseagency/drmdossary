import Link from 'next/link'
import { type Lang } from '@/lib/content'
import { SERVICES, T } from '@/lib/i18n'
import { PageHero } from './PageHero'
import { Breadcrumbs } from './Breadcrumbs'
import { CTABand } from './CTABand'
import { ServiceCard } from './ServiceCard'

export function ServicesIndex({ lang }: { lang: Lang }) {
  const services = SERVICES[lang]
  const isAr = lang === 'ar'
  const t = T[lang]
  const title = isAr ? 'الخدمات' : 'Services'
  const lede = isAr
    ? 'تقدم العيادة مجموعة شاملة من الخدمات المتخصصة في طب وجراحة العيون باستخدام أحدث التقنيات وأكثرها تطورًا.'
    : 'A complete range of specialised ophthalmology services using the latest, most advanced technology.'
  const more = isAr ? 'عرض الخدمة' : 'View Service'
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {services.map((s) => (
              <ServiceCard key={s.href} service={s} lang={lang} more={more} />
            ))}
          </div>
        </div>
      </section>

      <CTABand lang={lang} />
    </>
  )
}
