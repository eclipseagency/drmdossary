import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { FAQAccordion } from '@/components/FAQAccordion'
import { FAQ_EN } from '@/lib/i18n'
import { getPage } from '@/lib/content'

const URL = '/en/faq/'

export function generateMetadata(): Metadata {
  const p = getPage(URL)
  return {
    title: p?.seo_title ?? 'FAQ',
    description:
      'Answers to the most common questions about examinations, surgical procedures, and post-operative care at Dr Al Dossary’s clinic.',
    alternates: { canonical: `https://drmdossary.com${URL}` },
  }
}

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Frequently asked questions"
        lede="Answers to the most common questions about examinations, surgical procedures, and post-operative care."
      />
      <Breadcrumbs lang="en" items={[{ label: 'FAQ' }]} />
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-brand-50/40 via-white to-brand-50/30" />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(10,77,104,0.6) 1.2px, transparent 1.2px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="container-narrow relative">
          <FAQAccordion items={FAQ_EN} />
        </div>
      </section>
    </>
  )
}
