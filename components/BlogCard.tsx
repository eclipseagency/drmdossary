import Link from 'next/link'
import Image from 'next/image'
import { type PostEntry } from '@/lib/content'
import { T } from '@/lib/i18n'

export function BlogCard({ post }: { post: PostEntry }) {
  const t = T[post.lang]
  const excerpt = (post.seo_description || '').slice(0, 160)
  return (
    <article className="group h-full">
      <Link
        href={post.url}
        className="flex h-full flex-col overflow-hidden rounded-2xl bg-white border border-surface-edge shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300"
      >
        <div className="aspect-[16/9] overflow-hidden bg-surface-mid">
          {post.featured_image ? (
            <Image
              src={post.featured_image}
              alt=""
              width={640}
              height={360}
              sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-brand-soft" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5">
          <time className="text-xs text-ink-muted">{post.date.slice(0, 10)}</time>
          <h3 className="text-lg leading-tight text-brand-900 line-clamp-2 m-0">{post.title}</h3>
          {excerpt && <p className="text-sm text-ink-muted leading-relaxed m-0 line-clamp-3">{excerpt}</p>}
          <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-brand-600">
            {post.lang === 'ar' ? 'قراءة' : 'Read'}
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={post.lang === 'ar' ? { transform: 'scaleX(-1)' } : undefined}
              className="transition-transform duration-200 group-hover:translate-x-1"
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </Link>
    </article>
  )
}
