import Link from 'next/link'
import { type Lang } from '@/lib/content'

export function CTABand({ lang }: { lang: Lang }) {
  const isAr = lang === 'ar'
  const title = isAr ? 'احجز موعدك مع الدكتور محمد الدوسري' : 'Book a consultation with Dr Al Dossary'
  const sub = isAr
    ? 'خطوة واحدة تفصلك عن استشارة طبية متخصصة في طب وجراحة العيون.'
    : 'One step away from a specialised ophthalmology consultation.'
  const primary = isAr ? 'احجز الآن' : 'Book now'
  const secondary = isAr ? 'تواصل معنا' : 'Contact us'
  const url = isAr ? '/contact-us/' : '/en/contact-us/'

  return (
    <section className="relative overflow-hidden isolate">
      <div className="relative bg-gradient-brand text-white">
        {/* Floating shapes */}
        <span
          aria-hidden
          className="absolute -top-32 end-[-120px] h-[420px] w-[420px] rounded-full bg-brand-500/40 blur-3xl animate-float-a respect-motion"
        />
        <span
          aria-hidden
          className="absolute -bottom-40 start-[-100px] h-[380px] w-[380px] rounded-full bg-brand-400/30 blur-3xl animate-float-b respect-motion"
        />
        <span aria-hidden className="absolute inset-0 bg-noise opacity-[0.04] pointer-events-none" />

        <div className="container relative py-16 md:py-20">
          <div className="grid md:grid-cols-[1.2fr_auto] gap-6 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl text-white mb-3 leading-tight">
                <span className="grad-text-light">{title}</span>
              </h2>
              <p className="text-white/85 m-0 text-lg max-w-xl">{sub}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={url} className="btn btn-lg btn-light">
                {primary}
              </Link>
              <Link href={url} className="btn btn-lg btn-outline-light">
                {secondary}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
