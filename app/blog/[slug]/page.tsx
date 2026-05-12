import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPosts, getPostBySlug } from '@/lib/content'
import { BlogPost } from '@/components/BlogPost'

export function generateStaticParams() {
  return getPosts('ar').map((p) => ({ slug: p.url.replace(/^\/blog\//, '').replace(/\/$/, '') }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug('ar', decodeURIComponent(slug))
  if (!post) return {}
  return {
    title: post.seo_title || post.title,
    description: post.seo_description,
    alternates: { canonical: `https://drmdossary.com${post.url}` },
    openGraph: post.featured_image
      ? { images: [post.featured_image] }
      : undefined,
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug('ar', decodeURIComponent(slug))
  if (!post) notFound()
  return <BlogPost post={post} />
}
