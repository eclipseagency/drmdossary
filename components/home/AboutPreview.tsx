import Link from 'next/link'
import Image from 'next/image'
import { type Lang } from '@/lib/content'
import { Reveal } from '@/components/Reveal'
import { TextReveal } from '@/components/TextReveal'

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
            <div className="relative mx-auto w-full max-w-[440px]">
              <Image
                src={ABOUT_IMG}
                alt=""
                width={460}
                height={460}
                className="block w-full h-auto"
              />
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
