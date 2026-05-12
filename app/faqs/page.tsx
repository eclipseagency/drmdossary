import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CTABand } from '@/components/CTABand'
import { FAQAccordion } from '@/components/FAQAccordion'
import { FAQ_AR } from '@/lib/i18n'
import { getPage } from '@/lib/content'

const URL = '/faqs/'

export function generateMetadata(): Metadata {
  const p = getPage(URL)
  return {
    title: p?.seo_title ?? 'الأسئلة الشائعة',
    description:
      'إجابات عن أكثر الأسئلة شيوعًا حول الفحوصات والإجراءات الجراحية والرعاية بعد العملية في عيادة د. محمد الدوسري.',
    alternates: { canonical: `https://drmdossary.com${URL}` },
  }
}

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="الأسئلة الشائعة"
        title="الأسئلة الشائعة"
        lede="إجابات عن أكثر الأسئلة شيوعًا حول الفحوصات والإجراءات الجراحية والرعاية بعد العملية."
      />
      <Breadcrumbs lang="ar" items={[{ label: 'الأسئلة الشائعة' }]} />
      <section className="py-16 md:py-20 bg-white">
        <div className="container-narrow">
          <FAQAccordion items={FAQ_AR} />
        </div>
      </section>
      <CTABand lang="ar" />
    </>
  )
}
