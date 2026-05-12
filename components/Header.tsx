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
        'sticky top-0 z-50 transition-colors duration-300',
        scrolled ? 'bg-brand-900' : 'bg-brand-900/95 backdrop-blur',
      )}
    >
      {/* Subtle chevron texture on the bar */}
      <span
        aria-hidden
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='20' viewBox='0 0 40 20'><path d='M0 20 L20 0 L40 20' fill='none' stroke='%23ffffff' stroke-width='1' opacity='0.5'/></svg>\")",
        }}
      />

      <div className="container relative">
        <div
          className={cn(
            'flex items-center gap-3 lg:gap-4',
            'my-3 md:my-4',
            'rounded-full bg-white/[0.07] ring-1 ring-white/10',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
            'pl-2 pr-2 sm:pl-2.5 sm:pr-2.5',
            'py-2',
          )}
        >
          {/* Brand */}
          <Link
            href={homeHref}
            className="flex items-center gap-2.5 ps-2 pe-3 sm:pe-4 py-1 rounded-full hover:bg-white/5 transition-colors"
            aria-label={t.brandName}
          >
            <span
              className={cn(
                'flex items-center justify-center rounded-full bg-brand-500 p-1.5 shrink-0 transition-all duration-300',
                scrolled ? 'h-9 w-9' : 'h-10 w-10',
              )}
            >
              <Image
                src={LOGO}
                alt=""
                width={40}
                height={40}
                priority
                className="h-full w-full object-contain"
              />
            </span>
            <span className="hidden sm:flex flex-col leading-tight">
              <span className="font-bold text-white text-[15px] tracking-tight">
                {t.brandName}
              </span>
              <span className="text-[11px] text-white/60">{t.brandTitle}</span>
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
                    'relative px-3 py-2 rounded-full text-[14.5px] font-medium transition-colors',
                    isActive
                      ? 'text-white bg-white/10'
                      : 'text-white/80 hover:text-white hover:bg-white/5',
                  )}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-brand-400"
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
              className="hidden md:inline-flex items-center justify-center h-9 px-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white/85 text-[13px] font-semibold transition-colors"
            >
              {t.langSwitch}
            </Link>

            {/* Book pill — primary CTA with circular arrow disc */}
            <Link
              href={bookHref}
              className="hidden md:inline-flex items-center gap-2 ps-5 pe-1.5 py-1.5 rounded-full bg-brand-500 hover:bg-brand-400 text-white font-bold text-[14.5px] shadow-[0_4px_14px_rgba(8,131,149,0.45)] transition-all hover:-translate-y-px"
            >
              <span className="whitespace-nowrap">{t.book}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-900/40">
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
              className="lg:hidden inline-flex items-center justify-center h-11 w-11 rounded-full bg-white/5 ring-1 ring-white/10 text-white hover:bg-white/10"
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
              <ul className="flex flex-col gap-1 rounded-3xl bg-white/[0.07] ring-1 ring-white/10 p-3">
                {nav.map((item) => {
                  const isActive =
                    item.href === pathname ||
                    (item.href !== homeHref && pathname.startsWith(item.href))
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'block px-4 py-3 rounded-2xl font-medium',
                          isActive
                            ? 'bg-brand-500/30 text-white'
                            : 'text-white/85 hover:bg-white/5 hover:text-white',
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
                    className="flex items-center justify-center gap-2 rounded-full bg-brand-500 hover:bg-brand-400 text-white font-bold py-3"
                  >
                    {t.book}
                  </Link>
                </li>
                <li>
                  <Link
                    href={otherLangHref}
                    className="block text-center py-3 text-white/80 hover:text-white text-sm font-semibold"
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
