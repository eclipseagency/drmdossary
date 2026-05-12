import { type Lang } from '@/lib/content'
import { SERVICES, T } from '@/lib/i18n'
import { Reveal } from '@/components/Reveal'
import { TextReveal } from '@/components/TextReveal'
import { ServiceCard } from '@/components/ServiceCard'

export function ServicesBento({ lang }: { lang: Lang }) {
  const services = SERVICES[lang]
  const isAr = lang === 'ar'
  const t = T[lang]
  const eyebrow = isAr ? 'تخصصات' : 'Specialties'
  const title = isAr ? 'خدماتنا' : 'Our Services'
  const lede = isAr
    ? 'مجموعة شاملة من الخدمات المتخصصة في طب وجراحة العيون بأحدث التقنيات.'
    : 'A complete range of specialised ophthalmology services using the latest technology.'
  const more = isAr ? 'عرض الخدمة' : 'View Service'

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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {services.map((s) => (
            <ServiceCard key={s.href} service={s} lang={lang} more={more} />
          ))}
        </div>
      </div>
    </section>
  )
}
