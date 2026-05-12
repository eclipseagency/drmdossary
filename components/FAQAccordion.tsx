'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

type Item = { q: string; a: string }

export function FAQAccordion({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div
            key={i}
            className={cn(
              'rounded-2xl border bg-white px-5 transition-all duration-200',
              isOpen
                ? 'border-brand-400/50 shadow-lift'
                : 'border-surface-edge shadow-soft hover:border-brand-400/30',
            )}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-4 text-start"
            >
              <span className="text-base md:text-lg font-bold text-brand-900">{item.q}</span>
              <span
                aria-hidden
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500 transition-transform duration-300',
                  isOpen && 'rotate-180',
                )}
              >
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 0.65, 0.32, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 m-0 text-ink leading-relaxed">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
