import type { Metadata } from 'next'
import { getPage } from '@/lib/content'
import { ServicePage } from '@/components/ServicePage'

const URL = '/treatment-of-cataracts/'

export function generateMetadata(): Metadata {
  const p = getPage(URL)
  return {
    title: p?.seo_title ?? p?.title,
    description: p?.seo_description,
    alternates: { canonical: `https://drmdossary.com${URL}` },
  }
}

export default function Page() {
  return <ServicePage url={URL} />
}
