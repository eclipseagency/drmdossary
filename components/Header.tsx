'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { type Lang } from '@/lib/content'
import { NAV_AR, NAV_EN, T } from '@/lib/i18n'

const LOGO = '/uploads/2024/02/logo.svg'

export function Header({ lang, pathname }: { lang: Lang; pathname: string }) {
  const t = T[lang]
  const nav = lang === 'ar' ? NAV_AR : NAV_EN
  const otherLangHref = lang === 'ar' ? '/en/' : '/'
  const homeHref = lang === 'ar' ? '/' : '/en/'
  const bookHref = lang === 'ar' ? '/contact-us/' : '/en/contact-us/'

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
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/85 backdrop-blur-xl border-b border-surface-edge shadow-[0_2px_24px_rgba(8,18,30,0.06)]'
          : 'bg-white/40 backdrop-blur-md border-b border-transparent',
      )}
    >
      <div className="container">
        <div className="flex h-[68px] items-center gap-3 lg:gap-5">
          <Link href={homeHref} className="flex items-center gap-3 group" aria-label={t.brandName}>
            <span
              className={cn(
                'flex items-center justify-center rounded-full bg-brand-50 p-1.5 transition-all duration-300',
                scrolled ? 'h-10 w-10' : 'h-11 w-11',
              )}
            >
              <Image src={LOGO} alt="" width={44} height={44} priority className="h-full w-full object-contain" />
            </span>
            <span className="hidden sm:flex flex-col leading-tight">
              <span className="font-bold text-brand-900 text-[15px] tracking-tight">{t.brandName}</span>
              <span className="text-[12px] text-ink-muted">{t.brandTitle}</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex flex-1 items-center justify-center gap-1">
            {nav.map((item) => {
              const isActive =
                item.href === pathname ||
                (item.href !== homeHref && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-3 py-2 rounded-lg text-[15px] font-medium text-ink transition-colors',
                    isActive ? 'text-brand-600' : 'hover:text-brand-600',
                  )}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-2 -bottom-0.5 h-[2px] rounded-full bg-brand-500"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="ms-auto flex items-center gap-2">
            <Link
              href={otherLangHref}
              className="rounded-full border border-surface-edge px-3.5 py-1.5 text-sm font-semibold text-brand-600 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-colors"
            >
              {t.langSwitch}
            </Link>
            <Link
              href={bookHref}
              className="hidden md:inline-flex btn btn-primary text-sm py-2 px-4"
            >
              {t.book}
            </Link>

            {/* Mobile toggle */}
            <button
              className="lg:hidden inline-flex items-center justify-center h-11 w-11 rounded-xl border border-surface-edge"
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
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
              className="lg:hidden pb-4"
            >
              <ul className="flex flex-col gap-1">
                {nav.map((item) => {
                  const isActive =
                    item.href === pathname ||
                    (item.href !== homeHref && pathname.startsWith(item.href))
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'block px-4 py-3 rounded-xl font-medium',
                          isActive
                            ? 'bg-brand-50 text-brand-600'
                            : 'text-ink hover:bg-brand-50',
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
                <li className="pt-2">
                  <Link href={bookHref} className="btn btn-primary w-full justify-center">
                    {t.book}
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
