import type { Metadata } from 'next'
import { BlogIndex } from '@/components/BlogIndex'

export const metadata: Metadata = {
  title: 'Blog | Dr Mohammad Al Dossary',
  description: 'Latest medical insight on ophthalmology and eye care from Dr Mohammad Al Dossary.',
  alternates: { canonical: 'https://drmdossary.com/en/blog/' },
}

export default function Page() {
  return <BlogIndex lang="en" />
}
