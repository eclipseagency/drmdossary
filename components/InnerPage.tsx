import { notFound } from 'next/navigation'
import { getPage } from '@/lib/content'
import { PageHero } from './PageHero'
import { Breadcrumbs } from './Breadcrumbs'
import { type Lang } from '@/lib/content'
import Link from 'next/link'
import { T } from '@/lib/i18n'

type InnerPageProps = {
  url: string
  eyebrow?: string
  /** override the breadcrumb label list (without the home link, which is auto-prepended) */
  crumbs?: Array<{ href?: string; label: string }>
  /** Optional hero CTAs */
  showHeroCtas?: boolean
}

export function InnerPage({ url, eyebrow, crumbs, showHeroCtas = true }: InnerPageProps) {
  const page = getPage(url)
  if (!page) notFound()
  const lang: Lang = page.lang
  const t = T[lang]
  const bookUrl = lang === 'ar' ? '/book/' : '/en/book/'

  const breadcrumbItems = crumbs ?? [{ label: page.title }]

  return (
    <>
      <PageHero
        eyebrow={eyebrow}
        title={page.title}
        lede={page.seo_description}

      >
        {showHeroCtas && (
          <Link href={bookUrl} className="btn btn-lg btn-light">
            {t.bookNow}
          </Link>
        )}
      </PageHero>
      <Breadcrumbs lang={lang} items={breadcrumbItems} />
      <section className="py-12 md:py-16 bg-white">
        <div className="container-narrow">
          <article
            className="prose-medical"
            // Body content already sanitized by the Python pipeline.
            dangerouslySetInnerHTML={{ __html: page.body_html }}
          />
        </div>
      </section>
    </>
  )
}
