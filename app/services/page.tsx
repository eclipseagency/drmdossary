import type { Metadata } from 'next'
import { getPage } from '@/lib/content'
import { ServicesIndex } from '@/components/ServicesIndex'

export function generateMetadata(): Metadata {
  const p = getPage('/services/')
  return {
    title: p?.seo_title ?? p?.title,
    description: p?.seo_description,
    alternates: { canonical: 'https://drmdossary.com/services/' },
  }
}

export default function ServicesAR() {
  return <ServicesIndex lang="ar" />
}
