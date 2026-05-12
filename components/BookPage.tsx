import Image from 'next/image'
import { type Lang } from '@/lib/content'
import { PageHero } from './PageHero'
import { Breadcrumbs } from './Breadcrumbs'
import { Reveal } from './Reveal'
import { BookingForm } from './BookingForm'
import { CONTACT } from '@/lib/i18n'

const HERO_IMG = '/uploads/dr.m.webp'

type BookPageProps = { lang: Lang }

export function BookPage({ lang }: BookPageProps) {
  const isAr = lang === 'ar'
  const c = CONTACT[lang]

  const title = isAr ? 'احجز معنا' : 'Book with us'
  const eyebrow = isAr ? 'احجز موعد' : 'Booking'
  const lede = isAr
    ? 'خطوة واحدة تفصلك عن استشارة طبية متخصصة في طب وجراحة العيون.'
    : 'One step away from a specialised ophthalmology consultation.'

  const steps = isAr
    ? [
        'املأ نموذج الحجز أدناه.',
        'التواصل لتحديد موعد الاستشارة.',
        'بدء رحلتك نحو رؤية أوضح.',
      ]
    : [
        'Fill out the booking form below.',
        'We’ll contact you to schedule the consultation.',
        'Start your journey toward clearer vision.',
      ]

  const intro = isAr
    ? 'للحصول على مزيد من المعلومات حول خدمات الطبيب، معرفة الأسعار، أو حجز موعد، يُرجى التواصل معنا من خلال النموذج أدناه.'
    : 'For more information about the doctor’s services, pricing, or to book an appointment, please reach out through the form below.'

  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} lede={lede} />
      <Breadcrumbs lang={lang} items={[{ label: title }]} />

      <section className="relative py-14 md:py-20 bg-white overflow-hidden">
        <div className="container">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-14 items-start">
            {/* Image side */}
            <Reveal>
              <div className="relative">
                <span
                  aria-hidden
                  className="absolute -inset-y-6 -inset-x-4 rounded-[36px] bg-[radial-gradient(60%_60%_at_50%_50%,rgba(8,131,149,0.25),rgba(10,77,104,0.10)_60%,transparent_80%)] blur-2xl pointer-events-none"
                />
                <div className="relative rounded-3xl overflow-hidden shadow-lift ring-1 ring-brand-500/15 bg-gradient-brand-soft">
                  <Image
                    src={HERO_IMG}
                    alt=""
                    width={900}
                    height={1100}
                    priority
                    sizes="(min-width: 1024px) 460px, 100vw"
                    className="block w-full h-auto"
                  />
                </div>
              </div>
            </Reveal>

            {/* Copy + form */}
            <div className="flex flex-col gap-8">
              <Reveal delay={80}>
                <ol className="list-none p-0 m-0 space-y-3">
                  {steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-brand-soft text-white font-bold shadow-glow">
                        {isAr ? toArabicDigit(i + 1) : i + 1}
                      </span>
                      <span className="pt-1.5 text-lg text-brand-900 font-semibold leading-snug">{step}</span>
                    </li>
                  ))}
                </ol>
              </Reveal>

              <Reveal delay={160}>
                <p className="text-ink-muted text-lg leading-relaxed m-0">{intro}</p>
              </Reveal>

              <Reveal delay={240}>
                <BookingForm lang={lang} />
              </Reveal>

              <Reveal delay={300}>
                <div className="rounded-2xl border border-surface-edge bg-surface-soft p-5 text-[15px] text-ink-muted">
                  <p className="m-0 mb-1">
                    <span className="font-semibold text-brand-900">{c.phoneLabel}: </span>
                    <a href={`tel:${c.phoneTel}`} className="text-brand-600 hover:text-brand-700">
                      {c.phoneDisplay}
                    </a>
                  </p>
                  <p className="m-0">
                    <span className="font-semibold text-brand-900">{c.emailLabel}: </span>
                    <a href={`mailto:${c.email}`} className="text-brand-600 hover:text-brand-700 break-all">
                      {c.email}
                    </a>
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function toArabicDigit(n: number): string {
  const map = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  return String(n)
    .split('')
    .map((d) => map[parseInt(d, 10)] ?? d)
    .join('')
}
