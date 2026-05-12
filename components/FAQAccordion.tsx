'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

type Item = { q: string; a: string }

/**
 * FAQ as a stylised chat thread.
 *
 *   Question = pill bubble on the patient (start) side, with a circular
 *   "+" toggle that rotates into an "×" when open.
 *   Answer  = soft reply bubble on the doctor (end) side, opening with
 *   a spring animation and a "typing"-style fade. Mimics WhatsApp.
 *
 * RTL-aware throughout: the start side is the right side in Arabic.
 */
export function FAQAccordion({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <FAQItem
            key={i}
            item={item}
            isOpen={isOpen}
            onToggle={() => setOpen(isOpen ? null : i)}
          />
        )
      })}
    </div>
  )
}

function FAQItem({
  item,
  isOpen,
  onToggle,
}: {
  item: Item
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex flex-col gap-2 sm:gap-2.5">
      {/* Question pill — aligned to the start side */}
      <div className="flex items-stretch justify-start gap-3 sm:gap-3.5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className={cn(
            'group relative flex flex-1 items-center justify-between gap-3 sm:gap-4',
            'max-w-[640px] rounded-full py-4 ps-6 pe-3 sm:py-4 sm:ps-7 sm:pe-3.5',
            'text-start text-[15px] sm:text-base font-semibold',
            'transition-all duration-300',
            isOpen
              ? 'bg-white text-brand-900 shadow-lift ring-1 ring-brand-300/40'
              : 'bg-white/85 text-brand-900 shadow-soft ring-1 ring-surface-edge hover:bg-white hover:shadow-lift hover:ring-brand-300/40',
          )}
        >
          <span className="leading-snug">{item.q}</span>

          <span
            aria-hidden
            className={cn(
              'flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full',
              'border transition-all duration-300',
              isOpen
                ? 'bg-gradient-brand-soft border-transparent text-white shadow-glow rotate-45'
                : 'bg-white border-surface-edge text-brand-600 group-hover:border-brand-400 group-hover:bg-brand-50',
            )}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </button>
      </div>

      {/* Answer reply bubble — aligned to the end side, like a WhatsApp reply */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ opacity: 0, y: -6, scale: 0.96, height: 0 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: 'auto',
              transition: {
                height: { duration: 0.35, ease: [0.22, 0.65, 0.32, 1] },
                opacity: { duration: 0.25, delay: 0.05 },
                y: { duration: 0.35, ease: [0.22, 0.65, 0.32, 1] },
                scale: { type: 'spring', stiffness: 320, damping: 28 },
              },
            }}
            exit={{
              opacity: 0,
              y: -4,
              scale: 0.96,
              height: 0,
              transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
            }}
            className="overflow-hidden"
          >
            <div className="flex items-stretch justify-end gap-3 sm:gap-3.5">
              <div className="relative max-w-[640px]">
                <span
                  aria-hidden
                  className="absolute -inset-1 -z-10 rounded-[28px] bg-[radial-gradient(circle_at_50%_100%,rgba(8,131,149,0.18),transparent_60%)] blur-md"
                />
                <div
                  className={cn(
                    'relative rounded-[22px] rounded-ee-md',
                    'bg-gradient-to-br from-brand-50 to-white',
                    'border border-brand-200/60 shadow-soft',
                    'px-5 py-4 sm:px-6 sm:py-5',
                  )}
                >
                  {/* WhatsApp-style tail on the end-bottom corner */}
                  <span
                    aria-hidden
                    className="absolute -bottom-0.5 end-[-6px] h-3 w-3 rotate-45 bg-white border-b border-e border-brand-200/60"
                  />
                  <p className="m-0 text-[15px] sm:text-[15.5px] leading-relaxed text-ink">{item.a}</p>
                  <div className="mt-2 flex items-center justify-end gap-1 text-2xs text-ink-muted">
                    <svg viewBox="0 0 16 12" width="14" height="11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M1 7l3 3 7-9" />
                      <path d="M6 7l3 3 6.5-9" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
