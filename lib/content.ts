import fs from 'node:fs'
import path from 'node:path'

export type Lang = 'ar' | 'en'

export type PageEntry = {
  url: string
  lang: Lang
  type: 'home' | 'page'
  title: string
  seo_title: string
  seo_description: string
  body_html: string
}

export type PostEntry = {
  url: string
  slug: string
  lang: Lang
  type: 'post'
  title: string
  date: string
  featured_image: string | null
  seo_title: string
  seo_description: string
  body_html: string
}

type ContentFile = {
  pages: PageEntry[]
  posts: PostEntry[]
}

let cached: ContentFile | null = null

export function getContent(): ContentFile {
  if (!cached) {
    const p = path.join(process.cwd(), 'data', 'content.json')
    cached = JSON.parse(fs.readFileSync(p, 'utf-8')) as ContentFile
  }
  return cached
}

export function getPage(url: string): PageEntry | undefined {
  return getContent().pages.find((p) => p.url === url)
}

export function getPosts(lang: Lang): PostEntry[] {
  return getContent().posts.filter((p) => p.lang === lang)
}

export function getPostBySlug(lang: Lang, slug: string): PostEntry | undefined {
  return getContent().posts.find(
    (p) => p.lang === lang && (p.slug === slug || p.url.endsWith(`/${slug}/`)),
  )
}
