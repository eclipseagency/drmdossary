import type { Metadata } from 'next'
import { getPage } from '@/lib/content'
import { ContactPage } from '@/components/ContactPage'

const URL = '/contact-us/'

export function generateMetadata(): Metadata {
  const p = getPage(URL)
  return {
    title: p?.seo_title ?? p?.title ?? 'تواصل معنا',
    description: p?.seo_description,
    alternates: { canonical: `https://drmdossary.com${URL}` },
  }
}

export default function Page() {
  const p = getPage(URL)
  return <ContactPage lang="ar" title={p?.title || 'تواصل معنا'} />
}
