'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Syncs the <html lang> / <html dir> attributes to the current pathname.
 * The root layout renders Arabic (rtl) as the SSR default; this flips
 * the attributes client-side when the user lands on or navigates into
 * the /en/ subtree.
 *
 * We deliberately leave the server-rendered defaults as Arabic and
 * suppress hydration warnings on <html>: the attribute mismatch on
 * /en/ pages is intentional and corrected synchronously on hydrate.
 */
export function DirSync() {
  const pathname = usePathname()
  useEffect(() => {
    const isEn = pathname.startsWith('/en')
    const lang = isEn ? 'en' : 'ar'
    const dir = isEn ? 'ltr' : 'rtl'
    if (document.documentElement.lang !== lang) {
      document.documentElement.lang = lang
    }
    if (document.documentElement.dir !== dir) {
      document.documentElement.dir = dir
    }
  }, [pathname])
  return null
}
