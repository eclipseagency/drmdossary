import type { Metadata } from 'next'
import { BookPage } from '@/components/BookPage'

export const metadata: Metadata = {
  title: 'Book with us | Dr Mohammad Al Dossary',
  description:
    'Book your appointment with Dr Mohammad Al Dossary, consultant ophthalmologist. Fill out the booking form and our team will get back to you to confirm.',
  alternates: { canonical: 'https://drmdossary.com/en/book/' },
}

export default function Page() {
  return <BookPage lang="en" />
}
