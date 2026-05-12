import Link from 'next/link'
import { type Lang } from '@/lib/content'
import { getPosts } from '@/lib/content'
import { Reveal } from '@/components/Reveal'
import { BlogCard } from '@/components/BlogCard'

export function BlogPreview({ lang }: { lang: Lang }) {
  const posts = getPosts(lang).slice(0, 3)
  const isAr = lang === 'ar'
  const title = isAr ? 'أحدث المقالات' : 'Latest articles'
  const lede = isAr ? 'نصائح ومعرفة طبية موثوقة في طب وجراحة العيون.' : 'Trusted medical insight on eye health and surgical care.'
  const viewAll = isAr ? 'كل المقالات' : 'All articles'
  const url = isAr ? '/blog/' : '/en/blog/'

  if (posts.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-surface-soft">
      <div className="container">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl text-brand-900 mb-2">{title}</h2>
              <p className="text-ink-muted text-lg m-0">{lede}</p>
            </div>
            <Link href={url} className="btn btn-ghost text-sm">
              {viewAll}
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={isAr ? { transform: 'scaleX(-1)' } : undefined}
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p, i) => (
            <Reveal key={p.url} delay={i * 100}>
              <BlogCard post={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
