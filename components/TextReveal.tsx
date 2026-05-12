'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { type ReactNode } from 'react'

/**
 * Word-by-word entrance for headings and ledes.
 *
 * Splits the input text on whitespace, wraps each word in an inline-block
 * <motion.span> that animates from a small horizontal offset + faded out
 * into place, then staggers across the words.
 *
 * Word-level (not character-level) is intentional: Arabic letter
 * shaping/joining depends on adjacent characters being in the same
 * shaping context. Wrapping each letter in its own span would break
 * joining and render text as disconnected glyphs.
 *
 * If `prefers-reduced-motion` is set, the text renders plainly with no
 * animation.
 */
type TextRevealProps = {
  text: string
  /** Delay (ms) before the first word starts. */
  delay?: number
  /** Per-word stagger (ms). */
  step?: number
  /** Tailwind classes on the inline wrapper. */
  className?: string
  /** Initial x offset in px. Positive = comes from the right. */
  offset?: number
  /** Optional inline wrapper element. Default <span>. */
  as?: 'span' | 'div'
}

export function TextReveal({
  text,
  delay = 0,
  step = 45,
  className,
  offset = 14,
  as = 'span',
}: TextRevealProps) {
  const reduced = useReducedMotion()

  if (!text) return null
  if (reduced) {
    return as === 'div' ? <div className={className}>{text}</div> : <span className={className}>{text}</span>
  }

  // Split keeping whitespace tokens so the source text — including
  // multi-space gaps — round-trips exactly.
  const tokens = text.split(/(\s+)/)

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: delay / 1000,
        staggerChildren: step / 1000,
      },
    },
  }
  const wordVariants: Variants = {
    hidden: { opacity: 0, x: offset, y: 0, filter: 'blur(3px)' },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.45, ease: [0.22, 0.65, 0.32, 1] },
    },
  }

  const Comp = as === 'div' ? motion.div : motion.span

  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      variants={containerVariants}
      // The container itself should not animate filter — only its words.
      style={{ display: as === 'span' ? 'inline' : undefined }}
    >
      {tokens.map((tok, i) => {
        if (/^\s+$/.test(tok)) {
          // Preserve whitespace exactly so word spacing/RTL flow stays correct.
          // Use a non-breaking-aware plain span; no motion.
          return <span key={i}>{tok}</span>
        }
        return (
          <motion.span
            key={i}
            className="inline-block"
            variants={wordVariants}
            // will-change is automatically managed by Framer Motion for
            // animating properties.
          >
            {tok}
          </motion.span>
        )
      })}
    </Comp>
  )
}
