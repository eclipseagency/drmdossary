import { type Lang } from '@/lib/content'
import { PageHero } from './PageHero'
import { Breadcrumbs } from './Breadcrumbs'
import { Reveal } from './Reveal'
import { BookingForm } from './BookingForm'

type BookPageProps = { lang: Lang }

export function BookPage({ lang }: BookPageProps) {
  const isAr = lang === 'ar'

  const title = isAr ? 'احجز معنا' : 'Book with us'
  const eyebrow = isAr ? 'احجز موعد' : 'Booking'
  const lede = isAr
    ? 'خطوة واحدة تفصلك عن استشارة طبية متخصصة في طب وجراحة العيون.'
    : 'One step away from a specialised ophthalmology consultation.'

  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} lede={lede} />
      <Breadcrumbs lang={lang} items={[{ label: title }]} />

      <section className="relative py-14 md:py-20 bg-white">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <Reveal>
              <BookingForm lang={lang} />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
