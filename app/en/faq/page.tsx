import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CTABand } from '@/components/CTABand'
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
      <section className="py-16 md:py-20 bg-white">
        <div className="container-narrow">
          <FAQAccordion items={FAQ_EN} />
        </div>
      </section>
      <CTABand lang="en" />
    </>
  )
}
