import Image from 'next/image'
import { type Lang } from '@/lib/content'
import { PageHero } from './PageHero'
import { Breadcrumbs } from './Breadcrumbs'
import { Reveal } from './Reveal'
import { TextReveal } from './TextReveal'
import { BookingForm } from './BookingForm'
import { ContactCards } from './ContactCards'

const HERO_IMG = '/uploads/dr.m.webp'

type BookPageProps = { lang: Lang }

export function BookPage({ lang }: BookPageProps) {
  const isAr = lang === 'ar'

  const title = isAr ? 'احجز معنا' : 'Book with us'
  const eyebrow = isAr ? 'احجز موعد' : 'Booking'
  const lede = isAr
    ? 'خطوة واحدة تفصلك عن استشارة طبية متخصصة في طب وجراحة العيون.'
    : 'One step away from a specialised ophthalmology consultation.'

  const steps = isAr
    ? [
        { t: 'املأ نموذج الحجز أدناه', s: 'بياناتك تصلنا مباشرةً.' },
        { t: 'التواصل لتحديد الموعد', s: 'فريقنا يتصل بك لتأكيد الموعد المناسب.' },
        { t: 'بدء رحلتك نحو رؤية أوضح', s: 'استشارة طبية متخصصة بأعلى معايير الجودة.' },
      ]
    : [
        { t: 'Fill out the booking form below', s: 'Your details reach us instantly.' },
        { t: 'We contact you to schedule', s: 'Our team will confirm a convenient time.' },
        { t: 'Begin your journey to clearer vision', s: 'Specialised care at the highest standards.' },
      ]

  const intro = isAr
    ? 'للحصول على مزيد من المعلومات حول خدمات الطبيب، معرفة الأسعار، أو حجز موعد، يُرجى التواصل معنا من خلال النموذج أدناه.'
    : 'For more information about the doctor’s services, pricing, or to book an appointment, please reach out through the form below.'

  const stepsTitle = isAr ? 'كيف يعمل الحجز' : 'How booking works'
  const contactTitle = isAr ? 'وسائل التواصل المباشر' : 'Direct contact options'
  const contactLede = isAr
    ? 'تواصل معنا مباشرةً عبر القنوات التالية.'
    : 'Reach us directly through any of the channels below.'
  const formTitle = isAr ? 'نموذج الحجز' : 'Booking form'

  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} lede={lede} />
      <Breadcrumbs lang={lang} items={[{ label: title }]} />

      {/* Step strip — horizontal track of numbered stages, premium feel */}
      <section className="relative bg-gradient-to-b from-white to-surface-soft py-14 md:py-16">
        <div className="container">
          <Reveal>
            <p className="eyebrow-pill mb-3">{stepsTitle}</p>
          </Reveal>
          <h2 className="text-2xl md:text-3xl text-brand-900 mb-8 max-w-2xl leading-tight">
            <TextReveal text={intro} step={22} offset={10} />
          </h2>
          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            {steps.map((step, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="relative h-full rounded-2xl bg-white border border-surface-edge shadow-soft hover:shadow-lift hover:-translate-y-1 hover:border-brand-400/40 transition-all duration-300 p-7">
                  <span className="absolute top-5 end-5 text-[44px] font-extrabold leading-none text-brand-50 select-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand-soft text-white font-bold text-lg shadow-glow mb-5">
                    {isAr ? toArabicDigit(i + 1) : i + 1}
                  </span>
                  <h3 className="text-lg text-brand-900 mb-2 leading-snug">{step.t}</h3>
                  <p className="text-ink-muted text-[15px] leading-relaxed m-0">{step.s}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Main: doctor photo + form */}
      <section className="relative py-14 md:py-20 bg-white overflow-hidden">
        <span
          aria-hidden
          className="absolute -top-32 end-[-120px] h-[420px] w-[420px] rounded-full bg-brand-500/10 blur-3xl pointer-events-none"
        />
        <span
          aria-hidden
          className="absolute -bottom-32 start-[-100px] h-[360px] w-[360px] rounded-full bg-brand-600/8 blur-3xl pointer-events-none"
        />
        <div className="container relative">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-14 items-start">
            {/* Image side — 3D framed */}
            <Reveal>
              <div className="relative" style={{ perspective: 1400 }}>
                <span
                  aria-hidden
                  className="absolute -inset-8 rounded-[40px] bg-[radial-gradient(60%_60%_at_50%_50%,rgba(8,131,149,0.30),rgba(10,77,104,0.10)_60%,transparent_80%)] blur-2xl pointer-events-none"
                />
                {/* Back plate */}
                <span
                  aria-hidden
                  className="absolute -bottom-3 -end-3 top-2 start-2 rounded-[26px] bg-gradient-to-br from-brand-400/55 to-brand-500/55 shadow-soft -rotate-[3deg] rtl:rotate-[3deg]"
                />
                {/* Mid plate */}
                <span
                  aria-hidden
                  className="absolute -bottom-1 -end-1 top-1 start-1 rounded-[26px] bg-gradient-to-br from-brand-600/30 to-brand-700/55 shadow-soft rotate-[2deg] rtl:-rotate-[2deg]"
                />
                {/* Front frame holding the portrait */}
                <div className="relative rounded-[26px] overflow-hidden ring-1 ring-brand-500/15 shadow-lift bg-gradient-brand-soft">
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

                {/* Floating quote pill */}
                <Reveal delay={400} pop>
                  <div className="absolute -bottom-5 start-5 end-5 sm:start-auto sm:-end-6 sm:max-w-[280px] rounded-2xl bg-white shadow-lift ring-1 ring-surface-edge p-4 backdrop-blur">
                    <p className="m-0 text-[13.5px] text-ink-muted leading-relaxed">
                      <span className="font-bold text-brand-900">
                        {isAr ? 'استشاري طب وجراحة العيون' : 'Consultant Ophthalmologist'}
                      </span>
                      {' — '}
                      {isAr
                        ? 'البورد السعودي + زمالة مستشفى الملك خالد التخصصي للعيون.'
                        : 'Saudi Board + King Khaled Eye Specialist Hospital fellowship.'}
                    </p>
                  </div>
                </Reveal>
              </div>
            </Reveal>

            {/* Form side */}
            <div className="flex flex-col gap-8 mt-12 lg:mt-0">
              <Reveal>
                <div>
                  <p className="eyebrow-pill mb-3">{formTitle}</p>
                  <h2 className="text-2xl md:text-3xl text-brand-900 leading-tight m-0">
                    <TextReveal
                      text={
                        isAr
                          ? 'أخبرنا عنك ليتواصل معك فريقنا'
                          : 'Tell us about you and our team will reach out'
                      }
                      step={50}
                    />
                  </h2>
                </div>
              </Reveal>

              <Reveal delay={120}>
                <BookingForm lang={lang} />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Contact cards — moved here from the old contact-us page */}
      <section className="relative py-16 md:py-20 bg-surface-soft overflow-hidden">
        <span
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(10,77,104,0.6) 1.1px, transparent 1.1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="container relative">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <Reveal>
              <p className="eyebrow-pill mb-3">{contactTitle}</p>
            </Reveal>
            <h2 className="text-2xl md:text-3xl text-brand-900 mb-3">
              <TextReveal
                text={isAr ? 'تواصل معنا مباشرةً' : 'Get in touch directly'}
                step={50}
              />
            </h2>
            <p className="text-ink-muted m-0">
              <TextReveal text={contactLede} delay={200} step={22} offset={10} />
            </p>
          </div>

          <ContactCards lang={lang} />
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
