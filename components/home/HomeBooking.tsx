import { type Lang } from '@/lib/content'
import { Reveal } from '@/components/Reveal'
import { TextReveal } from '@/components/TextReveal'
import { BookingForm } from '@/components/BookingForm'

export function HomeBooking({ lang }: { lang: Lang }) {
  const isAr = lang === 'ar'
  const eyebrow = isAr ? 'احجز موعد' : 'Booking'
  const title = isAr
    ? 'احجز استشارتك مع د. الدوسري'
    : 'Book a consultation with Dr Al Dossary'
  const lede = isAr
    ? 'املأ النموذج وسيتواصل معك فريقنا لتحديد الموعد المناسب.'
    : 'Fill in the form and our team will reach out to schedule a time that works for you.'

  return (
    <section className="relative py-16 md:py-24 bg-white">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <Reveal>
            <p className="eyebrow-pill mb-3">{eyebrow}</p>
          </Reveal>
          <h2 className="text-2xl md:text-3xl text-brand-900 mb-3 leading-tight">
            <TextReveal text={title} step={50} />
          </h2>
          <p className="text-ink-muted m-0">
            <TextReveal text={lede} delay={200} step={22} offset={10} />
          </p>
        </div>
        <div className="max-w-2xl mx-auto">
          <Reveal delay={120}>
            <BookingForm lang={lang} />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
