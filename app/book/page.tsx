import type { Metadata } from 'next'
import { BookPage } from '@/components/BookPage'

export const metadata: Metadata = {
  title: 'احجز معنا | د. محمد الدوسري',
  description:
    'احجز موعدك مع د. محمد الدوسري, استشاري طب وجراحة العيون. املأ نموذج الحجز ليتواصل معك فريقنا لتأكيد الموعد.',
  alternates: { canonical: 'https://drmdossary.com/book/' },
}

export default function Page() {
  return <BookPage lang="ar" />
}
