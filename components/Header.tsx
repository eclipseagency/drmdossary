'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { type Lang } from '@/lib/content'
import { NAV_AR, NAV_EN, T, switchLanguageUrl } from '@/lib/i18n'

const LOGO = '/uploads/2024/02/logo.svg'

export function Header({ lang, pathname }: { lang: Lang; pathname: string }) {
  const t = T[lang]
  const nav = lang === 'ar' ? NAV_AR : NAV_EN
  const otherLangHref = switchLanguageUrl(pathname)
  const homeHref = lang === 'ar' ? '/' : '/en/'
  const bookHref = lang === 'ar' ? '/book/' : '/en/book/'

  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b transition-shadow duration-300',
        scrolled
          ? 'border-black/[0.06] shadow-[0_8px_24px_rgba(8,18,30,0.10)]'
          : 'border-black/[0.04] shadow-[0_2px_8px_rgba(8,18,30,0.04)]',
      )}
    >
      <div className="container">
        <div
          className={cn(
            'flex items-center gap-3 lg:gap-4',
            'py-2 sm:py-2.5',
          )}
        >
          {/* Brand */}
          <Link
            href={homeHref}
            className="flex items-center gap-2.5 ps-1.5 pe-3 sm:pe-4 py-1 rounded-full hover:bg-black/[0.03] transition-colors"
            aria-label={t.brandName}
          >
            <span
              className={cn(
                'flex items-center justify-center shrink-0 transition-all duration-300',
                scrolled ? 'h-14 w-14' : 'h-16 w-16',
              )}
            >
              <Image
                src={LOGO}
                alt=""
                width={64}
                height={64}
                priority
                className="h-full w-full object-contain"
              />
            </span>
            <span className="hidden sm:flex flex-col leading-tight">
              <span className="font-bold text-brand-900 text-[15px] tracking-tight">
                {t.brandName}
              </span>
              <span className="text-[11px] text-ink-muted">{t.brandTitle}</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex flex-1 items-center justify-center gap-0.5">
            {nav.map((item) => {
              const isActive =
                item.href === pathname ||
                (item.href !== homeHref && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-3 py-2 rounded-full text-[14.5px] font-semibold transition-colors',
                    isActive
                      ? 'text-brand-500'
                      : 'text-brand-900 hover:text-brand-500',
                  )}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-brand-500"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right cluster */}
          <div className="ms-auto flex items-center gap-2">
            <Link
              href={otherLangHref}
              className="hidden md:inline-flex items-center justify-center h-9 px-3.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-brand-900 text-[13px] font-semibold transition-colors"
            >
              {t.langSwitch}
            </Link>

            {/* Book pill, primary CTA with circular arrow disc */}
            <Link
              href={bookHref}
              className="hidden md:inline-flex items-center gap-2 ps-5 pe-1.5 py-1.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-[14.5px] shadow-[0_4px_14px_rgba(8,131,149,0.40)] transition-all hover:-translate-y-px"
            >
              <span className="whitespace-nowrap">{t.book}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-900/30">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={lang === 'ar' ? { transform: 'scaleX(-1)' } : undefined}
                >
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </span>
            </Link>

            {/* Mobile toggle */}
            <button
              className="lg:hidden inline-flex items-center justify-center h-11 w-11 rounded-full bg-black/[0.04] ring-1 ring-black/[0.05] text-brand-900 hover:bg-black/[0.08]"
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              >
                {open ? (
                  <>
                    <path d="M6 6l12 12" />
                    <path d="M6 18L18 6" />
                  </>
                ) : (
                  <>
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden pb-4 relative"
            >
              <ul className="flex flex-col gap-1 rounded-3xl bg-white/95 ring-1 ring-black/[0.05] shadow-[0_8px_24px_rgba(8,18,30,0.10)] p-3 backdrop-blur-md">
                {nav.map((item) => {
                  const isActive =
                    item.href === pathname ||
                    (item.href !== homeHref && pathname.startsWith(item.href))
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'block px-4 py-3 rounded-2xl font-semibold',
                          isActive
                            ? 'bg-brand-50 text-brand-500'
                            : 'text-brand-900 hover:bg-black/[0.04]',
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
                <li className="pt-2">
                  <Link
                    href={bookHref}
                    className="flex items-center justify-center gap-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3"
                  >
                    {t.book}
                  </Link>
                </li>
                <li>
                  <Link
                    href={otherLangHref}
                    className="block text-center py-3 text-brand-900 hover:text-brand-500 text-sm font-semibold"
                  >
                    {t.langSwitch}
                  </Link>
                </li>
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
