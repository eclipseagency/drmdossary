import type { Metadata } from 'next'
import { HomeHero } from '@/components/home/HomeHero'
import { ServicesBento } from '@/components/home/ServicesBento'
import { AboutPreview } from '@/components/home/AboutPreview'
import { WhyUs } from '@/components/home/WhyUs'
import { Testimonials } from '@/components/home/Testimonials'
import { BlogPreview } from '@/components/home/BlogPreview'
import { HomeBooking } from '@/components/home/HomeBooking'

export const metadata: Metadata = {
  title: 'Dr Mohammad Al Dossary, Consultant Ophthalmologist | Riyadh',
  description:
    'Comprehensive ophthalmology care with Dr Mohammad Al Dossary, Saudi Board-certified and trained at King Khaled Eye Specialist Hospital. Vision correction, cataract treatment, and corneal surgery.',
  alternates: { canonical: 'https://drmdossary.com/en/' },
}

export default function HomeEN() {
  return (
    <>
      <HomeHero lang="en" />
      <AboutPreview lang="en" />
      <ServicesBento lang="en" />
      <WhyUs lang="en" />
      <Testimonials lang="en" />
      <BlogPreview lang="en" />
      <HomeBooking lang="en" />
    </>
  )
}
