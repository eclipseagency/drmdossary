import type { MetadataRoute } from 'next'
import { getContent } from '@/lib/content'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://drmdossary.com'
  const { pages, posts } = getContent()
  const urls: MetadataRoute.Sitemap = []
  const seen = new Set<string>()
  const add = (url: string, priority = 0.7, freq: 'daily' | 'weekly' | 'monthly' = 'weekly') => {
    if (seen.has(url)) return
    seen.add(url)
    urls.push({ url: base + url, priority, changeFrequency: freq, lastModified: new Date() })
  }
  // Routes that no longer exist as standalone pages, they redirect to /book/.
  const removed = new Set(['/contact-us/', '/en/contact-us/'])
  add('/', 1.0, 'weekly')
  add('/en/', 0.9, 'weekly')
  for (const p of pages) {
    if (removed.has(p.url)) continue
    add(p.url, p.url === '/' ? 1 : 0.8, 'monthly')
  }
  add('/blog/', 0.9, 'daily')
  add('/en/blog/', 0.9, 'daily')
  add('/book/', 0.9, 'monthly')
  add('/en/book/', 0.9, 'monthly')
  for (const p of posts) add(p.url, 0.6, 'monthly')
  return urls
}
