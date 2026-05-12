import type { Metadata } from 'next'
import Link from 'next/link'
import { getPage } from '@/lib/content'
import { PageHero } from '@/components/PageHero'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CTABand } from '@/components/CTABand'
import { Reveal } from '@/components/Reveal'
import { TRUST_BADGES, T } from '@/lib/i18n'

const URL = '/en/about-us/'

export function generateMetadata(): Metadata {
  const p = getPage(URL)
  return {
    title: p?.seo_title ?? p?.title,
    description: p?.seo_description,
    alternates: { canonical: `https://drmdossary.com${URL}` },
  }
}

export default function AboutUsEN() {
  const page = getPage(URL)
  if (!page) return null
  const t = T.en
  return (
    <>
      <PageHero
        eyebrow="About"
        title={page.title}
        lede={page.seo_description}
      >
        <Link href="/en/book/" className="btn btn-lg btn-light">
          {t.bookNow}
        </Link>
      </PageHero>
      <Breadcrumbs lang="en" items={[{ label: page.title }]} />

      <section className="py-12 md:py-16 bg-white">
        <div className="container-narrow">
          <article className="prose-medical" dangerouslySetInnerHTML={{ __html: page.body_html }} />
        </div>
      </section>

      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(40%_50%_at_100%_0%,rgba(8,131,149,.12),transparent_60%),radial-gradient(40%_50%_at_0%_100%,rgba(10,77,104,.10),transparent_60%),linear-gradient(180deg,#ffffff_0%,#f1f5f8_100%)]" />
        <div className="container relative">
          <Reveal>
            <h2 className="text-2xl md:text-3xl text-brand-900 text-center mb-10">Credentials & experience</h2>
          </Reveal>
          <ul className="grid sm:grid-cols-2 gap-4 list-none p-0 m-0 max-w-4xl mx-auto">
            {TRUST_BADGES.en.map((b, i) => (
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

      <CTABand lang="en" />
    </>
  )
}
