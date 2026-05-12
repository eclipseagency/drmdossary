import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPage } from '@/lib/content'
import { PageHero } from '@/components/PageHero'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Reveal } from '@/components/Reveal'
import { TRUST_BADGES, T } from '@/lib/i18n'

const URL = '/about-us/'

export function generateMetadata(): Metadata {
  const p = getPage(URL)
  return {
    title: p?.seo_title ?? p?.title,
    description: p?.seo_description,
    alternates: { canonical: `https://drmdossary.com${URL}` },
  }
}

export default function AboutUsAR() {
  const page = getPage(URL)
  if (!page) return null
  const t = T.ar
  return (
    <>
      <PageHero
        eyebrow="عن الدكتور"
        title={page.title}
        lede={page.seo_description}
      >
        <Link href="/book/" className="btn btn-lg btn-light">
          {t.bookNow}
        </Link>
      </PageHero>
      <Breadcrumbs lang="ar" items={[{ label: page.title }]} />

      <section className="relative py-16 md:py-24 bg-white overflow-hidden">
        {/* Soft brand glow behind the section */}
        <span
          aria-hidden
          className="absolute -top-32 start-[-160px] h-[420px] w-[420px] rounded-full bg-brand-500/8 blur-3xl pointer-events-none"
        />
        <div className="container relative">
          <div className="grid md:grid-cols-[0.85fr_1.15fr] gap-10 md:gap-16 items-start">
            <Reveal>
              <div className="relative mx-auto w-full max-w-[420px]">
                <span
                  aria-hidden
                  className="absolute -inset-6 rounded-[36px] bg-[radial-gradient(60%_60%_at_50%_50%,rgba(8,131,149,0.22),rgba(10,77,104,0.06)_60%,transparent_80%)] blur-2xl pointer-events-none"
                />
                <div className="relative aspect-[4/5] rounded-[26px] overflow-hidden ring-1 ring-brand-500/15 shadow-lift bg-gradient-brand-soft">
                  <Image
                    src="/uploads/dr.m.webp"
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 768px) 420px, 90vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </Reveal>

            <div className="flex flex-col gap-6">
              <Reveal>
                <p className="inline-flex items-center gap-2 text-brand-500 font-semibold text-sm tracking-wider uppercase">
                  <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
                  نبذة عن الدكتور
                </p>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="text-3xl md:text-4xl text-brand-900 leading-tight m-0">
                  د. محمد الدوسري
                  <span className="block text-brand-500 text-xl md:text-2xl font-semibold mt-2">
                    استشاري طب وجراحة العيون
                  </span>
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <span aria-hidden className="block w-14 h-[3px] rounded-full bg-brand-500" />
              </Reveal>
              <Reveal delay={240}>
                <article
                  className="prose-medical prose-medical-tight"
                  dangerouslySetInnerHTML={{ __html: page.body_html }}
                />
              </Reveal>

              {/* Credential chips */}
              <Reveal delay={320}>
                <ul className="flex flex-wrap gap-2.5 list-none p-0 m-0 mt-4">
                  {TRUST_BADGES.ar.map((b) => (
                    <li key={b}>
                      <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 ring-1 ring-brand-500/20 text-brand-900 text-[13.5px] font-semibold px-3.5 py-2">
                        <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="#088395" strokeWidth="2.5" aria-hidden>
                          <path d="M3.5 8.5l3 3 6-6" />
                        </svg>
                        <span>{b}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={400}>
                <div className="flex flex-wrap gap-3 mt-2">
                  <Link href="/book/" className="btn btn-lg btn-primary">
                    {t.bookNow}
                  </Link>
                  <Link href="/services/" className="btn btn-lg btn-ghost">
                    تعرّف على خدماتنا
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(40%_50%_at_100%_0%,rgba(8,131,149,.12),transparent_60%),radial-gradient(40%_50%_at_0%_100%,rgba(10,77,104,.10),transparent_60%),linear-gradient(180deg,#ffffff_0%,#f1f5f8_100%)]" />
        <div className="container relative">
          <Reveal>
            <h2 className="text-2xl md:text-3xl text-brand-900 text-center mb-10">المؤهلات والخبرة</h2>
          </Reveal>
          <ul className="grid sm:grid-cols-2 gap-4 list-none p-0 m-0 max-w-4xl mx-auto">
            {TRUST_BADGES.ar.map((b, i) => (
              <Reveal as="li" key={b} pop delay={i * 100} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-surface-edge shadow-soft hover:shadow-lift hover:border-brand-400/40 hover:-translate-y-1 transition-all">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand-soft text-white shadow-glow">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </span>
                <span className="font-semibold text-brand-900 leading-snug">{b}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
