import type { Metadata } from 'next'
import { getPage } from '@/lib/content'
import { PageHero } from '@/components/PageHero'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CTABand } from '@/components/CTABand'

const URL = '/privacy-policy/'

export function generateMetadata(): Metadata {
  const p = getPage(URL)
  return {
    title: p?.seo_title ?? p?.title ?? 'Privacy Policy',
    description: p?.seo_description,
    alternates: { canonical: `https://drmdossary.com${URL}` },
  }
}

export default function Page() {
  const p = getPage(URL)
  return (
    <>
      <PageHero title={p?.title || 'Privacy Policy'} />
      <Breadcrumbs lang="ar" items={[{ label: p?.title || 'Privacy Policy' }]} />
      <section className="py-12 md:py-16 bg-white">
        <div className="container-narrow">
          <article className="prose-medical" dangerouslySetInnerHTML={{ __html: p?.body_html || '' }} />
        </div>
      </section>
      <CTABand lang="ar" />
    </>
  )
}
