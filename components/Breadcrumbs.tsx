import Link from 'next/link'
import { type Lang } from '@/lib/content'
import { T } from '@/lib/i18n'

export function Breadcrumbs({
  lang,
  items,
}: {
  lang: Lang
  items: Array<{ href?: string; label: string }>
}) {
  const t = T[lang]
  const homeHref = lang === 'ar' ? '/' : '/en/'
  const list: Array<{ href?: string; label: string }> = [{ href: homeHref, label: t.home }, ...items]

  return (
    <nav aria-label="breadcrumb" className="border-b border-surface-edge bg-white">
      <div className="container">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2 py-3.5 text-sm text-ink-muted m-0">
          {list.map((item, i) => {
            const isLast = i === list.length - 1
            return (
              <li key={i} className="flex items-center gap-1.5">
                {item.href && !isLast ? (
                  <Link href={item.href} className="hover:text-brand-600 transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-brand-900 font-semibold">
                    {item.label}
                  </span>
                )}
                {!isLast && (
                  <span aria-hidden className="text-surface-edge">
                    ›
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
