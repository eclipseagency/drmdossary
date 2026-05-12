import { type Lang } from '@/lib/content'
import { getPostsForListing } from '@/lib/content'
import { PageHero } from './PageHero'
import { Breadcrumbs } from './Breadcrumbs'
import { BlogCard } from './BlogCard'

export function BlogIndex({ lang }: { lang: Lang }) {
  const { posts, fallbackLang } = getPostsForListing(lang)
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
          {fallbackLang === 'ar' && (
            <div className="mb-8 rounded-2xl border border-brand-500/20 bg-brand-50 p-5 flex items-start gap-3">
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white shadow-glow"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </span>
              <div className="text-[15px] leading-relaxed">
                <p className="m-0 font-semibold text-brand-900">
                  Articles are currently published in Arabic.
                </p>
                <p className="m-0 mt-1 text-ink-muted">
                  English translations are coming soon. In the meantime you can read the
                  full Arabic articles below — your browser can translate them automatically.
                </p>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => (
              <BlogCard key={p.url} post={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
