import Link from 'next/link'
import Image from 'next/image'
import { type PostEntry } from '@/lib/content'
import { T } from '@/lib/i18n'
import { Breadcrumbs } from './Breadcrumbs'
import { CTABand } from './CTABand'

function readingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ')
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export function BlogPost({ post }: { post: PostEntry }) {
  const t = T[post.lang]
  const isAr = post.lang === 'ar'
  const blogUrl = isAr ? '/blog/' : '/en/blog/'
  const blogLabel = isAr ? 'المقالات' : 'Blog'
  const rt = readingTime(post.body_html)
  const date = (post.date || '').slice(0, 10)

  return (
    <>
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-surface-soft to-white">
        <div className="container py-12 md:py-16">
          <p className="text-sm text-ink-muted flex items-center gap-2 mb-4">
            <time dateTime={post.date}>{date}</time>
            <span aria-hidden className="text-surface-edge">·</span>
            <span>{t.minRead(rt)}</span>
          </p>
          <h1 className="text-3xl md:text-5xl text-brand-900 leading-tight max-w-4xl">{post.title}</h1>
          {post.featured_image && (
            <figure className="mt-8 rounded-3xl overflow-hidden shadow-lift">
              <Image
                src={post.featured_image}
                alt=""
                width={1200}
                height={675}
                priority
                sizes="(min-width: 1024px) 1100px, 100vw"
                className="block w-full h-auto max-h-[480px] object-cover"
              />
            </figure>
          )}
        </div>
      </section>

      <Breadcrumbs lang={post.lang} items={[{ href: blogUrl, label: blogLabel }, { label: post.title }]} />

      <article className="py-12 md:py-16 bg-white">
        <div className="container-narrow">
          <div className="prose-medical" dangerouslySetInnerHTML={{ __html: post.body_html }} />
          <div className="mt-12 pt-8 border-t border-surface-edge">
            <Link href={blogUrl} className="btn btn-ghost">
              ← {t.backToBlog}
            </Link>
          </div>
        </div>
      </article>

      <CTABand lang={post.lang} />
    </>
  )
}
