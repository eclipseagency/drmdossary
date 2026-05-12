import { type Lang } from '@/lib/content'
import { CONTACT } from '@/lib/i18n'
import { PageHero } from './PageHero'
import { Breadcrumbs } from './Breadcrumbs'
import { CTABand } from './CTABand'
import { Reveal } from './Reveal'

const ContactIcons = {
  pin: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
}

export function ContactPage({ lang, title }: { lang: Lang; title: string }) {
  const c = CONTACT[lang]
  const isAr = lang === 'ar'
  const lede = isAr
    ? 'تواصل مع فريقنا للحصول على المعلومات أو لحجز موعد. سعداء بخدمتكم.'
    : 'Get in touch with our team for information or to book a consultation.'

  const cards = [
    {
      icon: ContactIcons.pin,
      label: c.addressLabel,
      value: <span className="text-ink">{c.address}</span>,
    },
    {
      icon: ContactIcons.phone,
      label: c.phoneLabel,
      value: (
        <a href={`tel:${c.phoneTel}`} className="text-brand-900 font-bold hover:text-brand-500 transition-colors">
          {c.phoneDisplay}
        </a>
      ),
    },
    {
      icon: ContactIcons.mail,
      label: c.emailLabel,
      value: (
        <a href={`mailto:${c.email}`} className="text-brand-900 font-bold hover:text-brand-500 transition-colors break-all">
          {c.email}
        </a>
      ),
    },
    {
      icon: ContactIcons.clock,
      label: c.hoursLabel,
      value: <span className="text-ink">{c.hours}</span>,
    },
  ]

  return (
    <>
      <PageHero
        eyebrow={isAr ? 'تواصل' : 'Get in touch'}
        title={title}
        lede={lede}
        image="/uploads/2024/10/DALL·E-2024-10-10-17.28.24-A-professional-hospital-contact-section.-The-background-displays-a-sleek-modern-hospital-lobby-with-a-reception-desk-clear-signage-and-a-calm-atmos.jpg"
      />
      <Breadcrumbs lang={lang} items={[{ label: title }]} />

      <section className="py-16 md:py-20 bg-white">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {cards.map((card, i) => (
              <Reveal key={card.label} delay={i * 100}>
                <div className="h-full p-6 rounded-2xl bg-surface-soft border border-surface-edge text-center hover:shadow-lift hover:-translate-y-1 transition-all duration-300">
                  <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand-soft text-white shadow-glow">
                    {card.icon}
                  </span>
                  <h3 className="text-base font-bold text-brand-900 mb-1.5">{card.label}</h3>
                  <p className="m-0 text-[15px]">{card.value}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTABand lang={lang} />
    </>
  )
}
