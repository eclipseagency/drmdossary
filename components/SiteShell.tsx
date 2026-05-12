'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Footer } from './Footer'
import { DirSync } from './DirSync'
import { langFromPath } from '@/lib/i18n'

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const lang = langFromPath(pathname)
  return (
    <>
      <DirSync />
      <Header lang={lang} pathname={pathname} />
      <main id="main">{children}</main>
      <Footer lang={lang} />
    </>
  )
}
