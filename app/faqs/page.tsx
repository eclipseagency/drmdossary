import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'
import { Breadcrumbs } from '@/components/Breadcrumbs'
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
      <section className="relative py-16 md:py-20 overflow-hidden">
        {/* Soft chat-thread backdrop */}
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
          <FAQAccordion items={FAQ_AR} />
        </div>
      </section>
    </>
  )
}
