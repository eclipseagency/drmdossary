import { type Lang } from '@/lib/content'
import { WHY_AR, WHY_EN } from '@/lib/i18n'
import { Reveal } from '@/components/Reveal'
import { TextReveal } from '@/components/TextReveal'

const ICONS = [
  // 0: certified expertise (graduation cap)
  <svg key="i0" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10 12 5 2 10l10 5 10-5Z" />
    <path d="M6 12v5a6 6 0 0 0 12 0v-5" />
  </svg>,
  // 1: modern technology (eye + spark)
  <svg key="i1" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>,
  // 2: safety & precision (shield + check)
  <svg key="i2" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>,
  // 3: personalised care (heart + pulse)
  <svg key="i3" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
  </svg>,
]

export function WhyUs({ lang }: { lang: Lang }) {
  const items = lang === 'ar' ? WHY_AR : WHY_EN
  const isAr = lang === 'ar'
  const title = isAr ? 'لماذا تختار د. الدوسري؟' : 'Why choose Dr Al Dossary?'
  const lede = isAr
    ? 'خبرة موثوقة وتقنيات حديثة ورعاية شخصية في كل خطوة من رحلة العلاج.'
    : 'Trusted expertise, modern technology, and personalised care at every step.'

  return (
    <section className="relative py-16 md:py-24 bg-white">
      <div className="container">
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <h2 className="text-3xl md:text-4xl text-brand-900 mb-3">
            <TextReveal text={title} step={50} />
          </h2>
          <p className="text-ink-muted text-lg m-0">
            <TextReveal text={lede} delay={200} step={22} offset={10} />
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 100}>
              <div className="relative h-full p-7 rounded-2xl bg-surface-soft border border-surface-edge hover:shadow-soft hover:border-brand-400/40 hover:-translate-y-1 transition-all duration-300">
                <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand-soft text-white shadow-glow">
                  {ICONS[i]}
                </span>
                <h3 className="text-lg text-brand-900 mb-2">{item.title}</h3>
                <p className="text-ink-muted m-0 text-[15px] leading-relaxed">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
