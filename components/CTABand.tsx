import Link from 'next/link'
import { type Lang } from '@/lib/content'
import { TextReveal } from './TextReveal'

export function CTABand({ lang }: { lang: Lang }) {
  const isAr = lang === 'ar'
  const title = isAr ? 'احجز موعدك مع الدكتور محمد الدوسري' : 'Book a consultation with Dr Al Dossary'
  const sub = isAr
    ? 'خطوة واحدة تفصلك عن استشارة طبية متخصصة في طب وجراحة العيون.'
    : 'One step away from a specialised ophthalmology consultation.'
  const primary = isAr ? 'احجز الآن' : 'Book now'
  const url = isAr ? '/book/' : '/en/book/'

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
                <TextReveal text={title} step={50} />
              </h2>
              <p className="text-white/85 m-0 text-lg max-w-xl">
                <TextReveal text={sub} delay={250} step={22} offset={10} />
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={url} className="btn btn-lg btn-light">
                {primary}
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
                >
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
