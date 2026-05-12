import { type Lang } from '@/lib/content'
import { getPosts } from '@/lib/content'
import { PageHero } from './PageHero'
import { Breadcrumbs } from './Breadcrumbs'
import { CTABand } from './CTABand'
import { Reveal } from './Reveal'
import { BlogCard } from './BlogCard'

export function BlogIndex({ lang }: { lang: Lang }) {
  const posts = getPosts(lang)
  const isAr = lang === 'ar'
  const title = isAr ? 'المقالات' : 'Blog'
  const lede = isAr
    ? 'أحدث المقالات الطبية في طب وجراحة العيون من د. محمد الدوسري.'
    : 'Latest medical insight on ophthalmology and eye care from Dr Mohammad Al Dossary.'

  return (
    <>
      <PageHero eyebrow={isAr ? 'مدونة' : 'Blog'} title={title} lede={lede} />
      <Breadcrumbs lang={lang} items={[{ label: title }]} />

      <section className="py-16 md:py-20 bg-white">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p, i) => (
              <Reveal key={p.url} delay={(i % 6) * 80}>
                <BlogCard post={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTABand lang={lang} />
    </>
  )
}
