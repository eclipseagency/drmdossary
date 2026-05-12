'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { type ReactNode } from 'react'

const variants: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 0.65, 0.32, 1] },
  },
}

const popVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.86 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.34, 1.56, 0.64, 1] },
  },
}

type RevealProps = {
  children: ReactNode
  delay?: number
  pop?: boolean
  className?: string
  as?: 'div' | 'section' | 'article' | 'li' | 'span'
}

export function Reveal({ children, delay = 0, pop = false, className, as = 'div' }: RevealProps) {
  const reduced = useReducedMotion()
  const v = pop ? popVariants : variants
  const Comp = motion[as] as typeof motion.div
  return (
    <Comp
      className={className}
      initial={reduced ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.12, margin: '0px 0px -8% 0px' }}
      variants={v}
      transition={{ delay: reduced ? 0 : delay / 1000 }}
    >
      {children}
    </Comp>
  )
}

/** Container that staggers children at a given step (ms). */
export function RevealStagger({
  children,
  step = 80,
  className,
}: {
  children: ReactNode[]
  step?: number
  className?: string
}) {
  return (
    <div className={className}>
      {children.map((c, i) => (
        <Reveal key={i} delay={i * step}>
          {c}
        </Reveal>
      ))}
    </div>
  )
}
