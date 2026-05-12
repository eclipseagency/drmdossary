import type { Metadata } from 'next'
import { HomeHero } from '@/components/home/HomeHero'
import { ServicesBento } from '@/components/home/ServicesBento'
import { AboutPreview } from '@/components/home/AboutPreview'
import { WhyUs } from '@/components/home/WhyUs'
import { Testimonials } from '@/components/home/Testimonials'
import { BlogPreview } from '@/components/home/BlogPreview'
import { CTABand } from '@/components/CTABand'

export const metadata: Metadata = {
  title: 'د. محمد الدوسري — استشاري طب وجراحة العيون | الرياض',
  description:
    'رعاية شاملة لطب وجراحة العيون مع د. محمد الدوسري — البورد السعودي وزمالة من مستشفى الملك خالد التخصصي للعيون. تصحيح نظر، علاج مياه بيضاء، وجراحات قرنية.',
  alternates: { canonical: 'https://drmdossary.com/' },
}

export default function HomeAR() {
  return (
    <>
      <HomeHero lang="ar" />
      <AboutPreview lang="ar" />
      <ServicesBento lang="ar" />
      <WhyUs lang="ar" />
      <Testimonials lang="ar" />
      <BlogPreview lang="ar" />
      <CTABand lang="ar" />
    </>
  )
}
