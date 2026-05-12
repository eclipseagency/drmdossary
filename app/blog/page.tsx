import type { Metadata } from 'next'
import { BlogIndex } from '@/components/BlogIndex'

export const metadata: Metadata = {
  title: 'المقالات | د. محمد الدوسري',
  description: 'أحدث المقالات الطبية في طب وجراحة العيون من د. محمد الدوسري.',
  alternates: { canonical: 'https://drmdossary.com/blog/' },
}

export default function Page() {
  return <BlogIndex lang="ar" />
}
