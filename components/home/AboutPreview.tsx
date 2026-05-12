import Link from 'next/link'
import Image from 'next/image'
import { type Lang } from '@/lib/content'
import { Reveal } from '@/components/Reveal'
import { TextReveal } from '@/components/TextReveal'
import { TiltCard } from '@/components/TiltCard'

const ABOUT_IMG = '/uploads/2024/02/Group-10.png'

export function AboutPreview({ lang }: { lang: Lang }) {
  const isAr = lang === 'ar'
  const eyebrow = isAr ? 'عن الطبيب' : 'About the Doctor'
  const title = isAr
    ? 'د. محمد الدوسري — استشاري طب وجراحة العيون'
    : 'Dr Mohammad Al Dossary — Consultant Ophthalmologist'
  const lede = isAr
    ? 'تلتقي الدقة والعناية لتقديم حلول طبية متطورة في مجال القرنية، الماء الأبيض، وجراحات تصحيح النظر، مع التزام بالرعاية الشخصية والمتابعة المستمرة.'
    : 'Precision and compassion combine to deliver advanced medical solutions for corneal, cataract, and vision-correction surgery — with a commitment to personalised care and long-term follow-up.'
  const ctaLabel = isAr ? 'المزيد عن الطبيب' : 'More about the doctor'
  const ctaHref = isAr ? '/about-us/' : '/en/about-us/'

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-b from-white to-surface-soft overflow-hidden">
      <span
        aria-hidden
        className="absolute top-1/2 -translate-y-1/2 start-[-15%] h-[420px] w-[420px] rounded-full bg-brand-500/10 blur-3xl pointer-events-none"
      />
      <div className="container relative">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <Reveal delay={80}>
            <div className="relative mx-auto w-full max-w-[440px]" style={{ perspective: 1400 }}>
              <TiltCard isRTL={isAr} className="relative aspect-square" max={6}>
                {/* Layered plates for depth */}
                <span
                  aria-hidden
                  className="absolute -bottom-3 -end-3 top-2 start-2 rounded-[26px] bg-gradient-to-br from-brand-400/55 to-brand-500/55 shadow-soft -rotate-[3deg] rtl:rotate-[3deg]"
                />
                <span
                  aria-hidden
                  className="absolute -bottom-1 -end-1 top-1 start-1 rounded-[26px] bg-gradient-to-br from-brand-600/30 to-brand-700/50 shadow-soft rotate-[2deg] rtl:-rotate-[2deg]"
                />
                <div
                  className="relative h-full w-full rounded-[26px] overflow-hidden shadow-lift ring-1 ring-brand-500/12 flex items-center justify-center"
                  style={{
                    background:
                      'radial-gradient(circle at 30% 0%, rgba(255,255,255,.5), rgba(255,255,255,0) 60%), linear-gradient(135deg, #eef9fb 0%, #ffffff 60%)',
                  }}
                >
                  <Image
                    src={ABOUT_IMG}
                    alt=""
                    width={460}
                    height={460}
                    className="w-[92%] h-[92%] object-contain drop-shadow-[0_10px_18px_rgba(8,18,30,0.12)]"
                  />
                </div>
              </TiltCard>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <span className="eyebrow-pill mb-3">{eyebrow}</span>
            </Reveal>
            <h2 className="text-3xl md:text-4xl text-brand-900 mb-5 leading-tight">
              <TextReveal text={title} step={50} />
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed m-0 mb-7">
              <TextReveal text={lede} delay={250} step={22} offset={10} />
            </p>
            <Reveal delay={240}>
              <Link href={ctaHref} className="btn btn-ghost">
                {ctaLabel}
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
